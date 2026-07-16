"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { YEAR1_RATE, TRAILING_RATE, BADGE_TIER_META, REFERRAL_HAMPER_VALUE } from "@/lib/enums";
import type { LeadStage, BadgeTier, UserRole } from "@/lib/enums";
import { notifyPartnerUsers } from "@/lib/notify";
import { formatINR, quarterLabel, quarterStart } from "@/lib/utils";
import { getAuthedUser, getSession } from "@/lib/auth";
import { canManageLeads, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { fireLeadClosedWebhook } from "@/app/actions/integrations";
import { pickNextSalesRep } from "@/lib/assignment";
import { notifyInternalUsers } from "@/lib/notify";
import { findConflictingLead, conflictErrorMessage } from "@/lib/lead-conflict";
import { computeLeadScore } from "@/lib/lead-scoring";

const TIER_ORDER: Exclude<BadgeTier, "NONE">[] = ["SILVER", "GOLD", "PLATINUM"];

/** Partner: add a single client lead one at a time, as an alternative to
 * the bulk CSV upload — same destination (the Lead pipeline), just a
 * lighter-weight entry point for a one-off referral. */
export async function addLeadManuallyAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) {
    return { ok: false, error: "You must be signed in as an advisor." };
  }

  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!businessName || !contactName || !phone || !email) {
    return { ok: false, error: "Please fill in business name, contact name, phone and email." };
  }

  const conflict = await findConflictingLead(phone, session.partnerId);
  if (conflict) {
    return { ok: false, error: conflictErrorMessage(conflict.partner.firmName) };
  }

  const assignedToId = await pickNextSalesRep();
  const createdAt = new Date();

  await db.lead.create({
    data: {
      partnerId: session.partnerId,
      businessName,
      contactName,
      phone,
      email,
      source: "PARTNER_MANUAL",
      stage: "CAPTURED",
      assignedToId,
      createdAt,
      score: computeLeadScore({
        source: "PARTNER_MANUAL",
        stage: "CAPTURED",
        dealValue: 0,
        createdAt,
        contactedAt: null,
      }),
    },
  });

  await notifyInternalUsers(["ADMIN", "OMNICARD_TEAM"], {
    type: "LEAD_CAPTURED",
    title: `New lead: ${businessName}`,
    href: "/admin/leads",
  });

  revalidatePath("/partner/leads");
  return { ok: true };
}

/** Step 6 — advance a lead through the sales pipeline; closing triggers
 * commissions (Step 6.6 / Step 10) and milestone badge checks (Step 4/8).
 * Stage-change validation: closing Won requires a deal value already set;
 * closing Lost requires a loss reason. */
export async function advanceLeadStageAction(
  leadId: string,
  stage: LeadStage,
  lossReason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const actor = await getAuthedUser();
  if (!actor || !canManageLeads(actor.role as UserRole)) {
    throw new ForbiddenError("manage leads");
  }

  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });

  if (stage === "CLOSED_WON" && lead.dealValue <= 0) {
    return { ok: false, error: "Set a deal value before closing this lead as won." };
  }
  if (stage === "CLOSED_LOST" && !lossReason?.trim()) {
    return { ok: false, error: "A loss reason is required to close this lead as lost." };
  }

  const data: {
    stage: LeadStage;
    contactedAt?: Date;
    demoAt?: Date;
    closedAt?: Date;
    lossReason?: string;
    score?: number;
  } = { stage };
  if (stage === "CONTACTED" && !lead.contactedAt) data.contactedAt = new Date();
  if (stage === "DEMO" && !lead.demoAt) data.demoAt = new Date();
  if (stage === "CLOSED_WON") data.closedAt = new Date();
  if (stage === "CLOSED_LOST") data.lossReason = lossReason!.trim();

  data.score = computeLeadScore({
    source: lead.source,
    stage,
    dealValue: lead.dealValue,
    createdAt: lead.createdAt,
    contactedAt: data.contactedAt ?? lead.contactedAt,
  });

  await db.lead.update({ where: { id: leadId }, data });

  if (stage === "CLOSED_WON") {
    await db.commission.create({
      data: {
        partnerId: lead.partnerId,
        leadId: lead.id,
        type: "YEAR1",
        amount: Math.round(lead.dealValue * YEAR1_RATE),
        status: "CREDITED",
        creditedAt: new Date(),
      },
    });
    await db.commission.create({
      data: {
        partnerId: lead.partnerId,
        leadId: lead.id,
        type: "TRAILING",
        amount: Math.round(lead.dealValue * TRAILING_RATE),
        status: "CREDITED",
        creditedAt: new Date(),
      },
    });

    const partner = await db.partner.findUniqueOrThrow({
      where: { id: lead.partnerId },
    });
    if (partner.stage === "CERTIFIED") {
      await db.partner.update({
        where: { id: partner.id },
        data: { stage: "ACTIVE" },
      });
    }

    await checkMilestoneBadges(lead.partnerId);
    await checkReferralBonus(lead.partnerId);

    const total = Math.round(lead.dealValue * (YEAR1_RATE + TRAILING_RATE));
    await notifyPartnerUsers(lead.partnerId, {
      type: "COMMISSION_CREDITED",
      title: `${formatINR(total)} credited for ${lead.businessName}`,
      body: "Year-1 and trailing commission have been credited to your wallet.",
      href: "/partner/leads",
    });

    await fireLeadClosedWebhook(lead.partnerId, {
      id: lead.id,
      businessName: lead.businessName,
      dealValue: lead.dealValue,
    });
  }

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "ADVANCE_LEAD_STAGE",
    targetType: "Lead",
    targetId: leadId,
    meta: `${lead.businessName} -> ${stage}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/admin/partners/${lead.partnerId}`);
  revalidatePath("/partner/leads");

  return { ok: true };
}

