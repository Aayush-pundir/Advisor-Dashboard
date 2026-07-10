"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser, getSession } from "@/lib/auth";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyInternalUsers, notifyPartnerUsers } from "@/lib/notify";
import { formatINR } from "@/lib/utils";
import type { UserRole } from "@/lib/enums";

async function requirePartnerManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage MDF requests");
  }
  return user;
}

/** Market Development Funds — partners request co-marketing budget for a
 * campaign; admin/partner-manager approves an amount (may differ from the
 * request) and later marks it paid out. */
export async function requestMdfAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) {
    return { ok: false, error: "You must be signed in as an advisor." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const requestedAmount = Number(formData.get("requestedAmount") ?? 0);

  if (!title || !requestedAmount || requestedAmount <= 0) {
    return { ok: false, error: "Please provide a title and a requested amount greater than zero." };
  }

  await db.mdfRequest.create({
    data: {
      partnerId: session.partnerId,
      title,
      description,
      requestedAmount: Math.round(requestedAmount),
    },
  });

  await notifyInternalUsers(["ADMIN", "MARKETING_OPS"], {
    type: "MDF_REQUESTED",
    title: `New MDF request: ${title}`,
    body: `Requested ${formatINR(Math.round(requestedAmount))}.`,
    href: "/admin/mdf",
  });

  revalidatePath("/partner/mdf");
  revalidatePath("/admin/mdf");

  return { ok: true };
}

export async function approveMdfAction(mdfId: string, approvedAmount: number) {
  const actor = await requirePartnerManager();

  const mdf = await db.mdfRequest.update({
    where: { id: mdfId },
    data: { status: "APPROVED", approvedAmount: Math.round(approvedAmount), reviewedAt: new Date() },
  });

  await notifyPartnerUsers(mdf.partnerId, {
    type: "MDF_APPROVED",
    title: `MDF approved: ${mdf.title}`,
    body: `${formatINR(mdf.approvedAmount ?? 0)} approved for this campaign.`,
    href: "/partner/mdf",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "APPROVE_MDF",
    targetType: "MdfRequest",
    targetId: mdfId,
    meta: `${mdf.title} -> ${formatINR(mdf.approvedAmount ?? 0)}`,
  });

  revalidatePath("/admin/mdf");
  revalidatePath("/partner/mdf");
}

export async function rejectMdfAction(mdfId: string) {
  const actor = await requirePartnerManager();

  const mdf = await db.mdfRequest.update({
    where: { id: mdfId },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  await notifyPartnerUsers(mdf.partnerId, {
    type: "MDF_REJECTED",
    title: `MDF rejected: ${mdf.title}`,
    href: "/partner/mdf",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REJECT_MDF",
    targetType: "MdfRequest",
    targetId: mdfId,
    meta: mdf.title,
  });

  revalidatePath("/admin/mdf");
  revalidatePath("/partner/mdf");
}

export async function markMdfPaidAction(mdfId: string) {
  const actor = await requirePartnerManager();

  const mdf = await db.mdfRequest.update({
    where: { id: mdfId },
    data: { status: "PAID" },
  });

  await notifyPartnerUsers(mdf.partnerId, {
    type: "MDF_PAID",
    title: `MDF paid out: ${mdf.title}`,
    body: `${formatINR(mdf.approvedAmount ?? 0)} has been disbursed.`,
    href: "/partner/mdf",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "PAY_MDF",
    targetType: "MdfRequest",
    targetId: mdfId,
    meta: mdf.title,
  });

  revalidatePath("/admin/mdf");
  revalidatePath("/partner/mdf");
}
