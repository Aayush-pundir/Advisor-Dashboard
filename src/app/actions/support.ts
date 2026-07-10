"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { notifyInternalUsers } from "@/lib/notify";
import { logAudit } from "@/lib/audit";

/** Any signed-in user (advisor or internal) can raise a ticket from the
 * floating support widget. Notifies Partner Success (all internal roles)
 * so someone always picks it up — escalation from there is manual. */
export async function createSupportTicketAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const priority = String(formData.get("priority") ?? "NORMAL");
  if (!subject || !message) return { ok: false, error: "Please fill in both fields." };

  await db.supportTicket.create({
    data: {
      userId: user.id,
      partnerId: user.partnerId,
      subject,
      message,
      priority,
    },
  });

  await notifyInternalUsers(["ADMIN", "PARTNER_MANAGER"], {
    type: "SUPPORT_TICKET",
    title: `New ${priority.toLowerCase()} ticket: ${subject}`,
    body: `From ${user.name}`,
    href: "/admin/support",
  });

  revalidatePath("/admin/support");
  return { ok: true };
}

export async function escalateTicketAction(ticketId: string) {
  const actor = await getAuthedUser();
  if (!actor) throw new Error("UNAUTHENTICATED");

  const ticket = await db.supportTicket.update({
    where: { id: ticketId },
    data: {
      escalationLevel: { increment: 1 },
      status: "ESCALATED",
    },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "ESCALATE_TICKET",
    targetType: "SupportTicket",
    targetId: ticketId,
    meta: `Level ${ticket.escalationLevel}`,
  });

  revalidatePath("/admin/support");
}

export async function resolveTicketAction(ticketId: string) {
  const actor = await getAuthedUser();
  if (!actor) throw new Error("UNAUTHENTICATED");

  await db.supportTicket.update({
    where: { id: ticketId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "RESOLVE_TICKET",
    targetType: "SupportTicket",
    targetId: ticketId,
  });

  revalidatePath("/admin/support");
}
