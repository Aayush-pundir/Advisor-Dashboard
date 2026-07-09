import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { icpTotal, PARTNER_STAGE_LABELS, type PartnerStage } from "@/lib/enums";

const stageVariant: Record<PartnerStage, "neutral" | "default" | "warning" | "success"> = {
  LEAD: "neutral",
  MEETING_SCHEDULED: "default",
  ONBOARDING: "warning",
  CERTIFIED: "success",
  ACTIVE: "success",
  DORMANT: "neutral",
};

export default async function AdminPartnersPage() {
  const partners = await db.partner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partners (CRM)</h1>
          <p className="mt-1 text-muted">
            ICP-scored CA pipeline — pursue 70+, skip &lt;50 (Step 1.2).
          </p>
        </div>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Firm</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">ICP score</th>
              <th className="p-3 font-medium">Stage</th>
              <th className="p-3 font-medium">Badge</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => {
              const score = icpTotal(p);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-brand-light/40">
                  <td className="p-3">
                    <Link href={`/admin/partners/${p.id}`} className="font-medium text-brand-dark hover:underline">
                      {p.firmName}
                    </Link>
                    <p className="text-xs text-muted">{p.contactName}</p>
                  </td>
                  <td className="p-3 text-muted">{p.city}</td>
                  <td className="p-3">
                    <span className={score >= 70 ? "font-medium text-emerald-700" : score < 50 ? "font-medium text-rose-600" : ""}>
                      {score}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={stageVariant[p.stage as PartnerStage]}>
                      {PARTNER_STAGE_LABELS[p.stage as PartnerStage]}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted">{p.badgeTier}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {partners.length === 0 && (
          <p className="p-6 text-center text-muted">No partners yet.</p>
        )}
      </Card>
    </div>
  );
}
