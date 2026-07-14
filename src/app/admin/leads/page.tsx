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
import { ReassignLeadSelect } from "@/components/admin/reassign-lead-select";
import { LEAD_CONFLICT_PROTECTION_DAYS } from "@/lib/enums";
import { conflictProtectionCutoff } from "@/lib/lead-conflict";
import { CsvExportButton } from "@/components/admin/csv-export-button";

export default async function AdminLeadsPage() {
  const [leads, actor, reps] = await Promise.all([
    db.lead.findMany({
      include: { partner: { select: { firmName: true } }, assignedTo: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getAuthedUser(),
    db.user.findMany({ where: { role: "SALES", active: true }, select: { id: true, name: true } }),
  ]);
  const canManage = actor ? canManageLeads(actor.role as UserRole) : false;

  const protectionCutoff = conflictProtectionCutoff();
  const phonePartners = new Map<string, Set<string>>();
  for (const l of leads) {
    if (l.stage === "CLOSED_LOST" || l.createdAt < protectionCutoff) continue;
    const set = phonePartners.get(l.phone) ?? new Set<string>();
    set.add(l.partnerId);
    phonePartners.set(l.phone, set);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lead-to-Revenue</h1>
          <p className="mt-1 text-muted">
            Every client lead, across every advisor — capture, qualify, contact,
            demo, close. Leads referred to the same contact by more than one
            advisor within {LEAD_CONFLICT_PROTECTION_DAYS} days are flagged as a
            channel conflict automatically.
          </p>
        </div>
        {canManage && <CsvExportButton href="/admin/leads/export" />}
      </div>

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
              <th className="p-3 font-medium">Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const hasConflict = (phonePartners.get(l.phone)?.size ?? 0) > 1;
              return (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <p className="font-medium">{l.businessName}</p>
                  <p className="text-xs text-muted">{l.contactName}</p>
                  {hasConflict && (
                    <Badge variant="danger" className="mt-1">
                      Channel conflict
                    </Badge>
                  )}
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
                <td className="p-3">
                  {canManage ? (
                    <ReassignLeadSelect leadId={l.id} assignedToId={l.assignedToId} reps={reps} />
                  ) : (
                    <span className="text-xs text-muted">{l.assignedTo?.name ?? "Unassigned"}</span>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="p-6 text-center text-muted">No leads yet.</p>
        )}
      </Card>
    </div>
  );
}
