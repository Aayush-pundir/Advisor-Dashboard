import type { LeadSource, LeadStage } from "@/lib/enums";

/** Configurable point rules for the lead-scoring engine — score is
 * recomputed (not stored client-side) whenever a lead is created or its
 * stage/value/contact status changes, so it always reflects current state. */
const SOURCE_POINTS: Partial<Record<LeadSource, number>> = {
  REFERRAL: 20,
  WEBINAR: 15,
  CALCULATOR: 15,
  QR_SCAN: 10,
  WHATSAPP: 10,
  PARTNER_MANUAL: 10,
  MICROSITE: 5,
  DIRECTORY: 5,
  BULK_UPLOAD: 0,
};

const STAGE_POINTS: Partial<Record<LeadStage, number>> = {
  CAPTURED: 0,
  QUALIFIED: 10,
  CONTACTED: 15,
  DEMO: 25,
  PROPOSAL: 30,
  CLOSED_WON: 40,
  CLOSED_LOST: -40,
};

export function computeLeadScore(lead: {
  source: string;
  stage: string;
  dealValue: number;
  createdAt: Date;
  contactedAt: Date | null;
}): number {
  let score = 0;
  score += SOURCE_POINTS[lead.source as LeadSource] ?? 5;
  score += STAGE_POINTS[lead.stage as LeadStage] ?? 0;

  if (lead.dealValue >= 500000) score += 25;
  else if (lead.dealValue >= 200000) score += 15;
  else if (lead.dealValue >= 50000) score += 5;

  const isOpen = lead.stage !== "CLOSED_WON" && lead.stage !== "CLOSED_LOST";
  if (isOpen && !lead.contactedAt) {
    const ageDays = (Date.now() - lead.createdAt.getTime()) / 86400000;
    if (ageDays > 2) score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
