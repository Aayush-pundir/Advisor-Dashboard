import type { UserRole } from "@/lib/enums";

/**
 * Role permission matrix for the internal ops console. Four roles exist
 * (Step 1.5 "4-person pod"): ADMIN has full access; the other three map to
 * the pod's actual job functions so each role only writes to the part of
 * the CRM it owns.
 */

export function canManagePartners(role: UserRole) {
  return role === "ADMIN" || role === "PARTNER_MANAGER";
}

export function canManageLeads(role: UserRole) {
  return role === "ADMIN" || role === "SALES";
}

export function canManageCampaigns(role: UserRole) {
  return role === "ADMIN" || role === "MARKETING_OPS";
}

export function canViewCommissions(role: UserRole) {
  return role === "ADMIN" || role === "PARTNER_MANAGER" || role === "SALES";
}

export function canManageTeam(role: UserRole) {
  return role === "ADMIN";
}

export function canViewAuditLog(role: UserRole) {
  return role === "ADMIN";
}

/** Who can reveal masked client PII (phone/email) for campaign execution —
 * every internal ops role can, since all four run some part of the funnel
 * that eventually needs to contact a client, but the reveal is always logged. */
export function canRevealPii(role: UserRole) {
  return role === "ADMIN" || role === "PARTNER_MANAGER" || role === "SALES" || role === "MARKETING_OPS";
}

export class ForbiddenError extends Error {
  constructor(action: string) {
    super(`Your role does not have permission to ${action}.`);
    this.name = "ForbiddenError";
  }
}
