import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { TicketActions } from "@/components/admin/ticket-actions";

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

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    include: { user: { select: { name: true, email: true } }, partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <p className="mt-1 text-muted">
        Raised from the support widget by partners and internal team members alike.
      </p>

      <Card className="mt-6 divide-y divide-border">
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
                {formatDate(t.createdAt)} &middot; {ESCALATION_LABELS[t.escalationLevel]}
              </p>
            </div>
            <TicketActions ticketId={t.id} status={t.status} />
          </div>
        ))}
        {tickets.length === 0 && (
          <p className="p-6 text-center text-muted">No support tickets yet.</p>
        )}
      </Card>
    </div>
  );
}