/** Admin/OmniCard Team only: finalize the commercials on a lead — deal
 * value, billing cycle and business-size category. The advisor never sets
 * these; they just refer the lead and see the finalized numbers here for
 * transparency. */
export async function updateLeadCommercialsAction(leadId: string, formData: FormData) {
  const actor = await getAuthedUser();
  if (!actor || !canManageLeads(actor.role as UserRole)) {
    throw new ForbiddenError("finalize lead commercials");
  }

  const dealValue = Math.max(0, Math.round(Number(formData.get("dealValue") ?? 0)));
  const billingCycle = String(formData.get("billingCycle") ?? "ANNUAL");
  const category = String(formData.get("category") ?? "").trim() || null;

  const lead = await db.lead.update({
    where: { id: leadId },
    data: { dealValue, billingCycle, category },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "UPDATE_LEAD_COMMERCIALS",
    targetType: "Lead",
    targetId: leadId,
    meta: `${lead.businessName} -> ${formatINR(dealValue)} (${billingCycle}${category ? `, ${category}` : ""})`,
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/partner/leads");
}

/** Admin: manually reassign a lead to a different sales rep, overriding the
 * automatic round-robin assignment. */
export async function reassignLeadAction(leadId: string, assignedToId: string) {
  const actor = await getAuthedUser();
  if (!actor || !canManageLeads(actor.role as UserRole)) {
    throw new ForbiddenError("reassign leads");
  }

  const lead = await db.lead.update({
    where: { id: leadId },
    data: { assignedToId: assignedToId || null },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REASSIGN_LEAD",
    targetType: "Lead",
    targetId: leadId,
    meta: `${lead.businessName} -> ${assignedToId || "unassigned"}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/ops");
}

async function checkMilestoneBadges(partnerId: string) {
  const now = new Date();
  const quarter = quarterLabel(now);

  const clientsThisQuarter = await db.lead.count({
    where: {
      partnerId,
      stage: "CLOSED_WON",
      closedAt: { gte: quarterStart(now) },
    },
  });

  for (const tier of TIER_ORDER) {
    const threshold = BADGE_TIER_META[tier].threshold;
    if (clientsThisQuarter < threshold) continue;

    const existing = await db.badge.findUnique({
      where: { partnerId_quarter_tier: { partnerId, quarter, tier } },
    });
    if (existing) continue;

    await db.badge.create({
      data: { partnerId, tier, quarter, clientsAtMilestone: clientsThisQuarter },
    });
    await db.partner.update({ where: { id: partnerId }, data: { badgeTier: tier, tierUpdatedAt: new Date() } });

    await notifyPartnerUsers(partnerId, {
      type: "BADGE_EARNED",
      title: `${tier} Advisor badge earned!`,
      body: `${clientsThisQuarter} clients closed this quarter — ${BADGE_TIER_META[tier].gift}.`,
      href: "/partner/achievements",
    });
  }
}

/** Both the referring and the referred advisor get a surprise hamper the
 * moment the referred advisor's first client activates — fires once, on
 * that advisor's first-ever closed-won lead. */
async function checkReferralBonus(partnerId: string) {
  const partner = await db.partner.findUniqueOrThrow({ where: { id: partnerId } });
  if (!partner.referredById) return;

  const closedWonCount = await db.lead.count({ where: { partnerId, stage: "CLOSED_WON" } });
  if (closedWonCount !== 1) return;

  const existing = await db.referralBonus.findFirst({
    where: { referrerId: partner.referredById, referredId: partner.id },
  });
  if (existing) return;

  await db.referralBonus.create({
    data: { referrerId: partner.referredById, referredId: partner.id, amount: REFERRAL_HAMPER_VALUE, status: "PENDING" },
  });

  await notifyPartnerUsers(partner.referredById, {
    type: "REFERRAL_HAMPER_EARNED",
    title: `${partner.firmName} closed their first client — you've both earned a surprise hamper!`,
    href: "/partner/achievements?tab=refer",
  });
  await notifyPartnerUsers(partner.id, {
    type: "REFERRAL_HAMPER_EARNED",
    title: "You and the advisor who referred you have each earned a surprise hamper on your first client activation!",
    href: "/partner/achievements?tab=refer",
  });
}
