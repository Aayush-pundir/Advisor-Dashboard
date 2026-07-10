import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";

const SLA_CONTACT_HOURS = 24;

export default async function AdminOpsPage() {
  const [reps, leads] = await Promise.all([
    db.user.findMany({ where: { role: "SALES", active: true }, select: { id: true, name: true } }),
    db.lead.findMany({ select: { assignedToId: true, stage: true, createdAt: true, contactedAt: true } }),
  ]);

  const unassigned = leads.filter((l) => !l.assignedToId).length;

  const contactedLeads = leads.filter((l) => l.contactedAt);
  const contactHours = contactedLeads.map(
    (l) => (l.contactedAt!.getTime() - l.createdAt.getTime()) / 3600000,
  );
  const avgContactHours = contactHours.length > 0 ? contactHours.reduce((s, h) => s + h, 0) / contactHours.length : null;
  const withinSla = contactHours.filter((h) => h <= SLA_CONTACT_HOURS).length;
  const slaPct = contactHours.length > 0 ? Math.round((withinSla / contactHours.length) * 100) : null;

  const perRep = reps.map((rep) => {
    const repLeads = leads.filter((l) => l.assignedToId === rep.id);
    const open = repLeads.filter((l) => !["CLOSED_WON", "CLOSED_LOST"].includes(l.stage)).length;
    const closedWon = repLeads.filter((l) => l.stage === "CLOSED_WON").length;
    const repContacted = repLeads.filter((l) => l.contactedAt);
    const repContactHours = repContacted.map(
      (l) => (l.contactedAt!.getTime() - l.createdAt.getTime()) / 3600000,
    );
    const repAvgHours = repContactHours.length > 0 ? repContactHours.reduce((s, h) => s + h, 0) / repContactHours.length : null;
    const repSlaPct =
      repContactHours.length > 0
        ? Math.round((repContactHours.filter((h) => h <= SLA_CONTACT_HOURS).length / repContactHours.length) * 100)
        : null;
    return { rep, total: repLeads.length, open, closedWon, repAvgHours, repSlaPct };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Ops Efficiency</h1>
      <p className="mt-1 text-muted">
        Round-robin lead routing keeps workload balanced across active sales
        reps — this view tracks whether the {SLA_CONTACT_HOURS}-hour
        first-contact SLA is being hit.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Unassigned leads"
          value={String(unassigned)}
          hint="should auto-clear as reps free up"
        />
        <StatTile
          label="Avg time to first contact"
          value={avgContactHours != null ? `${avgContactHours.toFixed(1)}h` : "—"}
          hint={`target under ${SLA_CONTACT_HOURS}h`}
        />
        <StatTile
          label="24-hr contact SLA"
          value={slaPct != null ? `${slaPct}%` : "—"}
          hint="of contacted leads"
        />
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Sales rep</th>
              <th className="p-3 font-medium">Assigned</th>
              <th className="p-3 font-medium">Open</th>
              <th className="p-3 font-medium">Closed won</th>
              <th className="p-3 font-medium">Avg time to contact</th>
              <th className="p-3 font-medium">SLA %</th>
            </tr>
          </thead>
          <tbody>
            {perRep.map(({ rep, total, open, closedWon, repAvgHours, repSlaPct }) => (
              <tr key={rep.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{rep.name}</td>
                <td className="p-3">{total}</td>
                <td className="p-3">{open}</td>
                <td className="p-3">{closedWon}</td>
                <td className="p-3 text-muted">{repAvgHours != null ? `${repAvgHours.toFixed(1)}h` : "—"}</td>
                <td className="p-3 text-muted">{repSlaPct != null ? `${repSlaPct}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {perRep.length === 0 && (
          <p className="p-6 text-center text-muted">No active sales reps yet.</p>
        )}
      </Card>
    </div>
  );
}
