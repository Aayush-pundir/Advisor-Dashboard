"use server";

import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { canRevealPii } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";

/** Reveals a lead's raw phone/email. Raw PII never reaches the client until
 * this explicit, authorized, and audited action is called — the page itself
 * only ever renders masked values by default. */
export async function revealLeadPiiAction(
  leadId: string,
): Promise<{ ok: boolean; phone?: string; email?: string; error?: string }> {
  const actor = await getAuthedUser();
  if (!actor || !canRevealPii(actor.role as UserRole)) {
    return { ok: false, error: "Your role can't reveal client contact details." };
  }

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { phone: true, email: true, businessName: true } });
  if (!lead) return { ok: false, error: "Lead not found." };

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REVEAL_PII",
    targetType: "Lead",
    targetId: leadId,
    meta: lead.businessName,
  });

  return { ok: true, phone: lead.phone, email: lead.email };
}

/** Reveals raw phone/email for many leads at once — for a call-down session
 * across the current view. One audited action instead of one per row. */
export async function revealAllLeadsPiiAction(
  leadIds: string[],
): Promise<{ ok: boolean; items?: { id: string; phone: string; email: string }[]; error?: string }> {
  const actor = await getAuthedUser();
  if (!actor || !canRevealPii(actor.role as UserRole)) {
    return { ok: false, error: "Your role can't reveal client contact details." };
  }

  const leads = await db.lead.findMany({
    where: { id: { in: leadIds } },
    select: { id: true, phone: true, email: true },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REVEAL_PII_BULK",
    targetType: "Lead",
    targetId: "bulk",
    meta: `${leads.length} lead(s)`,
  });

  return { ok: true, items: leads.map((l) => ({ id: l.id, phone: l.phone, email: l.email })) };
}
