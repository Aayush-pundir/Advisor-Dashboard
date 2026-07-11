import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR } from "@/lib/utils";

export default async function AdminActionQueuePage() {
  const [
    pendingAccept,
    pendingCountersign,
    awaitingDemo,
    pendingDeals,
    pendingMdf,
    openTickets,
    highRiskClients,
  ] = await Promise.all([
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
      select: { id: true, firmName: true, contactName: true, demoRequestedAt: true, mouCountersignedAt: true },
    }),
    db.dealRegistration.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { partner: { select: { firmName: true } } },
    }),
    db.mdfRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { partner: { select: { firmName: true } } },
    }),
    db.supportTicket.findMany({
      where: { status: { in: ["OPEN", "ESCALATED"] } },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true } }, partner: { select: { firmName: true } } },
    }),
    db.lead.findMany({
      where: { riskLevel: "HIGH", stage: "CLOSED_WON" },
      orderBy: { healthScore: "asc" },
      include: { partner: { select: { firmName: true } } },
    }),
  ]);

  const totalItems =
    pendingAccept.length +
    pendingCountersign.length +
    awaitingDemo.length +
    pendingDeals.length +
    pendingMdf.length +
    openTickets.length +
    highRiskClients.length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Action Queue</h1>
        <p className="mt-1 text-muted">
          Everything across the program that&apos;s waiting on your team,
          in one place — {totalItems} item{totalItems === 1 ? "" : "s"} need
          attention.
        </p>
      </div>

      <QueueSection
        title="Partner leads awaiting acceptance"
        emptyText="No new partner leads waiting."
      >
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

      <QueueSection
        title="MOUs awaiting countersignature"
        emptyText="No MOUs waiting on a countersignature."
      >
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

      <QueueSection
        title="Partners awaiting a certification demo"
        emptyText="No partners waiting on a demo slot."
      >
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

      <QueueSection
        title="Deal registrations pending review"
        emptyText="No deal registrations pending."
      >
        {pendingDeals.map((d) => (
          <QueueRow
            key={d.id}
            href="/admin/deals"
            primary={d.businessName}
            secondary={d.partner.firmName}
            meta={formatDate(d.createdAt)}
          />
        ))}
      </QueueSection>

      <QueueSection
        title="MDF requests pending review"
        emptyText="No MDF requests pending."
      >
        {pendingMdf.map((m) => (
          <QueueRow
            key={m.id}
            href="/admin/mdf"
            primary={m.title}
            secondary={`${m.partner.firmName} · ${formatINR(m.requestedAmount)}`}
            meta={formatDate(m.createdAt)}
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

      <QueueSection title="High churn-risk clients" emptyText="No clients currently at high risk.">
        {highRiskClients.map((l) => (
          <QueueRow
            key={l.id}
            href="/admin/clients"
            primary={l.businessName}
            secondary={l.partner.firmName}
            meta={`Health ${l.healthScore ?? "—"}`}
            badge={<Badge variant="danger">High risk</Badge>}
          />
        ))}
      </QueueSection>
    </div>
  );
}

function QueueSection({
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
    <Card>
      <div className="border-b border-border px-5 py-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="divide-y divide-border">
        {hasItems ? children : <p className="p-5 text-center text-sm text-muted">{emptyText}</p>}
      </div>
    </Card>
  );
}

function QueueRow({
  href,
  primary,
  secondary,
  meta,
  badge,
}: {
  href: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-brand-light/40">
      <div>
        <p className="font-medium">{primary}</p>
        {secondary && <p className="mt-0.5 text-xs text-muted">{secondary}</p>}
      </div>
      <div className="flex items-center gap-2">
        {meta && <span className="text-xs text-muted">{meta}</span>}
        {badge}
      </div>
    </Link>
  );
}
