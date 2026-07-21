import { db } from "@/lib/db";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate, maskPhone, maskEmail } from "@/lib/utils";
import { LEAD_STAGES, LEAD_STAGE_LABELS, LEAD_SOURCES } from "@/lib/enums";
import type { LeadStage, UserRole } from "@/lib/enums";
import { LeadStageSelect } from "@/components/admin/lead-stage-select";
import { getAuthedUser } from "@/lib/auth";
import { canManageLeads } from "@/lib/permissions";
import { RevealPii } from "@/components/admin/reveal-pii";
import { ReassignLeadSelect } from "@/components/admin/reassign-lead-select";
import { LEAD_CONFLICT_PROTECTION_DAYS, LEAD_CATEGORIES, LEAD_CATEGORY_LABELS, type LeadCategory } from "@/lib/enums";
import { conflictProtectionCutoff } from "@/lib/lead-conflict";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { cn } from "@/lib/utils";
import { LeadsKanban } from "@/components/admin/leads-kanban";
import { buildLeadDuplicateMap } from "@/lib/duplicate-detection";
import { LeadCommercialsForm } from "@/components/admin/lead-commercials-form";
import { FilterChip } from "@/components/shared/filter-chip";
import { PiiRevealProvider, RevealAllButton } from "@/components/admin/pii-reveal-context";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    view?: string;
    stage?: string;
    source?: string;
    category?: string;
    assignedToId?: string;
    partnerId?: string;
  }>;
}) {
  const { sort, view, stage, source, category, assignedToId, partnerId } = await searchParams;
  const activeView = view === "kanban" ? "kanban" : "table";

  const where = {
    ...(stage ? { stage } : {}),
    ...(source ? { source } : {}),
    ...(category ? { category } : {}),
    ...(assignedToId ? { assignedToId: assignedToId === "UNASSIGNED" ? null : assignedToId } : {}),
    ...(partnerId ? { partnerId } : {}),
  };

  const [leads, actor, reps, partners] = await Promise.all([
    db.lead.findMany({
      where,
      include: { partner: { select: { firmName: true } }, assignedTo: { select: { name: true } } },
      orderBy: sort === "score" ? { score: "desc" } : { createdAt: "desc" },
    }),
    getAuthedUser(),
    db.user.findMany({ where: { role: "OMNICARD_TEAM", active: true, isSalesRep: true }, select: { id: true, name: true } }),
    db.partner.findMany({ select: { id: true, firmName: true }, orderBy: { firmName: "asc" } }),
  ]);
  const canManage = actor ? canManageLeads(actor.role as UserRole) : false;

  const hasFilters = !!(stage || source || category || assignedToId || partnerId);
  const qs = new URLSearchParams();
  if (sort) qs.set("sort", sort);
  if (view) qs.set("view", view);
  if (stage) qs.set("stage", stage);
  if (source) qs.set("source", source);
  if (category) qs.set("category", category);
  if (assignedToId) qs.set("assignedToId", assignedToId);
  if (partnerId) qs.set("partnerId", partnerId);
  const clearHref = `/admin/leads${view ? `?view=${view}` : ""}`;

  const filterQs = new URLSearchParams();
  if (stage) filterQs.set("stage", stage);
  if (source) filterQs.set("source", source);
  if (category) filterQs.set("category", category);
  if (assignedToId) filterQs.set("assignedToId", assignedToId);
  if (partnerId) filterQs.set("partnerId", partnerId);

  function chipHref(remove: "stage" | "source" | "category" | "assignedToId" | "partnerId") {
    const p = new URLSearchParams();
    if (view) p.set("view", view);
    if (sort) p.set("sort", sort);
    if (stage && remove !== "stage") p.set("stage", stage);
    if (source && remove !== "source") p.set("source", source);
    if (category && remove !== "category") p.set("category", category);
    if (assignedToId && remove !== "assignedToId") p.set("assignedToId", assignedToId);
    if (partnerId && remove !== "partnerId") p.set("partnerId", partnerId);
    const s = p.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  }

  const assignedLabel =
    assignedToId === "UNASSIGNED" ? "Unassigned" : reps.find((r) => r.id === assignedToId)?.name ?? assignedToId;
  const partnerLabel = partners.find((p) => p.id === partnerId)?.firmName ?? partnerId;

  function tabHref(targetView: "table" | "kanban") {
    const p = new URLSearchParams(filterQs);
    if (targetView === "kanban") p.set("view", "kanban");
    if (sort === "score") p.set("sort", "score");
    const s = p.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  }

  function sortHref(bySort: boolean) {
    const p = new URLSearchParams(filterQs);
    if (view) p.set("view", view);
    if (bySort) p.set("sort", "score");
    const s = p.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  }

  const protectionCutoff = conflictProtectionCutoff();
  const phonePartners = new Map<string, Set<string>>();
  for (const l of leads) {
    if (l.stage === "CLOSED_LOST" || l.createdAt < protectionCutoff) continue;
    const set = phonePartners.get(l.phone) ?? new Set<string>();
    set.add(l.partnerId);
    phonePartners.set(l.phone, set);
  }

  const duplicateMap = buildLeadDuplicateMap(
    leads.map((l) => ({ id: l.id, businessName: l.businessName, email: l.email, phone: l.phone })),
  );

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
        {canManage && <CsvExportButton href={`/admin/leads/export${qs.toString() ? `?${qs.toString()}` : ""}`} />}
      </div>

      <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
        {view && <input type="hidden" name="view" value={view} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
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
          <label className="block text-xs font-medium text-muted">Assigned to</label>
          <select name="assignedToId" defaultValue={assignedToId ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">Everyone</option>
            <option value="UNASSIGNED">Unassigned</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Partner</label>
          <select name="partnerId" defaultValue={partnerId ?? ""} className="mt-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">All partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firmName}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        {hasFilters && (
          <Link href={clearHref} className="text-sm text-muted hover:text-brand hover:underline">
            Clear
          </Link>
        )}
      </form>

      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {stage && <FilterChip label={`Stage: ${LEAD_STAGE_LABELS[stage as LeadStage]}`} removeHref={chipHref("stage")} />}
          {source && <FilterChip label={`Source: ${source}`} removeHref={chipHref("source")} />}
          {category && (
            <FilterChip label={`Category: ${LEAD_CATEGORY_LABELS[category as LeadCategory]}`} removeHref={chipHref("category")} />
          )}
          {assignedToId && <FilterChip label={`Assigned: ${assignedLabel}`} removeHref={chipHref("assignedToId")} />}
          {partnerId && <FilterChip label={`Partner: ${partnerLabel}`} removeHref={chipHref("partnerId")} />}
        </div>
      )}

      <p className="mt-3 text-xs text-muted">{leads.length} lead(s)</p>

      <PiiRevealProvider leadIds={leads.map((l) => l.id)}>
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-border">
        <div className="flex gap-1">
          <Link
            href={tabHref("table")}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              activeView === "table" ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            Table
          </Link>
          <Link
            href={tabHref("kanban")}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              activeView === "kanban" ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            Pipeline
          </Link>
        </div>
        {activeView === "table" && (
          <div className="flex items-center gap-4 pb-2">
            {canManage && <RevealAllButton />}
            <Link href={sortHref(sort !== "score")} className="text-xs text-muted hover:text-brand hover:underline">
              {sort === "score" ? "Sort by newest" : "Sort by score"}
            </Link>
          </div>
        )}
      </div>

      {activeView === "kanban" ? (
        <LeadsKanban
          leads={leads.map((l) => ({
            id: l.id,
            businessName: l.businessName,
            contactName: l.contactName,
            dealValue: l.dealValue,
            stage: l.stage,
            partnerFirmName: l.partner.firmName,
          }))}
        />
      ) : (
      <Card className="mt-6 overflow-x-auto">
        <table className="responsive-table w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">POC</th>
              <th className="p-3 font-medium">Referred by</th>
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Commercials</th>
              <th className="p-3 font-medium">Captured</th>
              <th className="p-3 font-medium">Stage</th>
              <th className="p-3 font-medium">Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const hasConflict = (phonePartners.get(l.phone)?.size ?? 0) > 1;
              const dupes = duplicateMap.get(l.id) ?? [];
              return (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="p-3" data-label="Business">
                  <Link href={`/admin/leads/${l.id}`} className="font-medium text-brand-dark hover:underline">
                    {l.businessName}
                  </Link>
                  {hasConflict && (
                    <Badge variant="danger" className="mt-1">
                      Channel conflict
                    </Badge>
                  )}
                  {dupes.length > 0 && (
                    <Badge
                      variant="warning"
                      className="mt-1"
                      title={`Possibly the same client as: ${dupes.map((d) => d.businessName).join(", ")}`}
                    >
                      Possible duplicate
                    </Badge>
                  )}
                </td>
                <td className="p-3" data-label="POC">
                  <p className="text-sm">{l.contactName}</p>
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
                <td className="p-3 text-muted" data-label="Referred by">{l.partner.firmName}</td>
                <td className="p-3 text-muted" data-label="Source">{l.source}</td>
                <td className="p-3" data-label="Category">
                  {l.category ? (
                    <Badge variant="neutral">{LEAD_CATEGORY_LABELS[l.category as LeadCategory]}</Badge>
                  ) : (
                    <span className="text-xs text-muted">Not set</span>
                  )}
                </td>
                <td className="p-3" data-label="Commercials">
                  {canManage ? (
                    <LeadCommercialsForm leadId={l.id} dealValue={l.dealValue} billingCycle={l.billingCycle} category={l.category} />
                  ) : (
                    <span className="text-xs">{formatINR(l.dealValue)}</span>
                  )}
                </td>
                <td className="p-3 text-muted" data-label="Captured">{formatDate(l.createdAt)}</td>
                <td className="p-3" data-label="Stage">
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
                <td className="p-3" data-label="Assigned to">
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
      )}
      </PiiRevealProvider>
    </div>
  );
}
