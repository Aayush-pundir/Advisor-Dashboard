import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_CATEGORIES,
  LEAD_CATEGORY_LABELS,
  LEAD_SOURCES,
  type LeadStage,
  type LeadCategory,
} from "@/lib/enums";
import { AddLeadForm } from "@/components/partner/add-lead-form";
import { LeadsBulkUploader } from "@/components/partner/leads-bulk-uploader";
import { MarketingContactsUploader } from "@/components/partner/marketing-contacts-uploader";
import { CsvExportButton } from "@/components/partner/csv-export-button";
import { FilterChip } from "@/components/shared/filter-chip";

const stageVariant: Record<LeadStage, "neutral" | "default" | "success" | "warning" | "danger"> = {
  CAPTURED: "neutral",
  QUALIFIED: "default",
  CONTACTED: "default",
  DEMO: "warning",
  PROPOSAL: "warning",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
};

export default async function PartnerLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; stage?: string; category?: string; source?: string }>;
}) {
  const { tab, stage, category, source } = await searchParams;
  const activeTab = tab === "marketing" ? "marketing" : "leads";
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads & Pipeline</h1>
      <p className="mt-1 text-muted">
        Client leads referred to OmniCard, and your separate client roster
        for co-branded marketing — kept apart since one is a sales pipeline
        and the other isn&apos;t.
      </p>

      <div className="mt-4 flex gap-1 border-b border-border">
        <TabLink tab="leads" activeTab={activeTab} label="My Leads" />
        <TabLink tab="marketing" activeTab={activeTab} label="Marketing Contacts" />
      </div>

      {activeTab === "leads" ? (
        <LeadsTab partnerId={session!.partnerId!} stage={stage} category={category} source={source} />
      ) : (
        <MarketingTab partnerId={session!.partnerId!} />
      )}
    </div>
  );
}

function TabLink({ tab, activeTab, label }: { tab: string; activeTab: string; label: string }) {
  const active = tab === activeTab;
  return (
    <Link
      href={tab === "leads" ? "/partner/leads" : `/partner/leads?tab=${tab}`}
      className={cn(
        "border-b-2 px-4 py-2 text-sm font-medium",
        active ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

async function LeadsTab({
  partnerId,
  stage,
  category,
  source,
}: {
  partnerId: string;
  stage?: string;
  category?: string;
  source?: string;
}) {
  const leads = await db.lead.findMany({
    where: {
      partnerId,
      ...(stage ? { stage } : {}),
      ...(category ? { category } : {}),
      ...(source ? { source } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const hasFilters = !!(stage || category || source);

  function chipHref(remove: "stage" | "category" | "source") {
    const p = new URLSearchParams();
    if (stage && remove !== "stage") p.set("stage", stage);
    if (category && remove !== "category") p.set("category", category);
    if (source && remove !== "source") p.set("source", source);
    const s = p.toString();
    return `/partner/leads${s ? `?${s}` : ""}`;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <AddLeadForm />
        <LeadsBulkUploader />
        <CsvExportButton href="/partner/leads/export" />
      </div>

      <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">Stage</label>
          <select name="stage" defaultValue={stage ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All stages</option>
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Category</label>
          <select name="category" defaultValue={category ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All categories</option>
            {LEAD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {LEAD_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Source</label>
          <select name="source" defaultValue={source ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {hasFilters && (
          <Link href="/partner/leads" className="text-sm text-muted hover:text-brand hover:underline">
            Clear
          </Link>
        )}
      </form>

      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {stage && <FilterChip label={`Stage: ${LEAD_STAGE_LABELS[stage as LeadStage]}`} removeHref={chipHref("stage")} />}
          {category && (
            <FilterChip label={`Category: ${LEAD_CATEGORY_LABELS[category as LeadCategory]}`} removeHref={chipHref("category")} />
          )}
          {source && <FilterChip label={`Source: ${source}`} removeHref={chipHref("source")} />}
        </div>
      )}

      <p className="mt-3 text-xs text-muted">{leads.length} lead(s)</p>

      <Card className="mt-4 overflow-x-auto">
        <table className="responsive-table w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">POC</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Stage</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Deal value</th>
              <th className="p-3 font-medium">Captured</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium" data-label="Business">{l.businessName}</td>
                <td className="p-3 text-muted" data-label="POC">
                  <p className="text-foreground">{l.contactName}</p>
                  <p className="text-xs">{l.phone}</p>
                </td>
                <td className="p-3 text-muted" data-label="Source">{l.source}</td>
                <td className="p-3" data-label="Stage">
                  <Badge variant={stageVariant[l.stage as LeadStage]}>
                    {LEAD_STAGE_LABELS[l.stage as LeadStage]}
                  </Badge>
                </td>
                <td className="p-3 text-muted" data-label="Category">
                  {l.category ? LEAD_CATEGORY_LABELS[l.category as LeadCategory] : "—"}
                </td>
                <td className="p-3" data-label="Deal value">{formatINR(l.dealValue)}</td>
                <td className="p-3 text-muted" data-label="Captured">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          hasFilters ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <p className="text-sm text-muted">No leads match these filters.</p>
              <Link href="/partner/leads" className="text-sm font-medium text-brand hover:underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm font-medium">No leads yet</p>
              <p className="max-w-md text-sm text-muted">
                Add your first client lead, or share your co-landing link so clients come to you.
              </p>
              <AddLeadForm />
            </div>
          )
        )}
      </Card>
    </div>
  );
}

async function MarketingTab({ partnerId }: { partnerId: string }) {
  const contacts = await db.marketingContact.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-muted">
        Upload your full client roster so OmniCard&apos;s marketing team can
        run co-branded campaigns to them — not a sales pipeline, and phone/
        email stay masked from our team unless explicitly revealed.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <MarketingContactsUploader />
        <CsvExportButton href="/partner/leads/marketing-contacts-export" />
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">POC</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.contactName}</td>
                <td className="p-3 text-muted">{c.phone}</td>
                <td className="p-3 text-muted">{c.email ?? "—"}</td>
                <td className="p-3 text-muted">{c.city ?? "—"}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm font-medium">No contacts uploaded yet</p>
            <p className="max-w-md text-sm text-muted">
              Upload your client roster so OmniCard&apos;s marketing team can run co-branded campaigns to them.
            </p>
            <MarketingContactsUploader />
          </div>
        )}
      </Card>
    </div>
  );
}
