import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import { MDF_STATUS_LABELS, type MdfStatus } from "@/lib/enums";
import { RequestMdfForm } from "@/components/partner/request-mdf-form";

const statusVariant: Record<MdfStatus, "neutral" | "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  APPROVED: "default",
  REJECTED: "danger",
  PAID: "success",
};

export default async function PartnerMdfPage() {
  const session = await getSession();
  const requests = await db.mdfRequest.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Market Development Funds</h1>
      <p className="mt-1 text-muted">
        Request co-marketing budget for a local campaign, webinar, or
        activation — your Partner Manager reviews and approves an amount.
      </p>

      <RequestMdfForm />

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Requested</th>
              <th className="p-3 font-medium">Approved</th>
              <th className="p-3 font-medium">Submitted</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{r.title}</p>
                  {r.description && <p className="text-xs text-muted">{r.description}</p>}
                </td>
                <td className="p-3">{formatINR(r.requestedAmount)}</td>
                <td className="p-3">{r.approvedAmount != null ? formatINR(r.approvedAmount) : "—"}</td>
                <td className="p-3 text-muted">{formatDate(r.createdAt)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[r.status as MdfStatus]}>
                    {MDF_STATUS_LABELS[r.status as MdfStatus]}
                  </Badge>
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
