import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/ui/stat-tile";
import { FunnelChart } from "@/components/admin/funnel-chart";
import { formatDate, formatINR } from "@/lib/utils";
import {
  PARTNER_STAGE_LABELS,
  CERT_LEVEL_LABELS,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  type PartnerStage,
  type CertLevel,
  type LeadStage,
} from "@/lib/enums";
import {
  completeMouCountersignAction,
  completeDemoScheduleAction,
  completeCertificationAction,
  completeAssetKitDeliveredAction,
  updatePartnerPayoutAction,
} from "@/app/actions/partner";
import { OnboardingStageForm } from "@/components/admin/onboarding-stage-form";
import { MicrositeToggle } from "@/components/admin/microsite-toggle";
import { AssetKitManager } from "@/components/admin/asset-kit-manager";
import { getAuthedUser } from "@/lib/auth";
import { canManagePartners } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { RecordTimeline } from "@/components/shared/record-timeline";
import { findPossibleDuplicates } from "@/lib/duplicate-detection";
import { MergePartnerButton } from "@/components/admin/merge-partner-button";
import Link from "next/link";

export default async function AdminPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await db.partner.findUnique({
    where: { id },
    include: {
      assetKitItems: true,
      leads: { orderBy: { createdAt: "desc" } },
      commissions: true,
      badges: true,
      campaigns: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!partner) notFound();

  const actor = await getAuthedUser();
  const canManage = actor ? canManagePartners(actor.role as UserRole) : false;

  const [notes, activities, teamMembers] = await Promise.all([
    db.note.findMany({ where: { relatedToType: "PARTNER", relatedToId: partner.id }, orderBy: { createdAt: "desc" } }),
    db.recordActivity.findMany({ where: { relatedToType: "PARTNER", relatedToId: partner.id }, orderBy: { createdAt: "desc" } }),
    db.user.findMany({ where: { role: "OMNICARD_TEAM", active: true }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);
  const teamNames = teamMembers.map((t) => t.name);

  const deliveredAssets = partner.assetKitItems.filter((a) => a.status === "DELIVERED").length;
  const convertedLeads = partner.leads.filter((l) => l.stage === "CLOSED_WON");
  const totalRevenue = convertedLeads.reduce((sum, l) => sum + l.dealValue, 0);
  const totalAdvisoryFees = partner.commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  const leadFunnel = LEAD_STAGES.map((stage) => ({
    name: LEAD_STAGE_LABELS[stage as LeadStage],
    value: partner.leads.filter((l) => l.stage === stage).length,
  }));

  const allPartnersForDupeCheck = await db.partner.findMany({
    select: { id: true, firmName: true, email: true, phone: true },
  });
  const possibleDuplicates = findPossibleDuplicates(partner, allPartnersForDupeCheck);

  const overlappingPartners =
    partner.stage === "DORMANT"
      ? []
      : (
          await db.partner.findMany({
            where: { id: { not: partner.id }, stage: { not: "DORMANT" } },
            select: { id: true, firmName: true, city: true, state: true },
          })
        ).filter(
          (p) => p.city.toLowerCase() === partner.city.toLowerCase() && p.state.toLowerCase() === partner.state.toLowerCase(),
        );

  const mouCountersignedDone = !!partner.mouCountersignedAt;
  const demoScheduledDone = !!partner.demoScheduledAt;
  const demoAttendedDone = !!partner.demoAttendedAt;
  const assetKitDeliveredDone = !!partner.assetKitDeliveredAt;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{partner.firmName}</h1>
          <p className="mt-1 text-muted">
            {partner.contactName} &middot; {partner.email} &middot; {partner.city}, {partner.state}
          </p>
        </div>
        <Badge>{PARTNER_STAGE_LABELS[partner.stage as PartnerStage]}</Badge>
      </div>

      {overlappingPartners.length > 0 && (
        <Card className="border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-medium">Territory overlap</p>
          <p className="mt-1">
            {overlappingPartners.length} other active partner(s) also serve {partner.city}, {partner.state}:{" "}
            {overlappingPartners.map((p) => p.firmName).join(", ")}.
          </p>
        </Card>
      )}

      {canManage && possibleDuplicates.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Possible duplicate</p>
          <p className="mt-1">This firm looks similar to an existing partner record:</p>
          <div className="mt-3 flex flex-col gap-2">
            {possibleDuplicates.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 p-2">
                <Link href={`/admin/partners/${d.id}`} className="text-brand-dark hover:underline">
                  {d.firmName}
                </Link>
                <MergePartnerButton
                  survivorId={partner.id}
                  survivorFirmName={partner.firmName}
                  mergedId={d.id}
                  mergedFirmName={d.firmName}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold">Lead-to-revenue for this partner</h2>
        <Card className="mt-3">
          <CardContent>
            <FunnelChart data={leadFunnel} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Asset kits delivered" value={`${deliveredAssets}/${partner.assetKitItems.length}`} />
        <StatTile label="Marketing campaigns run" value={String(partner.campaigns.length)} />
        <StatTile label="Total leads provided" value={String(partner.leads.length)} />
        <StatTile label="Successfully converted leads" value={String(convertedLeads.length)} />
        <StatTile label="Revenue generated" value={formatINR(totalRevenue)} />
        <StatTile label="Total advisory fees" value={formatINR(totalAdvisoryFees)} />
        <StatTile label="Tier" value={partner.badgeTier} />
        <StatTile label="Certification" value={CERT_LEVEL_LABELS[partner.certLevel as CertLevel]} />
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding journey</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <OnboardingStep index={1} label="MOU submitted" done meta={`Auto-recorded from lead receipt on ${formatDate(partner.createdAt)}`} />

            <OnboardingStep
              index={2}
              label="MOU countersigned"
              done={mouCountersignedDone}
              meta={mouCountersignedDone ? formatDate(partner.mouCountersignedAt!) : undefined}
              comment={partner.mouCountersignedComment}
            >
              {!mouCountersignedDone && (
                <OnboardingStageForm
                  action={completeMouCountersignAction.bind(null, partner.id)}
                  locked={false}
                  submitLabel="Mark countersigned"
                />
              )}
            </OnboardingStep>

            <OnboardingStep
              index={3}
              label="Certification demo scheduled"
              done={demoScheduledDone}
              meta={
                demoScheduledDone
                  ? formatDate(partner.demoScheduledAt!)
                  : partner.demoRequestedAt
                    ? "Advisor requested a slot"
                    : undefined
              }
              comment={partner.demoScheduledComment}
            >
              {!demoScheduledDone && (
                <OnboardingStageForm
                  action={completeDemoScheduleAction.bind(null, partner.id)}
                  locked={!mouCountersignedDone}
                  submitLabel="Mark scheduled"
                />
              )}
            </OnboardingStep>

            <OnboardingStep
              index={4}
              label="Demo attended & certified"
              done={demoAttendedDone}
              meta={demoAttendedDone ? formatDate(partner.demoAttendedAt!) : undefined}
              comment={partner.demoAttendedComment}
            >
              {!demoAttendedDone && (
                <OnboardingStageForm
                  action={completeCertificationAction.bind(null, partner.id)}
                  locked={!demoScheduledDone}
                  submitLabel="Mark attended & certify"
                />
              )}
            </OnboardingStep>

            <OnboardingStep
              index={5}
              label="Asset kit delivered"
              done={assetKitDeliveredDone}
              meta={assetKitDeliveredDone ? formatDate(partner.assetKitDeliveredAt!) : undefined}
              comment={partner.assetKitDeliveredComment}
            >
              {!assetKitDeliveredDone && (
                <OnboardingStageForm
                  action={completeAssetKitDeliveredAction.bind(null, partner.id)}
                  locked={!demoAttendedDone}
                  submitLabel="Mark delivered"
                />
              )}
            </OnboardingStep>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Asset kit</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetKitManager partnerId={partner.id} items={partner.assetKitItems} teamNames={teamNames} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Co-branded marketing campaigns</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Content approved</th>
                <th className="p-3 font-medium">Live date</th>
              </tr>
            </thead>
            <tbody>
              {partner.campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{c.title}</td>
                  <td className="p-3 text-muted">{c.type}</td>
                  <td className="p-3">
                    <Badge variant="neutral">{c.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="p-3 text-muted">{c.contentApprovedAt ? formatDate(c.contentApprovedAt) : "—"}</td>
                  <td className="p-3 text-muted">{c.liveAt ? formatDate(c.liveAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {partner.campaigns.length === 0 && (
            <p className="p-6 text-center text-muted">No campaigns run for this partner yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads referred</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Business</th>
                <th className="p-3 font-medium">Stage</th>
                <th className="p-3 font-medium">Value</th>
                <th className="p-3 font-medium">Captured</th>
              </tr>
            </thead>
            <tbody>
              {partner.leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-brand-dark hover:underline">
                      {l.businessName}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Badge variant="neutral">{LEAD_STAGE_LABELS[l.stage as LeadStage]}</Badge>
                  </td>
                  <td className="p-3">{formatINR(l.dealValue)}</td>
                  <td className="p-3 text-muted">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {partner.leads.length === 0 && (
            <p className="p-6 text-center text-muted">No leads yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Co-branded landing page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {partner.stage === "CERTIFIED" || partner.stage === "ACTIVE" ? (
              <a
                href={`/advisor/${partner.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand-dark hover:underline"
              >
                omnicard.in/advisor/{partner.slug} &#8599;
              </a>
            ) : (
              <p className="text-sm text-muted">Not live yet — certify this partner first.</p>
            )}
            <p className="mt-1 text-xs text-muted">Status: {partner.micrositeEnabled ? "Live" : "Stopped"}</p>
          </div>
          {canManage && (partner.stage === "CERTIFIED" || partner.stage === "ACTIVE") && (
            <MicrositeToggle partnerId={partner.id} enabled={partner.micrositeEnabled} />
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Master data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <MasterField label="ICAI membership no." value={partner.icaiNumber} />
              <MasterField label="ICAI verified" value={partner.icaiVerified ? "Yes" : "No"} />
              <MasterField label="Designation" value={partner.designation} />
              <MasterField label="Referral code" value={partner.referralCode} />
              <MasterField label="MOU version" value={partner.mouVersion} />
              <MasterField label="MSA signed" value={partner.msaSignedAt ? formatDate(partner.msaSignedAt) : null} />
            </div>
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-semibold">Payout master details</p>
              <form action={updatePartnerPayoutAction.bind(null, partner.id)} className="grid gap-4 sm:grid-cols-2">
                <PayoutField label="Bank account name" name="bankAccountName" defaultValue={partner.bankAccountName} />
                <PayoutField label="Bank account number" name="bankAccountNumber" defaultValue={partner.bankAccountNumber} />
                <PayoutField label="IFSC" name="bankIfsc" defaultValue={partner.bankIfsc} />
                <PayoutField label="UPI ID" name="upiId" defaultValue={partner.upiId} />
                <PayoutField label="PAN" name="pan" defaultValue={partner.pan} />
                <PayoutField label="GST number" name="gstNumber" defaultValue={partner.gstNumber} />
                <div className="sm:col-span-2">
                  <Button type="submit" size="sm">
                    Save payout details
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      <RecordTimeline relatedToType="PARTNER" relatedToId={partner.id} notes={notes} activities={activities} />
    </div>
  );
}

function OnboardingStep({
  index,
  label,
  done,
  meta,
  comment,
  children,
}: {
  index: number;
  label: string;
  done: boolean;
  meta?: string;
  comment?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start gap-3">
        <span
          className={
            done
              ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs text-white"
              : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted"
          }
        >
          {done ? "✓" : index}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
          {comment && <p className="mt-1 text-xs italic text-muted">&ldquo;{comment}&rdquo;</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

function MasterField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-0.5 font-medium">{value || "—"}</p>
    </div>
  );
}

function PayoutField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
}) {
  return (
    <label className="text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
