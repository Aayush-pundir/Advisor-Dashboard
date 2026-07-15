import type { UserRole } from "@/lib/enums";

/**
 * Role permission matrix for the internal ops console. Two internal login
 * types exist: ADMIN (full control, exclusive over team management and the
 * audit log) and OMNICARD_TEAM (marketing/sales/accounts/PM share one role
 * with full CRM edit rights). CA is the advisor/partner login.
 */

export function canManagePartners(role: UserRole) {
  return role === "ADMIN" || role === "OMNICARD_TEAM";
}

export function canManageLeads(role: UserRole) {
  return role === "ADMIN" || role === "OMNICARD_TEAM";
}

export function canManageCampaigns(role: UserRole) {
  return role === "ADMIN" || role === "OMNICARD_TEAM";
}

export function canViewCommissions(role: UserRole) {
  return role === "ADMIN" || role === "OMNICARD_TEAM";
}

export function canManageTeam(role: UserRole) {
  return role === "ADMIN";
}

export function canViewAuditLog(role: UserRole) {
  return role === "ADMIN";
}

/** Who can reveal masked client PII (phone/email) for campaign execution —
 * every internal role can, since the reveal is always logged regardless. */
export function canRevealPii(role: UserRole) {
  return role === "ADMIN" || role === "OMNICARD_TEAM";
}

export class ForbiddenError extends Error {
  constructor(action: string) {
    super(`Your role does not have permission to ${action}.`);
    this.name = "ForbiddenError";
  }
}
