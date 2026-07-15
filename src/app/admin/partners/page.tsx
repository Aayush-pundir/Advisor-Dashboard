import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn, formatINR, formatDate } from "@/lib/utils";
import { PartnersBulkUploader } from "@/components/admin/partners-bulk-uploader";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { buildDuplicateMap } from "@/lib/duplicate-detection";
import {
  PARTNER_STAGES,
  PARTNER_STAGE_LABELS,
  BADGE_TIERS,
  CERT_LEVELS,
  CERT_LEVEL_LABELS,
  type PartnerStage,
  type CertLevel,
} from "@/lib/enums";

const stageVariant: Record<PartnerStage, "neutral" | "default" | "warning" | "success"> = {
  LEAD: "neutral",
  MEETING_SCHEDULED: "default",
  ONBOARDING: "warning",
  CERTIFIED: "success",
  ACTIVE: "success",
  DORMANT: "neutral",
};

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; tier?: string; cert?: string; city?: string; view?: string }>;
}) {
  const { stage, tier, cert, city, view } = await searchParams;
  const activeView = view === "referrals" ? "referrals" : "partners";

  const [partners, allPartners] = await Promise.all([
    db.partner.findMany({
      where: {
        ...(stage ? { stage } : {}),
        ...(tier ? { badgeTier: tier } : {}),
        ...(cert ? { certLevel: cert } : {}),
        ...(city ? { city: { contains: city } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    db.partner.findMany({ select: { id: true, firmName: true, email: true, phone: true, stage: true, city: true, state: true } }),
  ]);

  const cityCounts = new Map<string, number>();
  for (const p of allPartners) {
    if (p.stage === "DORMANT") continue;
    const key = `${p.city.toLowerCase()}, ${p.state.toLowerCase()}`;
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }

  const duplicateMap = buildDuplicateMap(allPartners);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partners (CRM)</h1>
        </div>
        <div className="flex items-center gap-2">
          <CsvExportButton href="/admin/partners/export" label="Export CSV" />
          <PartnersBulkUploader />
        </div>
      </div>

      <div className="mt-4 flex gap-1 border-b border-border">
        <Link
          href="/admin/partners"
          className={cn(
            "border-b-2 px-4 py-2 text-sm font-medium",
            activeView === "partners" ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
          )}
        >
          All Partners
        </Link>
        <Link
          href="/admin/partners?view=referrals"
          className={cn(
            "border-b-2 px-4 py-2 text-sm font-medium",
            activeView === "referrals" ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
          )}
        >
          Referral Network
        </Link>
      </div>

      {activeView === "referrals" ? (
        <ReferralNetworkView />
      ) : (
      <>
      <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">Stage</label>
          <select
            name="stage"
            defaultValue={stage ?? ""}
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">All stages</option>
            {PARTNER_STAGES.map((s) => (
              <option key={s} value={s}>
                {PARTNER_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Tier</label>
          <select
            name="tier"
            defaultValue={tier ?? ""}
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">All tiers</option>
            {BADGE_TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Certification</label>
          <select
            name="cert"
            defaultValue={cert ?? ""}
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">All levels</option>
            {CERT_LEVELS.map((c) => (
              <option key={c} value={c}>
                {CERT_LEVEL_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">City</label>
          <input
            name="city"
            defaultValue={city ?? ""}
            placeholder="e.g. Mumbai"
            className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {(stage || tier || cert || city) && (
          <Link href="/admin/partners" className="text-sm text-muted hover:text-brand hover:underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-3 text-xs text-muted">
        {partners.length} of {allPartners.length} partners
      </p>

      <Card className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Firm</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Stage</th>
              <th className="p-3 font-medium">Tier</th>
              <th className="p-3 font-medium">Certification</th>
              <th className="p-3 font-medium">Live page</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => {
              const cityKey = `${p.city.toLowerCase()}, ${p.state.toLowerCase()}`;
              const hasOverlap = p.stage !== "DORMANT" && (cityCounts.get(cityKey) ?? 0) > 1;
              const dupes = duplicateMap.get(p.id) ?? [];
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-brand-light/40">
                  <td className="p-3">
                    <Link href={`/admin/partners/${p.id}`} className="font-medium text-brand-dark hover:underline">
                      {p.firmName}
                    </Link>
                    <p className="text-xs text-muted">{p.contactName}</p>
                    {dupes.length > 0 && (
                      <Badge variant="warning" className="mt-1" title={`Possibly the same firm as: ${dupes.map((d) => d.firmName).join(", ")}`}>
                        Possible duplicate
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-muted">
                    <p>{p.city}</p>
                    {hasOverlap && (
                      <Badge variant="danger" className="mt-1">
                        Territory overlap
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant={stageVariant[p.stage as PartnerStage]}>
                      {PARTNER_STAGE_LABELS[p.stage as PartnerStage]}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted">{p.badgeTier}</td>
                  <td className="p-3 text-muted">{CERT_LEVEL_LABELS[p.certLevel as CertLevel]}</td>
                  <td className="p-3">
                    {p.stage === "CERTIFIED" || p.stage === "ACTIVE" ? (
                      <a
                        href={`/advisor/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-dark hover:underline"
                      >
                        View &#8599;
                      </a>
                    ) : (
                      <span className="text-xs text-muted">Not live yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {partners.length === 0 && (
          <p className="p-6 text-center text-muted">No partners yet.</p>
        )}
      </Card>
      </>
      )}
    </div>
  );
}

async function ReferralNetworkView() {
  const partners = await db.partner.findMany({
    include: {
      referrals: { select: { id: true, firmName: true, stage: true, createdAt: true } },
      referralBonusesEarned: { select: { amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const roots = partners.filter((p) => p.referrals.length > 0);
  const totalBonusesPaid = partners
    .flatMap((p) => p.referralBonusesEarned)
    .filter((b) => b.status === "PAID")
    .reduce((s, b) => s + b.amount, 0);
  const totalReferrals = partners.reduce((s, p) => s + p.referrals.length, 0);

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Referring partners</p>
          <p className="mt-1 text-xl font-semibold">{roots.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Total referrals</p>
          <p className="mt-1 text-xl font-semibold">{totalReferrals}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Bonuses paid</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(totalBonusesPaid)}</p>
        </Card>
      </div>

      <Card className="mt-6 divide-y divide-border">
        {roots.map((p) => {
          const bonusEarned = p.referralBonusesEarned.reduce((s, b) => s + b.amount, 0);
          return (
            <div key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <Link href={`/admin/partners/${p.id}`} className="font-medium text-brand-dark hover:underline">
                  {p.firmName}
                </Link>
                <span className="text-xs text-muted">
                  {p.referrals.length} referred &middot; {formatINR(bonusEarned)} earned
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1 border-l-2 border-border pl-4">
                {p.referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <Link href={`/admin/partners/${r.id}`} className="hover:underline">
                      {r.firmName}
                    </Link>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {formatDate(r.createdAt)}
                      <Badge variant="neutral">{r.stage}</Badge>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {roots.length === 0 && (
          <p className="p-6 text-center text-muted">No referrals yet.</p>
        )}
      </Card>
    </div>
  );
}
