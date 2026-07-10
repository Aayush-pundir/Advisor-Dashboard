import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, type DealStatus } from "@/lib/enums";
import { RegisterDealForm } from "@/components/partner/register-deal-form";

const statusVariant: Record<DealStatus, "neutral" | "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CONVERTED: "default",
  EXPIRED: "neutral",
};

export default async function PartnerDealsPage() {
  const session = await getSession();
  const deals = await db.dealRegistration.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Deal Registration</h1>
      <p className="mt-1 text-muted">
        Lock in attribution on a prospect before you refer them — a 90-day
        channel-conflict protection window keeps another advisor from
        claiming the same client.
      </p>

      <RegisterDealForm />

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Registered</th>
              <th className="p-3 font-medium">Protected until</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{d.businessName}</p>
                  <p className="text-xs text-muted">{d.contactName}</p>
                </td>
                <td className="p-3 text-muted">{d.city}</td>
                <td className="p-3 text-muted">{formatDate(d.createdAt)}</td>
                <td className="p-3 text-muted">{formatDate(d.expiresAt)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[d.status as DealStatus]}>
                    {DEAL_STATUS_LABELS[d.status as DealStatus]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deals.length === 0 && (
          <p className="p-6 text-center text-muted">No deal registrations yet.</p>
        )}
      </Card>
    </div>
  );
}
