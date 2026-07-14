import { db } from "@/lib/db";
import { getAdminOverview } from "@/lib/queries/admin";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { QueueSection, QueueRow } from "@/components/admin/queue-row";
import { formatINR, formatDate } from "@/lib/utils";
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

  const [pendingAccept, pendingCountersign, awaitingDemo, openTickets] = await Promise.all([
    db.partner.findMany({
      where: { stage: "LEAD" },
      orderBy: { createdAt: "asc" },
      select: { id: true, firmName: true, contactName: true, createdAt: true },
    }),
    db.partner.findMany({
      where: { stage: "MEETING_SCHEDULED" },
      orderBy: { acceptedAt: "asc" },
      select: { id: true, firmName: true, contactName: true, acceptedAt: true },
    }),
    db.partner.findMany({
      where: { stage: "ONBOARDING", demoScheduledAt: null },
      orderBy: { mouCountersignedAt: "asc" },
      select: { id: true, firmName: true, contactName: true, demoRequestedAt: true },
    }),
    db.supportTicket.findMany({
      where: { status: { in: ["OPEN", "ESCALATED"] } },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true } }, partner: { select: { firmName: true } } },
    }),
  ]);

  const queueTotal = pendingAccept.length + pendingCountersign.length + awaitingDemo.length + openTickets.length;

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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted">
            Program performance and everything waiting on your team, in one place.
          </p>
        </div>
        <CsvExportButton href="/admin/kpi-export" label="Export KPI CSV" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total partners" value={String(totalPartners)} />
        <StatTile label="Certified / Active" value={String(certifiedOrActive)} hint="running campaigns" />
        <StatTile label="Client revenue closed" value={formatINR(totalRevenue)} hint="lifetime, all partners" />
        <StatTile label="Commissions credited" value={formatINR(totalCommissionsCredited)} hint="paid to CA wallets" />
      </div>

      <div>
        <h2 className="text-lg font-semibold">
          Needs your attention{" "}
          {queueTotal > 0 && (
            <span className="ml-1 text-sm font-normal text-muted">({queueTotal})</span>
          )}
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          <QueueSection title="Partner leads awaiting acceptance" emptyText="No new partner leads waiting.">
            {pendingAccept.map((p) => (
              <QueueRow
                key={p.id}
                href={`/admin/partners/${p.id}`}
                primary={p.firmName}
                secondary={p.contactName}
                meta={formatDate(p.createdAt)}
              />
            ))}
          </QueueSection>

          <QueueSection title="MOUs awaiting countersignature" emptyText="No MOUs waiting on a countersignature.">
            {pendingCountersign.map((p) => (
              <QueueRow
                key={p.id}
                href={`/admin/partners/${p.id}`}
                primary={p.firmName}
                secondary={p.contactName}
                meta={p.acceptedAt ? formatDate(p.acceptedAt) : ""}
              />
            ))}
          </QueueSection>

          <QueueSection title="Partners awaiting a certification demo" emptyText="No partners waiting on a demo slot.">
            {awaitingDemo.map((p) => (
              <QueueRow
                key={p.id}
                href={`/admin/partners/${p.id}`}
                primary={p.firmName}
                secondary={p.contactName}
                meta={p.demoRequestedAt ? "Requested a slot" : "Awaiting outreach"}
                badge={p.demoRequestedAt ? <Badge variant="warning">Requested</Badge> : undefined}
              />
            ))}
          </QueueSection>

          <QueueSection title="Open support tickets" emptyText="No open support tickets.">
            {openTickets.map((t) => (
              <QueueRow
                key={t.id}
                href="/admin/support"
                primary={t.subject}
                secondary={`${t.user.name}${t.partner ? ` · ${t.partner.firmName}` : ""}`}
                meta={formatDate(t.createdAt)}
                badge={t.status === "ESCALATED" ? <Badge variant="danger">Escalated</Badge> : undefined}
              />
            ))}
          </QueueSection>
        </div>
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
    </div>
  );
}
