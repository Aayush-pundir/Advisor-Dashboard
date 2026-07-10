"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyInternalUsers } from "@/lib/notify";
import { computeClientHealth } from "@/lib/health";
import type { UserRole } from "@/lib/enums";

async function requireLeadManager() {
  const user = await getAuthedUser();
  if (!user || !canManageLeads(user.role as UserRole)) {
    throw new ForbiddenError("manage post-sale client health");
  }
  return user;
}

async function recomputeAndPersist(leadId: string) {
  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
  const { healthScore, riskLevel } = computeClientHealth({
    closedAt: lead.closedAt,
    lastActivityAt: lead.lastActivityAt,
    supportTicketCount: lead.supportTicketCount,
    npsScore: lead.npsScore,
  });

  const wasHighRisk = lead.riskLevel === "HIGH";
  await db.lead.update({ where: { id: leadId }, data: { healthScore, riskLevel } });

  if (riskLevel === "HIGH" && !wasHighRisk) {
    await notifyInternalUsers(["ADMIN", "SALES", "PARTNER_MANAGER"], {
      type: "CLIENT_AT_RISK",
      title: `${lead.businessName} is now high churn risk`,
      body: `Health score dropped to ${healthScore}.`,
      href: "/admin/clients",
    });
  }

  return { healthScore, riskLevel };
}

/** Logs a client touchpoint (call, check-in, QBR) — resets the recency clock
 * used in the health-score calculation. */
export async function logClientActivityAction(leadId: string) {
  await requireLeadManager();
  await db.lead.update({ where: { id: leadId }, data: { lastActivityAt: new Date() } });
  await recomputeAndPersist(leadId);
  revalidatePath("/admin/clients");
}

/** Records a support interaction against this client (distinct from the
 * internal SupportTicket desk) — feeds into the health-score penalty. */
export async function logSupportTouchAction(leadId: string) {
  const actor = await requireLeadManager();
  await db.lead.update({ where: { id: leadId }, data: { supportTicketCount: { increment: 1 } } });
  await recomputeAndPersist(leadId);

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "LOG_SUPPORT_TOUCH",
    targetType: "Lead",
    targetId: leadId,
  });

  revalidatePath("/admin/clients");
}

export async function setNpsScoreAction(leadId: string, npsScore: number) {
  const actor = await requireLeadManager();
  if (npsScore < 0 || npsScore > 10) return;

  await db.lead.update({ where: { id: leadId }, data: { npsScore } });
  await recomputeAndPersist(leadId);

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "SET_NPS_SCORE",
    targetType: "Lead",
    targetId: leadId,
    meta: `NPS ${npsScore}`,
  });

  revalidatePath("/admin/clients");
}

/** Recomputes health/risk for every closed-won client — called on page load
 * so scores reflect elapsed time even without a background job. */
export async function recomputeAllClientHealth() {
  const leads = await db.lead.findMany({ where: { stage: "CLOSED_WON" } });
  for (const lead of leads) {
    const { healthScore, riskLevel } = computeClientHealth({
      closedAt: lead.closedAt,
      lastActivityAt: lead.lastActivityAt,
      supportTicketCount: lead.supportTicketCount,
      npsScore: lead.npsScore,
    });
    if (lead.healthScore !== healthScore || lead.riskLevel !== riskLevel) {
      await db.lead.update({ where: { id: lead.id }, data: { healthScore, riskLevel } });
    }
  }
}
