import { db } from "@/lib/db";
import {
  MILESTONE_TIERS,
  MILESTONE_TIER_META,
  ELITE_CLUB_THRESHOLD,
  ELITE_CLUB_BENEFIT_INTERVAL,
  ELITE_CLUB_BENEFIT_DESCRIPTION,
  anniversaryYearWindow,
} from "@/lib/enums";

export async function getPartnerDashboard(partnerId: string) {
  const [partner, leads, commissions, badges, cityPartners] =
    await Promise.all([
      db.partner.findUniqueOrThrow({ where: { id: partnerId } }),
      db.lead.findMany({
        where: { partnerId },
        orderBy: { createdAt: "desc" },
      }),
      db.commission.findMany({ where: { partnerId } }),
      db.badge.findMany({
        where: { partnerId },
        orderBy: { issuedAt: "desc" },
      }),
      db.partner.findMany({
        select: { id: true, city: true },
      }),
    ]);

  const closedWon = leads.filter((l) => l.stage === "CLOSED_WON");
  const pipeline = leads.filter(
    (l) => l.stage !== "CLOSED_WON" && l.stage !== "CLOSED_LOST",
  );

  const totalEarned = commissions
    .filter((c) => c.status !== "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingEarnings = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);

  const milestoneProgress = getMilestoneProgress(partner, closedWon.length, leads);

  // City rank by closed-won leads among partners in the same city
  const cityPartnerIds = cityPartners
    .filter((p) => p.city === partner.city)
    .map((p) => p.id);
  const cityLeadCounts = await db.lead.groupBy({
    by: ["partnerId"],
    where: { partnerId: { in: cityPartnerIds }, stage: "CLOSED_WON" },
    _count: { id: true },
  });
  const ranked = cityLeadCounts.sort((a, b) => b._count.id - a._count.id);
  const cityRank =
    ranked.findIndex((r) => r.partnerId === partnerId) + 1 || cityPartnerIds.length;

  return {
    partner,
    leads,
    pipeline,
    closedWon,
    commissions,
    badges,
    totalEarned,
    pendingEarnings,
    milestoneProgress,
    cityRank,
    cityTotal: cityPartnerIds.length,
  };
}

type MilestoneProgress =
  | {
      type: "tier";
      clientsThisYear: number;
      nextTier: { tier: Exclude<(typeof MILESTONE_TIERS)[number], "NONE">; threshold: number; label: string; reward: string } | null;
    }
  | {
      type: "elite";
      totalClients: number;
      benefitsIssued: number;
      nextBenefitAt: number;
      benefitDescription: string;
    };

/** Elite Club members (permanent, once reached) track lifetime progress
 * toward their next 5-client benefit instead of a yearly tier ladder. */
function getMilestoneProgress(
  partner: { certifiedAt: Date | null; eliteClubMember: boolean; eliteBenefitsIssued: number },
  totalClientsLifetime: number,
  leads: { stage: string; closedAt: Date | null }[],
): MilestoneProgress {
  if (partner.eliteClubMember) {
    const nextBenefitAt =
      ELITE_CLUB_THRESHOLD + (partner.eliteBenefitsIssued + 1) * ELITE_CLUB_BENEFIT_INTERVAL;
    return {
      type: "elite",
      totalClients: totalClientsLifetime,
      benefitsIssued: partner.eliteBenefitsIssued,
      nextBenefitAt,
      benefitDescription: ELITE_CLUB_BENEFIT_DESCRIPTION,
    };
  }

  const { start } = anniversaryYearWindow(partner.certifiedAt);
  const clientsThisYear = leads.filter(
    (l) => l.stage === "CLOSED_WON" && l.closedAt && l.closedAt >= start,
  ).length;

  for (const tier of MILESTONE_TIERS) {
    if (tier === "NONE") continue;
    if (clientsThisYear < MILESTONE_TIER_META[tier].threshold) {
      return { type: "tier", clientsThisYear, nextTier: { tier, ...MILESTONE_TIER_META[tier] } };
    }
  }
  return { type: "tier", clientsThisYear, nextTier: null };
}
