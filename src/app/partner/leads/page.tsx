import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import { LEAD_STAGE_LABELS, type LeadStage } from "@/lib/enums";

const stageVariant: Record<LeadStage, "neutral" | "default" | "success" | "warning" | "danger"> = {
  CAPTURED: "neutral",
  QUALIFIED: "default",
  CONTACTED: "default",
  DEMO: "warning",
  PROPOSAL: "warning",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
};

export default async function PartnerLeadsPage() {
  const session = await getSession();
  const leads = await db.lead.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads & Pipeline</h1>
      <p className="mt-1 text-muted">
        Every client lead referred through your link, tracked live from
        capture to close (Step 6).
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Stage</th>
              <th className="p-3 font-medium">Deal value</th>
              <th className="p-3 font-medium">Captured</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{l.businessName}</td>
                <td className="p-3 text-muted">{l.contactName}</td>
                <td className="p-3 text-muted">{l.source}</td>
                <td className="p-3">
                  <Badge variant={stageVariant[l.stage as LeadStage]}>
                    {LEAD_STAGE_LABELS[l.stage as LeadStage]}
                  </Badge>
                </td>
                <td className="p-3">{formatINR(l.dealValue)}</td>
                <td className="p-3 text-muted">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="p-6 text-center text-muted">
            No leads yet. Share your referral link to get started.
          </p>
        )}
      </Card>
    </div>
  );
}
