"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser, hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

async function requirePartnerOwner() {
  const user = await getAuthedUser();
  if (!user || !user.partnerId) throw new Error("UNAUTHENTICATED");
  return user;
}

/** Advisor profile — firm/contact details shown on their microsite & MOU. */
export async function updateProfileAction(formData: FormData) {
  const user = await requirePartnerOwner();

  const firmName = String(formData.get("firmName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const icaiNumber = String(formData.get("icaiNumber") ?? "").trim() || null;

  if (!firmName || !contactName || !phone || !city || !state) return;

  await db.partner.update({
    where: { id: user.partnerId! },
    data: { firmName, contactName, phone, city, state, icaiNumber },
  });

  revalidatePath("/partner/settings");
}

/** Payout details required to actually route commission — Phase 1. */
export async function updatePayoutAction(formData: FormData) {
  const user = await requirePartnerOwner();

  const bankAccountName = String(formData.get("bankAccountName") ?? "").trim() || null;
  const bankAccountNumber = String(formData.get("bankAccountNumber") ?? "").trim() || null;
  const bankIfsc = String(formData.get("bankIfsc") ?? "").trim() || null;
  const upiId = String(formData.get("upiId") ?? "").trim() || null;
  const pan = String(formData.get("pan") ?? "").trim() || null;
  const gstNumber = String(formData.get("gstNumber") ?? "").trim() || null;

  await db.partner.update({
    where: { id: user.partnerId! },
    data: { bankAccountName, bankAccountNumber, bankIfsc, upiId, pan, gstNumber },
  });

  revalidatePath("/partner/settings");
}

/** Multi-user firms — an OWNER can invite a teammate under the same Partner
 * record. No email provider is wired up, so the temp password is shown once
 * to the inviter to relay manually — see ARCHITECTURE.md. */
export async function inviteTeammateAction(formData: FormData): Promise<{ ok: boolean; error?: string; tempPassword?: string }> {
  const user = await requirePartnerOwner();
  if (user.firmRole !== "OWNER") return { ok: false, error: "Only the firm owner can invite teammates." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name || !email) return { ok: false, error: "Name and email are required." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const tempPassword = randomBytes(6).toString("hex");
  await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(tempPassword),
      role: "CA",
      partnerId: user.partnerId!,
      firmRole: "MEMBER",
      mustChangePassword: true,
    },
  });

  revalidatePath("/partner/settings");
  return { ok: true, tempPassword };
}

export async function removeTeammateAction(userId: string) {
  const user = await requirePartnerOwner();
  if (user.firmRole !== "OWNER") throw new Error("FORBIDDEN");

  const target = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (target.partnerId !== user.partnerId) throw new Error("FORBIDDEN");
  if (target.id === user.id) throw new Error("Cannot remove yourself");

  await db.user.update({ where: { id: userId }, data: { active: false } });
  revalidatePath("/partner/settings");
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await getAuthedUser();
  if (!user) return;
  await db.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/partner");
}

export async function markAllNotificationsReadAction() {
  const user = await getAuthedUser();
  if (!user) return;
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/partner/notifications");
}
