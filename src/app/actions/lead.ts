"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { YEAR1_RATE, TRAILING_RATE, BADGE_TIER_META } from "@/lib/enums";
import type { LeadStage, BadgeTier } from "@/lib/enums";

const TIER_ORDER: Exclude<BadgeTier, "NONE">[] = ["SILVER", "GOLD", "PLATINUM"];

function quarterLabel(d: Date) {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

/** Step 6 — advance a lead through the sales pipeline; closing triggers
 * commissions (Step 6.6 / Step 10) and milestone badge checks (Step 4/8). */
export async function advanceLeadStageAction(leadId: string, stage: LeadStage) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });

  const data: { stage: LeadStage; contactedAt?: Date; demoAt?: Date; closedAt?: Date } = {
    stage,
  };
  if (stage === "CONTACTED" && !lead.contactedAt) data.contactedAt = new Date();
  if (stage === "DEMO" && !lead.demoAt) data.demoAt = new Date();
  if (stage === "CLOSED_WON") data.closedAt = new Date();

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
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/partners/${lead.partnerId}`);
  revalidatePath("/partner/leads");
}

async function checkMilestoneBadges(partnerId: string) {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
  const quarter = quarterLabel(now);

  const clientsThisQuarter = await db.lead.count({
    where: {
      partnerId,
      stage: "CLOSED_WON",
      closedAt: { gte: quarterStart },
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
    await db.partner.update({ where: { id: partnerId }, data: { badgeTier: tier } });
  }
}
