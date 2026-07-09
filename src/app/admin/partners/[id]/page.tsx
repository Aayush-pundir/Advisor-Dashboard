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
  type AssetKey,
  type AssetStatus,
  type PartnerStage,
} from "@/lib/enums";
import { advancePartnerStageAction, certifyPartnerAction } from "@/app/actions/partner";

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

  const score = icpTotal(partner);
  const deliveredAssets = partner.assetKitItems.filter((a) => a.status === "DELIVERED").length;

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

      <div className="grid gap-4 sm:grid-cols-4">
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
      </div>

      {/* Onboarding actions — Step 1.3-1.4 / Step 4 */}
      {partner.stage !== "CERTIFIED" && partner.stage !== "ACTIVE" && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {partner.stage === "LEAD" && (
              <form action={advancePartnerStageAction.bind(null, partner.id, "MEETING_SCHEDULED")}>
                <Button size="sm" variant="outline" type="submit">
                  Schedule meeting & demo
                </Button>
              </form>
            )}
            {(partner.stage === "LEAD" || partner.stage === "MEETING_SCHEDULED") && (
              <form action={advancePartnerStageAction.bind(null, partner.id, "ONBOARDING")}>
                <Button size="sm" variant="outline" type="submit">
                  Verify ICAI + send MSA
                </Button>
              </form>
            )}
            <form action={certifyPartnerAction.bind(null, partner.id)}>
              <Button size="sm" type="submit">
                Mark demo attended — Certify + issue asset kit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Per-CA checklist — Step 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Per-CA creation checklist (Step 3)</CardTitle>
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
    </div>
  );
}
