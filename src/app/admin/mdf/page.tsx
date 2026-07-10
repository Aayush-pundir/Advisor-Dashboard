import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import { MDF_STATUS_LABELS, type MdfStatus } from "@/lib/enums";
import { MdfActions } from "@/components/admin/mdf-actions";

const statusVariant: Record<MdfStatus, "neutral" | "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  APPROVED: "default",
  REJECTED: "danger",
  PAID: "success",
};

export default async function AdminMdfPage() {
  const requests = await db.mdfRequest.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">MDF Requests</h1>
      <p className="mt-1 text-muted">
        Market Development Fund requests from partners — approve an amount
        (can differ from what was requested) and mark paid once disbursed.
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Partner</th>
              <th className="p-3 font-medium">Requested</th>
              <th className="p-3 font-medium">Submitted</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{r.title}</p>
                  {r.description && <p className="text-xs text-muted">{r.description}</p>}
                </td>
                <td className="p-3 text-muted">{r.partner.firmName}</td>
                <td className="p-3">{formatINR(r.requestedAmount)}</td>
                <td className="p-3 text-muted">{formatDate(r.createdAt)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[r.status as MdfStatus]}>
                    {MDF_STATUS_LABELS[r.status as MdfStatus]}
                  </Badge>
                </td>
                <td className="p-3">
                  <MdfActions mdfId={r.id} status={r.status} requestedAmount={r.requestedAmount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-6 text-center text-muted">No MDF requests yet.</p>
        )}
      </Card>
    </div>
  );
}
