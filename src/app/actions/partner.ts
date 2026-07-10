"use server";

import { db } from "@/lib/db";
import { slugify, randomReferralCode } from "@/lib/slug";
import { ASSET_KEYS, CURRENT_MOU_VERSION } from "@/lib/enums";
import type { UserRole } from "@/lib/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedUser, hashPassword } from "@/lib/auth";
import { notifyPartnerUsers } from "@/lib/notify";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

async function requirePartnerManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage partners");
  }
  return user;
}

const DEFAULT_PARTNER_PASSWORD = "omnicard123";

/** Step 1.2 — CA interest capture from the public microsite. */
export async function signupPartnerAction(formData: FormData) {
  const firmName = String(formData.get("firmName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const icaiNumber = String(formData.get("icaiNumber") ?? "").trim() || null;

  if (!firmName || !contactName || !email || !phone || !city || !state) {
    redirect("/signup?error=missing");
  }

  const existing = await db.partner.findUnique({ where: { email } });
  if (existing) {
    redirect(`/signup?error=exists`);
  }

  let slug = slugify(firmName);
  const slugTaken = await db.partner.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const partner = await db.partner.create({
    data: {
      firmName,
      contactName,
      email,
      phone,
      city,
      state,
      icaiNumber,
      slug,
      referralCode: randomReferralCode(firmName),
      stage: "LEAD",
    },
  });

  await db.activityEvent.create({
    data: { partnerId: partner.id, type: "CLICK", meta: "microsite_signup" },
  });

  redirect(`/signup/thank-you?slug=${partner.slug}`);
}

/**
 * Homepage "Join the Initiative" MOU — captures the same interest-lead data
 * as signupPartnerAction (Step 1.2) but returns a result instead of
 * redirecting, so the modal can show an inline signed confirmation without
 * navigating away from the document.
 */
export async function signMouAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const firmName = String(formData.get("firmName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const designation = String(formData.get("designation") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const icaiNumber = String(formData.get("icaiNumber") ?? "").trim() || null;

  if (!firmName || !contactName || !email || !phone || !city || !state) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  const existing = await db.partner.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An advisor account with this email already exists." };
  }

  let slug = slugify(firmName);
  const slugTaken = await db.partner.findUnique({ where: { slug } });
  if (slugTaken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const partner = await db.partner.create({
    data: {
      firmName,
      contactName,
      email,
      phone,
      city,
      state,
      icaiNumber,
      slug,
      referralCode: randomReferralCode(firmName),
      stage: "LEAD",
      mouVersion: CURRENT_MOU_VERSION,
    },
  });

  await db.activityEvent.create({
    data: {
      partnerId: partner.id,
      type: "CLICK",
      meta: `mou_signed:${designation || "Authorized Signatory"}`,
    },
  });

  return { ok: true };
}

/** Step 6.1 — client lead captured on a CA's co-branded landing page. */
export async function captureLeadAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const source = String(formData.get("source") ?? "MICROSITE");

  if (!partnerId || !businessName || !contactName || !phone) {
    return;
  }

  await db.lead.create({
    data: {
      partnerId,
      businessName,
      contactName,
      email,
      phone,
      source,
      stage: "CAPTURED",
    },
  });

  await db.activityEvent.create({
    data: { partnerId, type: "CLICK", meta: `lead_captured:${source}` },
  });

  revalidatePath("/partner/leads");
}

/** Admin: move a partner through onboarding — Step 1.4 / Step 4 certification. */
export async function certifyPartnerAction(partnerId: string) {
  const actor = await requirePartnerManager();

  const partner = await db.partner.update({
    where: { id: partnerId },
    data: {
      stage: "CERTIFIED",
      icaiVerified: true,
      msaSignedAt: new Date(),
      demoAttendedAt: new Date(),
      certifiedAt: new Date(),
    },
  });

  await db.assetKitItem.createMany({
    data: ASSET_KEYS.map((key) => ({
      partnerId: partner.id,
      key,
      owner:
        key === "CERTIFICATE_BADGE" || key === "FIRST_CAMPAIGN_DRAFT"
          ? "Auto (CRM)"
          : "Marketing Ops",
      dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })),
  });

  await db.assetKitItem.update({
    where: { partnerId_key: { partnerId: partner.id, key: "CERTIFICATE_BADGE" } },
    data: { status: "DELIVERED", deliveredAt: new Date() },
  });

  await db.activityEvent.create({
    data: { partnerId: partner.id, type: "WEBINAR_ATTEND", meta: "demo_certified" },
  });

  const existingUser = await db.user.findFirst({ where: { partnerId } });
  if (!existingUser) {
    await db.user.create({
      data: {
        email: partner.email,
        passwordHash: await hashPassword(DEFAULT_PARTNER_PASSWORD),
        name: partner.contactName,
        role: "CA",
        partnerId: partner.id,
        firmRole: "OWNER",
        mustChangePassword: true,
      },
    });
  }

  await notifyPartnerUsers(partner.id, {
    type: "CERTIFIED",
    title: "You're certified!",
    body: "Your Implementation Advisor badge and asset kit are ready.",
    href: "/partner/assets",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "CERTIFY_PARTNER",
    targetType: "Partner",
    targetId: partner.id,
    meta: partner.firmName,
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
}

/** Admin: advance a partner from Lead through the meeting/onboarding stages. */
export async function advancePartnerStageAction(
  partnerId: string,
  stage: "MEETING_SCHEDULED" | "ONBOARDING",
) {
  const actor = await requirePartnerManager();

  const partner = await db.partner.update({ where: { id: partnerId }, data: { stage } });
  await db.activityEvent.create({
    data: { partnerId, type: "CLICK", meta: `stage:${stage}` },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "ADVANCE_PARTNER_STAGE",
    targetType: "Partner",
    targetId: partnerId,
    meta: `${partner.firmName} -> ${stage}`,
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
}
