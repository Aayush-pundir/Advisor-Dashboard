/**
 * SQLite has no native enum type, so Prisma models store these as plain
 * strings. These const tuples + derived types are the single source of
 * truth for valid values across the app (forms, seed data, badges, etc).
 */

// Three login types: ADMIN (full control, exclusive audit-log access),
// OMNICARD_TEAM (marketing/sales/accounts/PM — one shared internal-ops
// role with full CRM edit rights), and CA (the advisor/partner login).
export const USER_ROLES = ["ADMIN", "OMNICARD_TEAM", "CA"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PARTNER_STAGES = [
  "LEAD",
  "MEETING_SCHEDULED",
  "ONBOARDING",
  "CERTIFIED",
  "ACTIVE",
  "DORMANT",
] as const;
export type PartnerStage = (typeof PARTNER_STAGES)[number];

export const PARTNER_STAGE_LABELS: Record<PartnerStage, string> = {
  LEAD: "Lead",
  MEETING_SCHEDULED: "Meeting Scheduled",
  ONBOARDING: "Onboarding",
  CERTIFIED: "Certified",
  ACTIVE: "Active",
  DORMANT: "Dormant",
};

export const BADGE_TIERS = ["NONE", "SILVER", "GOLD", "PLATINUM"] as const;
export type BadgeTier = (typeof BADGE_TIERS)[number];

export const BADGE_TIER_META: Record<
  Exclude<BadgeTier, "NONE">,
  { threshold: number; gift: string; color: string }
> = {
  SILVER: {
    threshold: 5,
    gift: "Premium gift hamper + Rs 5,000 voucher",
    color: "#94a3b8",
  },
  GOLD: {
    threshold: 10,
    gift: "Smartwatch / premium gadget + Rs 15,000 voucher",
    color: "#d4a017",
  },
  PLATINUM: {
    threshold: 50,
    gift: "International trip for two / MacBook + Rs 50,000 voucher",
    color: "#171310",
  },
};

export const ASSET_KEYS = [
  "LANDING_PAGE",
  "QR_CODE",
  "EXPLAINER_VIDEO",
  "EMAIL_SIGNATURE",
  "MINI_DECK",
  "CERTIFICATE_BADGE",
  "WHATSAPP_PACK",
  "LINKEDIN_KIT",
  "SAVINGS_CALCULATOR",
  "LEAD_MAGNET_PDF",
  "FIRST_CAMPAIGN_DRAFT",
  "COMPLIANCE_CALENDAR",
] as const;
export type AssetKey = (typeof ASSET_KEYS)[number];

export const ASSET_LABELS: Record<AssetKey, string> = {
  LANDING_PAGE: "Co-branded landing page",
  QR_CODE: "Personal QR code + tracked short link",
  EXPLAINER_VIDEO: "Personalized 90-sec explainer video",
  EMAIL_SIGNATURE: "Email signature banner",
  MINI_DECK: "Client-facing 8-slide mini-deck",
  CERTIFICATE_BADGE: "Certified Implementation Advisor badge + certificate",
  WHATSAPP_PACK: "WhatsApp creative pack (10-12 cards)",
  LINKEDIN_KIT: "LinkedIn content kit (4 posts)",
  SAVINGS_CALCULATOR: "Co-branded savings calculator",
  LEAD_MAGNET_PDF: "'Spend Leakage Audit' lead-magnet PDF",
  FIRST_CAMPAIGN_DRAFT: "First email + WhatsApp campaign draft",
  COMPLIANCE_CALENDAR: "Compliance calendar wallpaper",
};

export const ASSET_STATUSES = ["PENDING", "IN_PROGRESS", "DELIVERED"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const LEAD_SOURCES = [
  "MICROSITE",
  "QR_SCAN",
  "WEBINAR",
  "CALCULATOR",
  "WHATSAPP",
  "REFERRAL",
  "DIRECTORY",
  "PARTNER_MANUAL",
  "BULK_UPLOAD",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STAGES = [
  "CAPTURED",
  "QUALIFIED",
  "CONTACTED",
  "DEMO",
  "PROPOSAL",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  CAPTURED: "Captured",
  QUALIFIED: "Qualified",
  CONTACTED: "Contacted",
  DEMO: "Demo",
  PROPOSAL: "Proposal",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

/** Business-size category — set by the OmniCard team only, visible
 * read-only to the referring advisor for transparency. */
export const LEAD_CATEGORIES = ["SME", "MEDIUM", "ENTERPRISE"] as const;
export type LeadCategory = (typeof LEAD_CATEGORIES)[number];

export const LEAD_CATEGORY_LABELS: Record<LeadCategory, string> = {
  SME: "SME",
  MEDIUM: "Medium",
  ENTERPRISE: "Enterprise",
};

export const COMMISSION_TYPES = ["YEAR1", "TRAILING", "REFERRAL_BONUS"] as const;
export type CommissionType = (typeof COMMISSION_TYPES)[number];

export const COMMISSION_STATUSES = ["PENDING", "CREDITED", "PAID"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const CAMPAIGN_TYPES = [
  "EMAIL",
  "WHATSAPP",
  "WEBINAR",
  "NEWSLETTER",
  "LINKEDIN",
] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_STATUSES = [
  "DRAFTED",
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "SHARE",
  "CLICK",
  "QR_SCAN",
  "WEBINAR_ATTEND",
  "CAMPAIGN_SENT",
  "CAMPAIGN_APPROVED",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** ICP scoring weights, Step 1.2 — pursue >=70, skip <50 */
export const ICP_WEIGHTS = {
  icpClients: 25,
  icpAdvisory: 20,
  icpTech: 15,
  icpSize: 10,
  icpGeo: 10,
  icpDigital: 10,
  icpMindset: 10,
} as const;

export function icpTotal(p: {
  icpClients: number;
  icpAdvisory: number;
  icpTech: number;
  icpSize: number;
  icpGeo: number;
  icpDigital: number;
  icpMindset: number;
}) {
  return (
    p.icpClients +
    p.icpAdvisory +
    p.icpTech +
    p.icpSize +
    p.icpGeo +
    p.icpDigital +
    p.icpMindset
  );
}

/** Commission rates, Step 1.1 / Step 10 */
export const YEAR1_RATE = 0.15;
export const TRAILING_RATE = 0.05;

/**
 * Default annual client churn used for LTV-based earnings projections.
 * Trailing 5% is paid every year a client stays active, so a client's
 * expected number of *additional* active years after Year 1 is
 * (1 - churn) / churn — e.g. at 10% churn, 9 expected trailing years.
 */
export const DEFAULT_ANNUAL_CHURN = 0.1;

export function expectedTrailingYears(annualChurn: number) {
  return (1 - annualChurn) / annualChurn;
}

/** Per-client lifetime commission (Year-1 + expected trailing years), given ACV. */
export function ltvCommissionPerClient(acv: number, annualChurn: number) {
  const year1 = acv * YEAR1_RATE;
  const trailing = acv * TRAILING_RATE * expectedTrailingYears(annualChurn);
  return { year1, trailing, total: year1 + trailing };
}

/** Bump when the MOU document text changes; each Partner records which
 * version they accepted (Partner.mouVersion). */
export const CURRENT_MOU_VERSION = "v1";

/** Channel-conflict protection window (in days) — any lead phone number
 * already captured by another partner within this window is flagged as a
 * conflict instead of silently double-attributed. Applied automatically to
 * every lead a partner submits (one-by-one, bulk, or public capture) rather
 * than requiring a separate pre-registration step. */
export const LEAD_CONFLICT_PROTECTION_DAYS = 90;

/** Certification step-up track (Partner.certLevel) — separate from the
 * one-time onboarding certification (Partner.stage === CERTIFIED). Partners
 * progress through levels by completing self-serve modules. */
export const CERT_LEVELS = ["NONE", "DEMO", "PRODUCT", "SALES"] as const;
export type CertLevel = (typeof CERT_LEVELS)[number];

export const CERT_LEVEL_LABELS: Record<CertLevel, string> = {
  NONE: "Not started",
  DEMO: "Demo Certified",
  PRODUCT: "Product Certified",
  SALES: "Sales Certified",
};

export const CERT_MODULES = [
  { key: "PRODUCT_OVERVIEW", label: "OmniCard product overview", level: "DEMO" },
  { key: "OBJECTION_HANDLING", label: "Client objection handling", level: "DEMO" },
  { key: "ADVANCED_PRODUCT", label: "Advanced product & pricing", level: "PRODUCT" },
  { key: "COMPLIANCE_BASICS", label: "Compliance & KYC basics", level: "PRODUCT" },
  { key: "SALES_PLAYBOOK", label: "Sales playbook & pitch deck", level: "SALES" },
  { key: "CRM_MASTERY", label: "Advisor CRM mastery", level: "SALES" },
] as const;
export type CertModuleKey = (typeof CERT_MODULES)[number]["key"];

/** Highest cert level for which every module has been completed. */
export function computeCertLevel(completedKeys: Set<string>): CertLevel {
  let level: CertLevel = "NONE";
  for (const l of CERT_LEVELS.slice(1)) {
    const modulesForLevel = CERT_MODULES.filter((m) => m.level === l);
    if (modulesForLevel.every((m) => completedKeys.has(m.key))) level = l;
  }
  return level;
}
