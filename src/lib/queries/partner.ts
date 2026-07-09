import { db } from "@/lib/db";
import { BADGE_TIER_META } from "@/lib/enums";
import type { BadgeTier } from "@/lib/enums";

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

  // Quarter-to-date clients toward next milestone
  const quarterStart = getQuarterStart();
  const clientsThisQuarter = leads.filter(
    (l) => l.stage === "CLOSED_WON" && l.closedAt && l.closedAt >= quarterStart,
  ).length;

  const nextTier = getNextTier(partner.badgeTier as BadgeTier);

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
    clientsThisQuarter,
    nextTier,
    cityRank,
    cityTotal: cityPartnerIds.length,
  };
}

function getQuarterStart() {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), quarterMonth, 1);
}

function getNextTier(current: BadgeTier) {
  const order: BadgeTier[] = ["NONE", "SILVER", "GOLD", "PLATINUM"];
  const idx = order.indexOf(current);
  if (idx === order.length - 1) return null;
  const next = order[idx + 1] as Exclude<BadgeTier, "NONE">;
  return { tier: next, ...BADGE_TIER_META[next] };
}
