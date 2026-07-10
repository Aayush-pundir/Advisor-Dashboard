import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate, maskPhone, maskEmail } from "@/lib/utils";
import { LEAD_STAGES, LEAD_STAGE_LABELS } from "@/lib/enums";
import type { LeadStage, UserRole } from "@/lib/enums";
import { LeadStageSelect } from "@/components/admin/lead-stage-select";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import { RevealPii } from "@/components/admin/reveal-pii";

export default async function AdminLeadsPage() {
  const [leads, actor] = await Promise.all([
    db.lead.findMany({
      include: { partner: { select: { firmName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getAuthedUser(),
  ]);
  const canManage = actor ? canManageLeads(actor.role as UserRole) : false;

  return (
    <div>
      <h1 className="text-2xl font-bold">Lead-to-Revenue Machine</h1>
      <p className="mt-1 text-muted">
        Every client lead, across every CA — capture, qualify, contact,
        demo, close (Step 6). SLA: same-day qualify, 24-hr contact, 7-day
        demo+proposal.
      </p>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Referred by</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Value</th>
              <th className="p-3 font-medium">Captured</th>
              <th className="p-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{l.businessName}</p>
                  <p className="text-xs text-muted">{l.contactName}</p>
                </td>
                <td className="p-3">
                  {canManage ? (
                    <RevealPii
                      leadId={l.id}
                      maskedPhone={maskPhone(l.phone)}
                      maskedEmail={maskEmail(l.email)}
                    />
                  ) : (
                    <div className="text-xs">
                      <p>{maskPhone(l.phone)}</p>
                      <p className="text-muted">{maskEmail(l.email)}</p>
                    </div>
                  )}
                </td>
                <td className="p-3 text-muted">{l.partner.firmName}</td>
                <td className="p-3 text-muted">{l.source}</td>
                <td className="p-3">{formatINR(l.dealValue)}</td>
                <td className="p-3 text-muted">{formatDate(l.createdAt)}</td>
                <td className="p-3">
                  {canManage ? (
                    <LeadStageSelect
                      leadId={l.id}
                      current={l.stage}
                      stages={LEAD_STAGES}
                      labels={LEAD_STAGE_LABELS}
                    />
                  ) : (
                    <Badge variant="neutral">{LEAD_STAGE_LABELS[l.stage as LeadStage]}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="p-6 text-center text-muted">No leads yet.</p>
        )}
      </Card>
    </div>
  );
}
