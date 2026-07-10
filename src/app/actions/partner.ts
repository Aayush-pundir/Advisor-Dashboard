"use server";

import { db } from "@/lib/db";
import { slugify, randomReferralCode } from "@/lib/slug";
import { ASSET_KEYS, CURRENT_MOU_VERSION } from "@/lib/enums";
import type { UserRole } from "@/lib/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthedUser, getSession, hashPassword } from "@/lib/auth";
import { notifyPartnerUsers, notifyInternalUsers } from "@/lib/notify";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { pickNextSalesRep } from "@/lib/assignment";

async function requirePartnerManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage partners");
  }
  return user;
}

function generateTempPassword() {
  return `omc-${Math.random().toString(36).slice(2, 8)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Creates the partner's login the moment they submit interest (MOU or
 * signup form) — not at certification — so they can sign in immediately
 * and track their own onboarding status instead of waiting in the dark
 * until an admin certifies them. No email provider is configured, so the
 * temp password is surfaced directly on screen ("dev mode"), same pattern
 * as the forgot-password reset link.
 */
async function createPartnerLogin(partner: { id: string; email: string; contactName: string }) {
  const tempPassword = generateTempPassword();
  await db.user.create({
    data: {
      email: partner.email,
      passwordHash: await hashPassword(tempPassword),
      name: partner.contactName,
      role: "CA",
      partnerId: partner.id,
      firmRole: "OWNER",
      mustChangePassword: true,
    },
  });
  return tempPassword;
}

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

  const tempPassword = await createPartnerLogin(partner);

  redirect(`/signup/thank-you?slug=${partner.slug}&temp=${encodeURIComponent(tempPassword)}`);
}

/**
 * Homepage "Join the Initiative" MOU — captures the same interest-lead data
 * as signupPartnerAction (Step 1.2) but returns a result instead of
 * redirecting, so the modal can show an inline signed confirmation without
 * navigating away from the document.
 */
export async function signMouAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; tempPassword?: string }> {
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
      designation: designation || "Authorized Signatory",
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

  const tempPassword = await createPartnerLogin(partner);

  return { ok: true, tempPassword };
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

  const assignedToId = await pickNextSalesRep();

  await db.lead.create({
    data: {
      partnerId,
      businessName,
      contactName,
      email,
      phone,
      source,
      stage: "CAPTURED",
      assignedToId,
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
    await createPartnerLogin(partner);
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

/** Admin: accept a submitted MOU/lead and schedule the intro call — the
 * first review step in the advisor onboarding journey. */
export async function acceptPartnerLeadAction(partnerId: string) {
  const actor = await requirePartnerManager();

  const partner = await db.partner.update({
    where: { id: partnerId },
    data: { stage: "MEETING_SCHEDULED", acceptedAt: new Date() },
  });

  await notifyPartnerUsers(partner.id, {
    type: "PARTNER_ACCEPTED",
    title: "Your application has been accepted!",
    body: "The OmniCard partnerships team will reach out to schedule an intro call.",
    href: "/partner",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "ACCEPT_PARTNER_LEAD",
    targetType: "Partner",
    targetId: partnerId,
    meta: partner.firmName,
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/partner");
}

/** Admin: countersign the MOU on OmniCard's side. */
export async function countersignMouAction(partnerId: string) {
  const actor = await requirePartnerManager();

  const partner = await db.partner.update({
    where: { id: partnerId },
    data: { mouCountersignedAt: new Date(), stage: "ONBOARDING", icaiVerified: true, msaSignedAt: new Date() },
  });

  await notifyPartnerUsers(partner.id, {
    type: "MOU_COUNTERSIGNED",
    title: "Your MOU has been countersigned",
    body: "Next step: complete your certification demo. Request a slot any time from your dashboard.",
    href: "/partner",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "COUNTERSIGN_MOU",
    targetType: "Partner",
    targetId: partnerId,
    meta: partner.firmName,
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/partner");
}

/** Admin: schedule (or nudge for) the certification demo — works whether the
 * partner requested it first or the team is proactively reaching out. */
export async function scheduleDemoAction(partnerId: string, demoDate: string) {
  const actor = await requirePartnerManager();

  const demoScheduledAt = demoDate ? new Date(demoDate) : new Date();
  const partner = await db.partner.update({
    where: { id: partnerId },
    data: { demoScheduledAt },
  });

  await notifyPartnerUsers(partner.id, {
    type: "DEMO_SCHEDULED",
    title: "Your certification demo is scheduled",
    body: `Scheduled for ${demoScheduledAt.toLocaleDateString("en-IN")} — attend it to get certified.`,
    href: "/partner",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "SCHEDULE_DEMO",
    targetType: "Partner",
    targetId: partnerId,
    meta: `${partner.firmName} -> ${demoScheduledAt.toISOString()}`,
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/partner");
}

/** Partner: request a certification demo slot — the other direction of
 * scheduleDemoAction, for when the partner wants to move faster than the
 * team reaching out to them. */
export async function requestDemoAction() {
  const session = await getSession();
  if (!session?.partnerId) return;

  const partner = await db.partner.update({
    where: { id: session.partnerId },
    data: { demoRequestedAt: new Date() },
  });

  await notifyInternalUsers(["ADMIN", "PARTNER_MANAGER"], {
    type: "DEMO_REQUESTED",
    title: `${partner.firmName} requested a certification demo`,
    href: `/admin/partners/${partner.id}`,
  });

  revalidatePath("/partner");
  revalidatePath(`/admin/partners/${partner.id}`);
}
