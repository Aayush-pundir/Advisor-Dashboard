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

  const certifiedOrActive = partners.filter(
    (p) => p.stage === "CERTIFIED" || p.stage === "ACTIVE",
  ).length;

  const closedWon = leads.filter((l) => l.stage === "CLOSED_WON");
  const totalRevenue = closedWon.reduce((sum, l) => sum + l.dealValue, 0);
  const totalCommissionsCredited = commissions
    .filter((c) => c.status !== "PENDING")
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
    certifiedOrActive,
    stageCounts,
    leadStageCounts,
    totalRevenue,
    totalCommissionsCredited,
    badgeCounts,
    latestKpi,
    partners,
  };
}
