import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import type { RiskLevel } from "@/lib/enums";
import { ClientHealthActions } from "@/components/admin/client-health-actions";
import { recomputeAllClientHealth } from "@/app/actions/health";

const riskVariant: Record<RiskLevel, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export default async function AdminClientsPage() {
  await recomputeAllClientHealth();

  const clients = await db.lead.findMany({
    where: { stage: "CLOSED_WON" },
    include: { partner: { select: { firmName: true } } },
    orderBy: [{ riskLevel: "desc" }, { healthScore: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Post-Sale Client Health</h1>
      <p className="mt-1 text-muted">
        Every closed-won client, scored on recency of contact, support load,
        and NPS — sorted highest churn risk first so account teams triage
        the right accounts.
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Referred by</th>
              <th className="p-3 font-medium">Deal value</th>
              <th className="p-3 font-medium">Health</th>
              <th className="p-3 font-medium">Risk</th>
              <th className="p-3 font-medium">NPS</th>
              <th className="p-3 font-medium">Last activity</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{c.businessName}</p>
                  <p className="text-xs text-muted">{c.contactName}</p>
                </td>
                <td className="p-3 text-muted">{c.partner.firmName}</td>
                <td className="p-3">{formatINR(c.dealValue)}</td>
                <td className="p-3 font-medium">{c.healthScore ?? "—"}</td>
                <td className="p-3">
                  <Badge variant={riskVariant[c.riskLevel as RiskLevel]}>{c.riskLevel}</Badge>
                </td>
                <td className="p-3 text-muted">{c.npsScore ?? "—"}</td>
                <td className="p-3 text-muted">
                  {c.lastActivityAt ? formatDate(c.lastActivityAt) : "Never logged"}
                </td>
                <td className="p-3">
                  <ClientHealthActions leadId={c.id} npsScore={c.npsScore} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="p-6 text-center text-muted">No closed-won clients yet.</p>
        )}
      </Card>
    </div>
  );
}
