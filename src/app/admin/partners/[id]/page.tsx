import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/utils";
import {
  icpTotal,
  ASSET_LABELS,
  PARTNER_STAGE_LABELS,
  CERT_LEVEL_LABELS,
  type AssetKey,
  type AssetStatus,
  type PartnerStage,
  type CertLevel,
} from "@/lib/enums";
import {
  acceptPartnerLeadAction,
  countersignMouAction,
  certifyPartnerAction,
} from "@/app/actions/partner";
import { ScheduleDemoForm } from "@/components/admin/schedule-demo-form";
import { getAuthedUser } from "@/lib/auth";
import { canManagePartners } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { RecordTimeline } from "@/components/shared/record-timeline";
import { findPossibleDuplicates } from "@/lib/duplicate-detection";
import { MergePartnerButton } from "@/components/admin/merge-partner-button";
import Link from "next/link";

const assetStatusVariant: Record<AssetStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  IN_PROGRESS: "warning",
  DELIVERED: "success",
};

export default async function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await db.partner.findUnique({
    where: { id },
    include: {
      assetKitItems: true,
      leads: { orderBy: { createdAt: "desc" } },
      commissions: true,
      badges: true,
    },
  });
  if (!partner) notFound();

  const actor = await getAuthedUser();
  const canManage = actor ? canManagePartners(actor.role as UserRole) : false;

  const [notes, activities] = await Promise.all([
    db.note.findMany({ where: { relatedToType: "PARTNER", relatedToId: partner.id }, orderBy: { createdAt: "desc" } }),
    db.recordActivity.findMany({ where: { relatedToType: "PARTNER", relatedToId: partner.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const score = icpTotal(partner);
  const deliveredAssets = partner.assetKitItems.filter((a) => a.status === "DELIVERED").length;

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

      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">ICP score</p>
          <p className="mt-1 text-xl font-semibold">{score} / 100</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Asset kit</p>
          <p className="mt-1 text-xl font-semibold">
            {deliveredAssets}/{partner.assetKitItems.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Leads</p>
          <p className="mt-1 text-xl font-semibold">{partner.leads.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Commissions</p>
          <p className="mt-1 text-xl font-semibold">
            {formatINR(partner.commissions.reduce((s, c) => s + c.amount, 0))}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Tier / Certification</p>
          <p className="mt-1 text-xl font-semibold">{partner.badgeTier}</p>
          <p className="text-xs text-muted">{CERT_LEVEL_LABELS[partner.certLevel as CertLevel]}</p>
        </Card>
      </div>

      {/* Onboarding journey — Step 1.3-1.4 / Step 4 */}
      {canManage && partner.stage !== "CERTIFIED" && partner.stage !== "ACTIVE" && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding journey</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <span className={partner.acceptedAt ? "text-emerald-600" : "text-muted"}>
                  {partner.acceptedAt ? "✓" : "○"}
                </span>
                MOU submitted &amp; accepted{partner.acceptedAt && ` — ${formatDate(partner.acceptedAt)}`}
              </li>
              <li className="flex items-center gap-2">
                <span className={partner.mouCountersignedAt ? "text-emerald-600" : "text-muted"}>
                  {partner.mouCountersignedAt ? "✓" : "○"}
                </span>
                MOU countersigned by OmniCard{partner.mouCountersignedAt && ` — ${formatDate(partner.mouCountersignedAt)}`}
              </li>
              <li className="flex items-center gap-2">
                <span className={partner.demoScheduledAt ? "text-emerald-600" : "text-muted"}>
                  {partner.demoScheduledAt ? "✓" : "○"}
                </span>
                Certification demo scheduled{partner.demoScheduledAt && ` — ${formatDate(partner.demoScheduledAt)}`}
                {partner.demoRequestedAt && !partner.demoScheduledAt && (
                  <Badge variant="warning">Partner requested a slot</Badge>
                )}
              </li>
              <li className="flex items-center gap-2">
                <span className={partner.demoAttendedAt ? "text-emerald-600" : "text-muted"}>
                  {partner.demoAttendedAt ? "✓" : "○"}
                </span>
                Demo attended &amp; certified
              </li>
            </ol>

            <div className="flex flex-wrap gap-3 border-t border-border pt-4">
              {partner.stage === "LEAD" && (
                <form action={acceptPartnerLeadAction.bind(null, partner.id)}>
                  <Button size="sm" type="submit">
                    Accept &amp; schedule intro call
                  </Button>
                </form>
              )}
              {partner.stage === "MEETING_SCHEDULED" && (
                <form action={countersignMouAction.bind(null, partner.id)}>
                  <Button size="sm" type="submit">
                    Countersign MOU
                  </Button>
                </form>
              )}
              {partner.stage === "ONBOARDING" && <ScheduleDemoForm partnerId={partner.id} />}
              {partner.stage === "ONBOARDING" && (
                <form action={certifyPartnerAction.bind(null, partner.id)}>
                  <Button size="sm" variant="outline" type="submit">
                    Mark demo attended — Certify + issue asset kit
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-CA checklist — Step 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Asset kit checklist</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {partner.assetKitItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium">{ASSET_LABELS[item.key as AssetKey]}</p>
                <p className="text-xs text-muted">Owner: {item.owner}</p>
              </div>
              <Badge variant={assetStatusVariant[item.status as AssetStatus]}>
                {item.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
          {partner.assetKitItems.length === 0 && (
            <p className="p-6 text-center text-muted">
              Asset kit generates automatically on certification.
            </p>
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
                  <td className="p-3">{l.businessName}</td>
                  <td className="p-3">{l.stage}</td>
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

      <RecordTimeline relatedToType="PARTNER" relatedToId={partner.id} notes={notes} activities={activities} />
    </div>
  );
}
