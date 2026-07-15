import { db } from "@/lib/db";

export async function getAdminOverview() {
  const [partners, leads, commissions, latestKpi] = await Promise.all([
    db.partner.findMany(),
    db.lead.findMany(),
    db.commission.findMany(),
    db.kpiSnapshot.findFirst({ orderBy: { weekOf: "desc" } }),
  ]);

  const stageCounts = partners.reduce<Record<string, number>>((acc, p) => {
    acc[p.stage] = (acc[p.stage] ?? 0) + 1;
    return acc;
  }, {});

  const certifiedCount = partners.filter((p) => p.stage === "CERTIFIED").length;
  const activeCount = partners.filter((p) => p.stage === "ACTIVE").length;
  const certifiedOrActive = certifiedCount + activeCount;

  const closedWon = leads.filter((l) => l.stage === "CLOSED_WON");
  const totalClientsOnboarded = closedWon.length;
  const totalRevenue = closedWon.reduce((sum, l) => sum + l.dealValue, 0);
  const totalCommissionsCredited = commissions
    .filter((c) => c.status !== "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalAdvisoryFeesPaid = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  const leadStageCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] ?? 0) + 1;
    return acc;
  }, {});

  const badgeCounts = partners.reduce<Record<string, number>>((acc, p) => {
    if (p.badgeTier !== "NONE") acc[p.badgeTier] = (acc[p.badgeTier] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalPartners: partners.length,
    certifiedCount,
    activeCount,
    certifiedOrActive,
    stageCounts,
    leadStageCounts,
    totalClientsOnboarded,
    totalRevenue,
    totalCommissionsCredited,
    totalAdvisoryFeesPaid,
    badgeCounts,
    latestKpi,
    partners,
  };
}
