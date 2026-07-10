import { getAdminOverview } from "@/lib/queries/admin";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { formatINR } from "@/lib/utils";
import { KPI_TARGETS } from "@/lib/plan-content";
import { PARTNER_STAGE_LABELS, LEAD_STAGE_LABELS, type PartnerStage, type LeadStage } from "@/lib/enums";
import { CsvExportButton } from "@/components/admin/csv-export-button";

export default async function AdminOverviewPage() {
  const {
    totalPartners,
    certifiedOrActive,
    stageCounts,
    leadStageCounts,
    totalRevenue,
    totalCommissionsCredited,
    badgeCounts,
  } = await getAdminOverview();

  const partnerFunnel = (Object.keys(PARTNER_STAGE_LABELS) as PartnerStage[]).map(
    (stage) => ({ name: PARTNER_STAGE_LABELS[stage], value: stageCounts[stage] ?? 0 }),
  );
  const leadFunnel = (Object.keys(LEAD_STAGE_LABELS) as LeadStage[]).map((stage) => ({
    name: LEAD_STAGE_LABELS[stage],
    value: leadStageCounts[stage] ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Program KPI Overview</h1>
          <p className="mt-1 text-muted">
            Step 9 — weekly funnel review, tracked end-to-end from onboarding
            to revenue.
          </p>
        </div>
        <CsvExportButton href="/admin/kpi-export" label="Export KPI CSV" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total partners"
          value={String(totalPartners)}
          hint="of 500 Year-1 target"
        />
        <StatTile
          label="Certified / Active"
          value={String(certifiedOrActive)}
          hint="running campaigns"
        />
        <StatTile
          label="Client revenue closed"
          value={formatINR(totalRevenue)}
          hint="lifetime, all partners"
        />
        <StatTile
          label="Commissions credited"
          value={formatINR(totalCommissionsCredited)}
          hint="paid to CA wallets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Partner funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={partnerFunnel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lead-to-revenue funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={leadFunnel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-t-4 border-t-silver p-4 text-center">
          <p className="text-xs uppercase text-muted">Silver badges</p>
          <p className="mt-1 text-xl font-semibold">{badgeCounts.SILVER ?? 0}</p>
        </Card>
        <Card className="border-t-4 border-t-gold p-4 text-center">
          <p className="text-xs uppercase text-muted">Gold badges</p>
          <p className="mt-1 text-xl font-semibold">{badgeCounts.GOLD ?? 0}</p>
        </Card>
        <Card className="border-t-4 border-t-platinum p-4 text-center">
          <p className="text-xs uppercase text-muted">Platinum badges</p>
          <p className="mt-1 text-xl font-semibold">{badgeCounts.PLATINUM ?? 0}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI targets (Step 9 cadence)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Funnel stage</th>
                <th className="py-2 pr-4 font-medium">KPI</th>
                <th className="py-2 font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {KPI_TARGETS.map((k) => (
                <tr key={k.kpi} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-muted">{k.stage}</td>
                  <td className="py-2 pr-4">{k.kpi}</td>
                  <td className="py-2 font-medium text-brand-dark">{k.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
