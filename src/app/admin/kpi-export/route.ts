import { db } from "@/lib/db";
import { getAuthedUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const actor = await getAuthedUser();
  if (!actor) return new Response("Forbidden", { status: 403 });

  const snapshots = await db.kpiSnapshot.findMany({ orderBy: { weekOf: "asc" } });

  const csv = toCsv(
    snapshots.map((s) => ({
      weekOf: s.weekOf.toISOString().slice(0, 10),
      costPerPartnerLead: s.costPerPartnerLead,
      visitorToSignupPct: s.visitorToSignupPct.toFixed(1),
      signupToCertifiedPct: s.signupToCertifiedPct.toFixed(1),
      avgDaysToCertify: s.avgDaysToCertify.toFixed(1),
      certifiedToFirstCampaignPct: s.certifiedToFirstCampaignPct.toFixed(1),
      leadToDemoPct: s.leadToDemoPct.toFixed(1),
      demoToClosePct: s.demoToClosePct.toFixed(1),
      slaPct: s.slaPct.toFixed(1),
      clientsPerActiveCA: s.clientsPerActiveCA.toFixed(1),
      nps: s.nps.toFixed(1),
      dormancyPct: s.dormancyPct.toFixed(1),
      referredSharePct: s.referredSharePct.toFixed(1),
    })),
    [
      { key: "weekOf", header: "Week Of" },
      { key: "costPerPartnerLead", header: "Cost per Partner Lead" },
      { key: "visitorToSignupPct", header: "Visitor to Signup %" },
      { key: "signupToCertifiedPct", header: "Signup to Certified %" },
      { key: "avgDaysToCertify", header: "Avg Days to Certify" },
      { key: "certifiedToFirstCampaignPct", header: "Certified to First Campaign %" },
      { key: "leadToDemoPct", header: "Lead to Demo %" },
      { key: "demoToClosePct", header: "Demo to Close %" },
      { key: "slaPct", header: "SLA %" },
      { key: "clientsPerActiveCA", header: "Clients per Active CA" },
      { key: "nps", header: "NPS" },
      { key: "dormancyPct", header: "Dormancy %" },
      { key: "referredSharePct", header: "Referred Share %" },
    ],
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="kpi-snapshots.csv"`,
    },
  });
}
