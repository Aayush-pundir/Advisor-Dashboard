"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser, getSession } from "@/lib/auth";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyInternalUsers, notifyPartnerUsers } from "@/lib/notify";
import { DEAL_PROTECTION_DAYS } from "@/lib/enums";
import type { UserRole } from "@/lib/enums";

async function requirePartnerManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage deal registrations");
  }
  return user;
}

function activeDealWhere(phone: string) {
  return {
    phone,
    status: { in: ["PENDING", "APPROVED"] },
    expiresAt: { gt: new Date() },
  };
}

/** Step: channel-conflict protection — a partner locks in attribution on a
 * prospect (by phone number) before referring, for a fixed protection
 * window. A second partner registering the same prospect while it's still
 * protected is flagged instead of silently overwriting attribution. */
export async function registerDealAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; conflict?: boolean }> {
  const session = await getSession();
  if (!session?.partnerId) {
    return { ok: false, error: "You must be signed in as an advisor." };
  }

  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!businessName || !contactName || !phone || !city) {
    return { ok: false, error: "Please fill in all required fields." };
  }

  const conflict = await db.dealRegistration.findFirst({
    where: { ...activeDealWhere(phone), partnerId: { not: session.partnerId } },
  });
  if (conflict) {
    return {
      ok: false,
      conflict: true,
      error: "This prospect is already protected by another partner. Contact your Partner Manager if you believe this is an error.",
    };
  }

  await db.dealRegistration.create({
    data: {
      partnerId: session.partnerId,
      businessName,
      contactName,
      phone,
      email,
      city,
      notes,
      expiresAt: new Date(Date.now() + DEAL_PROTECTION_DAYS * 86400000),
    },
  });

  await notifyInternalUsers(["ADMIN", "PARTNER_MANAGER"], {
    type: "DEAL_REGISTERED",
    title: `New deal registration: ${businessName}`,
    body: "Awaiting review for channel-conflict clearance.",
    href: "/admin/deals",
  });

  revalidatePath("/partner/deals");
  revalidatePath("/admin/deals");

  return { ok: true };
}

export async function approveDealAction(dealId: string) {
  const actor = await requirePartnerManager();

  const deal = await db.dealRegistration.update({
    where: { id: dealId },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });

  await notifyPartnerUsers(deal.partnerId, {
    type: "DEAL_APPROVED",
    title: `Deal registration approved: ${deal.businessName}`,
    body: `Protected until ${deal.expiresAt.toLocaleDateString("en-IN")}.`,
    href: "/partner/deals",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "APPROVE_DEAL",
    targetType: "DealRegistration",
    targetId: dealId,
    meta: deal.businessName,
  });

  revalidatePath("/admin/deals");
  revalidatePath("/partner/deals");
}

export async function rejectDealAction(dealId: string) {
  const actor = await requirePartnerManager();

  const deal = await db.dealRegistration.update({
    where: { id: dealId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  await notifyPartnerUsers(deal.partnerId, {
    type: "DEAL_REJECTED",
    title: `Deal registration rejected: ${deal.businessName}`,
    href: "/partner/deals",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REJECT_DEAL",
    targetType: "DealRegistration",
    targetId: dealId,
    meta: deal.businessName,
  });

  revalidatePath("/admin/deals");
  revalidatePath("/partner/deals");
}
