import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, type DealStatus } from "@/lib/enums";
import { DealActions } from "@/components/admin/deal-actions";

const statusVariant: Record<DealStatus, "neutral" | "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CONVERTED: "default",
  EXPIRED: "neutral",
};

export default async function AdminDealsPage() {
  const deals = await db.dealRegistration.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const phoneCounts = new Map<string, number>();
  for (const d of deals) {
    if ((d.status === "PENDING" || d.status === "APPROVED") && d.expiresAt > now) {
      phoneCounts.set(d.phone, (phoneCounts.get(d.phone) ?? 0) + 1);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Deal Registrations</h1>
      <p className="mt-1 text-muted">
        Channel-conflict protection queue — approve to lock a 90-day
        attribution window, reject to release the prospect back to the pool.
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Partner</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Registered</th>
              <th className="p-3 font-medium">Protected until</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const hasConflict = (phoneCounts.get(d.phone) ?? 0) > 1 && (d.status === "PENDING" || d.status === "APPROVED");
              return (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{d.businessName}</p>
                    <p className="text-xs text-muted">{d.contactName} &middot; {d.phone}</p>
                  </td>
                  <td className="p-3 text-muted">{d.partner.firmName}</td>
                  <td className="p-3 text-muted">{d.city}</td>
                  <td className="p-3 text-muted">{formatDate(d.createdAt)}</td>
                  <td className="p-3 text-muted">{formatDate(d.expiresAt)}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={statusVariant[d.status as DealStatus]}>
                        {DEAL_STATUS_LABELS[d.status as DealStatus]}
                      </Badge>
                      {hasConflict && <Badge variant="danger">Conflict — multiple partners</Badge>}
                    </div>
                  </td>
                  <td className="p-3">
                    <DealActions dealId={d.id} status={d.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deals.length === 0 && (
          <p className="p-6 text-center text-muted">No deal registrations yet.</p>
        )}
      </Card>
    </div>
  );
}
