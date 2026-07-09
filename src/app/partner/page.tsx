import { getSession } from "@/lib/auth";
import { getPartnerDashboard } from "@/lib/queries/partner";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { LEAD_STAGE_LABELS, type LeadStage } from "@/lib/enums";

export default async function PartnerDashboardPage() {
  const session = await getSession();
  const data = await getPartnerDashboard(session!.partnerId!);
  const { partner, pipeline, closedWon, totalEarned, pendingEarnings, clientsThisQuarter, nextTier, cityRank, cityTotal } = data;

  const referralLink = `omnicard.in/advisor/${partner.slug}`;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {partner.contactName.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">
          Here&apos;s how {partner.firmName} is performing on the OmniCard
          program.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total earned"
          value={formatINR(totalEarned)}
          hint={`${formatINR(pendingEarnings)} pending`}
        />
        <StatTile
          label="Active pipeline"
          value={String(pipeline.length)}
          hint="leads in progress"
        />
        <StatTile
          label="Clients closed"
          value={String(closedWon.length)}
          hint="lifetime"
        />
        <StatTile
          label={`City rank — ${partner.city}`}
          value={`#${cityRank || "-"}`}
          hint={`of ${cityTotal} advisors`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline by stage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.keys(LEAD_STAGE_LABELS) as LeadStage[])
              .filter((s) => s !== "CLOSED_LOST")
              .map((stage) => {
                const count = data.leads.filter((l) => l.stage === stage).length;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-muted">
                      {LEAD_STAGE_LABELS[stage]}
                    </span>
                    <Progress
                      value={data.leads.length ? (count / data.leads.length) * 100 : 0}
                      className="flex-1"
                    />
                    <span className="w-6 text-right text-sm font-medium">{count}</span>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestone progress</CardTitle>
          </CardHeader>
          <CardContent>
            {nextTier ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {clientsThisQuarter} / {nextTier.threshold} clients this quarter
                  </span>
                  <Badge variant="default">{nextTier.tier}</Badge>
                </div>
                <Progress
                  value={(clientsThisQuarter / nextTier.threshold) * 100}
                  className="mt-2"
                />
                <p className="mt-3 text-xs text-muted">
                  Reach {nextTier.threshold} clients this quarter to unlock:{" "}
                  {nextTier.gift}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                You&apos;ve hit Platinum — the top tier. Keep the streak going!
              </p>
            )}

            <div className="mt-5 rounded-lg bg-brand-light p-3">
              <p className="text-xs font-medium text-brand-dark">
                Your referral link
              </p>
              <p className="mt-1 break-all text-sm">{referralLink}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
