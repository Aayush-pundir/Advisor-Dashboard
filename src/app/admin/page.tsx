import { db } from "@/lib/db";
import { getAdminOverview } from "@/lib/queries/admin";
import { escalateOverdueActivities } from "@/lib/escalate-activities";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { QueueRow } from "@/components/admin/queue-row";
import { formatINR, formatDate } from "@/lib/utils";
import { PARTNER_STAGE_LABELS, LEAD_STAGE_LABELS, type PartnerStage, type LeadStage } from "@/lib/enums";
import { CsvExportButton } from "@/components/admin/csv-export-button";

export default async function AdminOverviewPage() {
  await escalateOverdueActivities();

  const {
    certifiedCount,
    activeCount,
    stageCounts,
    leadStageCounts,
    totalClientsOnboarded,
    totalRevenue,
    totalAdvisoryFeesPaid,
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

  const hotLeads = await db.lead.findMany({
    where: {
      score: { gte: 70 },
      stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] },
      OR: [{ contactedAt: null }, { assignedToId: null }],
    },
    orderBy: { score: "desc" },
    take: 10,
    include: { partner: { select: { firmName: true } } },
  });

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

      <div>
        <h2 className="text-lg font-semibold">Program performance</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile label="Certified partners" value={String(certifiedCount)} />
          <StatTile label="Active partners" value={String(activeCount)} hint="running campaigns" />
          <StatTile label="Total clients onboarded" value={String(totalClientsOnboarded)} />
          <StatTile label="Total client revenue" value={formatINR(totalRevenue)} hint="lifetime, all partners" />
          <StatTile label="Total advisory fees paid" value={formatINR(totalAdvisoryFeesPaid)} />
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

      <div>
        <h2 className="text-lg font-semibold">
          Needs your attention{" "}
          {queueTotal > 0 && (
            <span className="ml-1 text-sm font-normal text-muted">({queueTotal})</span>
          )}
        </h2>
        <div className="mt-3 grid gap-4 overflow-x-auto pb-2 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-[minmax(230px,1fr)]">
          <QueueColumn title="Partner leads awaiting acceptance" emptyText="No new partner leads waiting.">
            {pendingAccept.map((p) => (
              <QueueRow
                key={p.id}
                href={`/admin/partners/${p.id}`}
                primary={p.firmName}
                secondary={p.contactName}
                meta={formatDate(p.createdAt)}
              />
            ))}
          </QueueColumn>

          <QueueColumn title="MOUs awaiting countersignature" emptyText="No MOUs waiting on a countersignature.">
            {pendingCountersign.map((p) => (
              <QueueRow
                key={p.id}
                href={`/admin/partners/${p.id}`}
                primary={p.firmName}
                secondary={p.contactName}
                meta={p.acceptedAt ? formatDate(p.acceptedAt) : ""}
              />
            ))}
          </QueueColumn>

          <QueueColumn title="Awaiting certification demo" emptyText="No partners waiting on a demo slot.">
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
          </QueueColumn>

          <QueueColumn title="Open support tickets" emptyText="No open support tickets.">
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
          </QueueColumn>

          <QueueColumn title="Hot leads needing attention" emptyText="No high-scoring leads waiting on contact or assignment.">
            {hotLeads.map((l) => (
              <QueueRow
                key={l.id}
                href={`/admin/leads/${l.id}`}
                primary={l.businessName}
                secondary={l.partner.firmName}
                meta={!l.assignedToId ? "Unassigned" : !l.contactedAt ? "Not yet contacted" : undefined}
                badge={<Badge variant="success">{l.score}</Badge>}
              />
            ))}
          </QueueColumn>
        </div>
      </div>
    </div>
  );
}

function QueueColumn({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <Card className="flex min-w-[230px] flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="flex flex-1 flex-col divide-y divide-border">
        {hasItems ? children : <p className="p-4 text-center text-xs text-muted">{emptyText}</p>}
      </div>
    </Card>
  );
}
