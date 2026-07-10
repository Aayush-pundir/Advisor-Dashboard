import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/ui/stat-tile";
import { formatINR, formatDate } from "@/lib/utils";
import type { CommissionStatus, UserRole } from "@/lib/enums";
import { getAuthedUser } from "@/lib/auth";
import { canViewCommissions } from "@/lib/permissions";
import { CsvExportButton } from "@/components/admin/csv-export-button";

const statusVariant: Record<CommissionStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  CREDITED: "warning",
  PAID: "success",
};

export default async function AdminCommissionsPage() {
  const actor = await getAuthedUser();
  if (!actor || !canViewCommissions(actor.role as UserRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold">You don&apos;t have access to the commission ledger</p>
        <p className="mt-1 text-muted">This view is limited to Admin, Partner Manager, and Sales roles.</p>
      </div>
    );
  }

  const commissions = await db.commission.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalCredited = commissions
    .filter((c) => c.status !== "PENDING")
    .reduce((s, c) => s + c.amount, 0);
  const totalPending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((s, c) => s + c.amount, 0);
  const year1Total = commissions
    .filter((c) => c.type === "YEAR1")
    .reduce((s, c) => s + c.amount, 0);
  const trailingTotal = commissions
    .filter((c) => c.type === "TRAILING")
    .reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commission Ledger</h1>
          <p className="mt-1 text-muted">
            15% Year-1 + 5% trailing advisory fee, auto-credited to CA wallets
            on client go-live (Step 1.1 / Step 6.6).
          </p>
        </div>
        <CsvExportButton href="/admin/commissions/export" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Credited" value={formatINR(totalCredited)} />
        <StatTile label="Pending" value={formatINR(totalPending)} />
        <StatTile label="Year-1 fees (15%)" value={formatINR(year1Total)} />
        <StatTile label="Trailing fees (5%)" value={formatINR(trailingTotal)} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Partner</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3">{c.partner.firmName}</td>
                <td className="p-3 text-muted">{c.type.replace("_", " ")}</td>
                <td className="p-3 font-medium">{formatINR(c.amount)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[c.status as CommissionStatus]}>
                    {c.status}
                  </Badge>
                </td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && (
          <p className="p-6 text-center text-muted">No commissions yet.</p>
        )}
      </Card>
    </div>
  );
}
