import type { RiskLevel } from "@/lib/enums";

/**
 * Deterministic post-sale health score for a closed-won client — derived
 * from recency of contact, support-ticket load, and NPS, since there's no
 * live product-usage feed to draw on. Recomputed on every admin page load
 * so it never goes stale even without a background job.
 */
export function computeClientHealth({
  closedAt,
  lastActivityAt,
  supportTicketCount,
  npsScore,
}: {
  closedAt: Date | null;
  lastActivityAt: Date | null;
  supportTicketCount: number;
  npsScore: number | null;
}): { healthScore: number; riskLevel: RiskLevel } {
  const referenceDate = lastActivityAt ?? closedAt;
  const daysSince = referenceDate ? Math.floor((Date.now() - referenceDate.getTime()) / 86400000) : 999;

  let score = 100;
  if (daysSince > 180) score -= 40;
  else if (daysSince > 90) score -= 25;
  else if (daysSince > 30) score -= 10;

  score -= Math.min(supportTicketCount * 8, 40);

  if (npsScore != null) {
    if (npsScore <= 6) score -= 20;
    else if (npsScore <= 8) score -= 5;
    else score += 10;
  }

  score = Math.max(0, Math.min(100, score));
  const riskLevel: RiskLevel = score >= 70 ? "LOW" : score >= 40 ? "MEDIUM" : "HIGH";

  return { healthScore: score, riskLevel };
}
