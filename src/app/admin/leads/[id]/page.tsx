import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR, maskPhone, maskEmail } from "@/lib/utils";
import { LEAD_STAGE_LABELS, type LeadStage, type UserRole } from "@/lib/enums";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import { RevealPii } from "@/components/admin/reveal-pii";
import { RecordTimeline } from "@/components/shared/record-timeline";

const stageVariant: Record<LeadStage, "neutral" | "default" | "success" | "warning" | "danger"> = {
  CAPTURED: "neutral",
  QUALIFIED: "default",
  CONTACTED: "default",
  DEMO: "warning",
  PROPOSAL: "warning",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [lead, actor, notes, activities] = await Promise.all([
    db.lead.findUnique({
      where: { id },
      include: { partner: { select: { id: true, firmName: true } }, assignedTo: { select: { name: true } } },
    }),
    getAuthedUser(),
    db.note.findMany({ where: { relatedToType: "LEAD", relatedToId: id }, orderBy: { createdAt: "desc" } }),
    db.recordActivity.findMany({ where: { relatedToType: "LEAD", relatedToId: id }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!lead) notFound();

  const canManage = actor ? canManageLeads(actor.role as UserRole) : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.businessName}</h1>
          <p className="mt-1 text-muted">
            {lead.contactName} &middot; referred by{" "}
            <Link href={`/admin/partners/${lead.partner.id}`} className="text-brand-dark hover:underline">
              {lead.partner.firmName}
            </Link>
          </p>
        </div>
        <Badge variant={stageVariant[lead.stage as LeadStage]}>{LEAD_STAGE_LABELS[lead.stage as LeadStage]}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Lead score</p>
          <p className="mt-1 text-xl font-semibold">{lead.score} / 100</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Deal value</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(lead.dealValue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Source</p>
          <p className="mt-1 text-xl font-semibold">{lead.source}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Assigned to</p>
          <p className="mt-1 text-xl font-semibold">{lead.assignedTo?.name ?? "Unassigned"}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">POC details</h3>
        <div className="mt-2 text-sm">
          {canManage ? (
            <RevealPii leadId={lead.id} maskedPhone={maskPhone(lead.phone)} maskedEmail={maskEmail(lead.email)} />
          ) : (
            <div className="text-xs">
              <p>{maskPhone(lead.phone)}</p>
              <p className="text-muted">{maskEmail(lead.email)}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">Captured {formatDate(lead.createdAt)}</p>
        {lead.stage === "CLOSED_LOST" && lead.lossReason && (
          <p className="mt-1 text-xs text-rose-600">Loss reason: {lead.lossReason}</p>
        )}
      </Card>

      <RecordTimeline relatedToType="LEAD" relatedToId={lead.id} notes={notes} activities={activities} />
    </div>
  );
}
