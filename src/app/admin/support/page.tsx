import { db } from "@/lib/db";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { TicketActions } from "@/components/admin/ticket-actions";
import { CsvExportButton } from "@/components/admin/csv-export-button";

const ESCALATION_LABELS: Record<number, string> = {
  1: "L1 · Partner Success",
  2: "L2 · Partner Manager",
  3: "L3 · Regional Head",
  4: "L4 · Leadership",
};

const priorityVariant: Record<string, "neutral" | "default" | "warning" | "danger"> = {
  LOW: "neutral",
  NORMAL: "default",
  HIGH: "warning",
  URGENT: "danger",
};

const statusVariant: Record<string, "neutral" | "warning" | "danger" | "success"> = {
  OPEN: "neutral",
  IN_PROGRESS: "warning",
  ESCALATED: "danger",
  RESOLVED: "success",
};

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; from?: string; to?: string }>;
}) {
  const { status, priority, from, to } = await searchParams;

  const where = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const tickets = await db.supportTicket.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (priority) qs.set("priority", priority);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const exportHref = `/admin/support/export${qs.toString() ? `?${qs.toString()}` : ""}`;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="mt-1 text-muted">
            Raised from the support widget by partners and internal team members alike.
          </p>
        </div>
        <CsvExportButton href={exportHref} />
      </div>

      <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">Status</label>
          <select name="status" defaultValue={status ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Priority</label>
          <select name="priority" defaultValue={priority ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">From</label>
          <input type="date" name="from" defaultValue={from ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">To</label>
          <input type="date" name="to" defaultValue={to ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {(status || priority || from || to) && (
          <Link href="/admin/support" className="text-sm text-muted hover:text-brand hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-3 text-xs text-muted">{tickets.length} ticket(s)</p>

      <Card className="mt-3 divide-y divide-border">
        {tickets.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t.subject}</p>
                <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                <Badge variant={statusVariant[t.status]}>{t.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{t.message}</p>
              <p className="mt-2 text-xs text-muted">
                {t.user.name} ({t.user.email}) {t.partner && <>&middot; {t.partner.firmName}</>} &middot;{" "}
                Raised {formatDate(t.createdAt)} &middot; {ESCALATION_LABELS[t.escalationLevel]}
              </p>
              {t.status === "RESOLVED" && (
                <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                  <p className="font-medium">Resolved {t.resolvedAt ? formatDate(t.resolvedAt) : ""}</p>
                  {t.resolution && <p className="mt-0.5">{t.resolution}</p>}
                </div>
              )}
            </div>
            <TicketActions ticketId={t.id} status={t.status} />
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="p-6 text-center text-muted">No support tickets match these filters.</p>
        )}
      </Card>
    </div>
  );
}
