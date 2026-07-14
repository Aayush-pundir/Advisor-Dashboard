import { db } from "@/lib/db";
import { LEAD_CONFLICT_PROTECTION_DAYS } from "@/lib/enums";

/**
 * Channel-conflict protection, inherited automatically into every lead a
 * partner submits (one-by-one, bulk upload, or public capture) — no
 * separate "register a deal first" step. If another partner already has an
 * active lead for this phone number within the protection window, the new
 * submission is flagged instead of silently double-attributing the client.
 */
export function conflictProtectionCutoff() {
  return new Date(Date.now() - LEAD_CONFLICT_PROTECTION_DAYS * 86400000);
}

export async function findConflictingLead(phone: string, excludePartnerId: string) {
  const since = conflictProtectionCutoff();
  return db.lead.findFirst({
    where: {
      phone,
      partnerId: { not: excludePartnerId },
      stage: { not: "CLOSED_LOST" },
      createdAt: { gte: since },
    },
    include: { partner: { select: { firmName: true } } },
  });
}

export function conflictErrorMessage(conflictingFirmName: string) {
  return `This contact is already an active lead with ${conflictingFirmName}, referred within the last ${LEAD_CONFLICT_PROTECTION_DAYS} days. Contact your Partner Manager if you believe this is an error.`;
}
