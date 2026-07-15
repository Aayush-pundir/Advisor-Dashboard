import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatINR, formatDate } from "@/lib/utils";
import { LEAD_STAGE_LABELS, LEAD_CATEGORY_LABELS, type LeadStage, type LeadCategory } from "@/lib/enums";
import { AddLeadForm } from "@/components/partner/add-lead-form";
import { LeadsBulkUploader } from "@/components/partner/leads-bulk-uploader";
import { MarketingContactsUploader } from "@/components/partner/marketing-contacts-uploader";
import { CsvExportButton } from "@/components/partner/csv-export-button";

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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
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
        <LeadsTab partnerId={session!.partnerId!} />
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

async function LeadsTab({ partnerId }: { partnerId: string }) {
  const leads = await db.lead.findMany({
    where: { partnerId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <AddLeadForm />
        <LeadsBulkUploader />
        <CsvExportButton href="/partner/leads/export" />
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Contact</th>
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
                <td className="p-3 font-medium">{l.businessName}</td>
                <td className="p-3 text-muted">{l.contactName}</td>
                <td className="p-3 text-muted">{l.source}</td>
                <td className="p-3">
                  <Badge variant={stageVariant[l.stage as LeadStage]}>
                    {LEAD_STAGE_LABELS[l.stage as LeadStage]}
                  </Badge>
                </td>
                <td className="p-3 text-muted">
                  {l.category ? LEAD_CATEGORY_LABELS[l.category as LeadCategory] : "—"}
                </td>
                <td className="p-3">{formatINR(l.dealValue)}</td>
                <td className="p-3 text-muted">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="p-6 text-center text-muted">
            No leads yet. Share your referral link to get started.
          </p>
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
              <th className="p-3 font-medium">Contact</th>
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
          <p className="p-6 text-center text-muted">No contacts uploaded yet.</p>
        )}
      </Card>
    </div>
  );
}
