import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate, maskPhone, maskEmail } from "@/lib/utils";
import { createCampaignAction, approveCampaignRequestAction, bulkApproveCampaignRequestsAction, markContentApprovedAction, markCampaignLiveAction } from "@/app/actions/campaign";
import { CAMPAIGN_TYPES, type CampaignStatus, type UserRole } from "@/lib/enums";
import { getAuthedUser } from "@/lib/auth";
import { canManageCampaigns } from "@/lib/permissions";
import { RevealMarketingContact } from "@/components/admin/reveal-marketing-contact";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { PartnerPicker } from "@/components/admin/partner-picker";

const statusVariant: Record<CampaignStatus, "neutral" | "warning" | "default" | "success"> = {
  DRAFTED: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "default",
  SENT: "success",
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView = view === "contacts" ? "contacts" : view === "requests" ? "requests" : "campaigns";

  const actor = await getAuthedUser();
  const canManage = actor ? canManageCampaigns(actor.role as UserRole) : false;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Acquisition Marketing Engine</h1>
        <p className="mt-1 text-muted">
          Request campaigns for advisor approval, run co-branded sends to their clients, and track the requests advisors send back.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        <TabLink view="campaigns" activeView={activeView} label="Campaigns" />
        <TabLink view="contacts" activeView={activeView} label="Marketing Contact Lists" />
        <TabLink view="requests" activeView={activeView} label="Advisor Requests" />
      </div>

      {activeView === "campaigns" && <CampaignsTab canManage={canManage} />}
      {activeView === "contacts" && <ContactsTab canManage={canManage} />}
      {activeView === "requests" && <RequestsTab canManage={canManage} />}
    </div>
  );
}

function TabLink({ view, activeView, label }: { view: string; activeView: string; label: string }) {
  const active = view === activeView;
  return (
    <Link
      href={view === "campaigns" ? "/admin/campaigns" : `/admin/campaigns?view=${view}`}
      className={cn(
        "border-b-2 px-4 py-2 text-sm font-medium",
        active ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

async function CampaignsTab({ canManage }: { canManage: boolean }) {
  const [campaigns, partners] = await Promise.all([
    db.campaign.findMany({
      where: { requestedByPartner: false },
      include: { partner: { select: { firmName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.partner.findMany({
      where: { stage: { in: ["CERTIFIED", "ACTIVE"] } },
      select: { id: true, firmName: true },
      orderBy: { firmName: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Request a new campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted">
              Pick one advisor for a one-off send, or several at once for a festive/themed batch.
            </p>
            <form action={createCampaignAction} className="grid gap-3 sm:grid-cols-4">
              <PartnerPicker partners={partners} />
              <select
                name="type"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              >
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                name="title"
                required
                placeholder="Campaign title"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <Button type="submit">Request for approval</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">Campaign</th>
              <th className="p-3 font-medium">Partner</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Requested</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Content approved</th>
              <th className="p-3 font-medium">Live date</th>
              {canManage && <th className="p-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.title}</td>
                <td className="p-3 text-muted">{c.partner.firmName}</td>
                <td className="p-3 text-muted">{c.type}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[c.status as CampaignStatus]}>{c.status.replace("_", " ")}</Badge>
                </td>
                <td className="p-3 text-muted">{c.contentApprovedAt ? formatDate(c.contentApprovedAt) : "—"}</td>
                <td className="p-3 text-muted">{c.liveAt ? formatDate(c.liveAt) : "—"}</td>
                {canManage && (
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {c.status === "APPROVED" && !c.contentApprovedAt && (
                        <form action={markContentApprovedAction.bind(null, c.id)}>
                          <Button size="sm" variant="outline" type="submit">
                            Approve content
                          </Button>
                        </form>
                      )}
                      {c.status === "APPROVED" && c.contentApprovedAt && !c.liveAt && (
                        <form action={markCampaignLiveAction.bind(null, c.id)} className="flex items-center gap-1">
                          <input type="date" name="liveDate" className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand" />
                          <Button size="sm" type="submit">
                            Go live
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && <p className="p-6 text-center text-muted">No campaigns yet.</p>}
      </Card>
    </div>
  );
}

async function ContactsTab({ canManage }: { canManage: boolean }) {
  const marketingContacts = await db.marketingContact.findMany({
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted">
          Client rosters uploaded by partners purely for campaign targeting — not a sales pipeline. Contact info is masked by default; reveal is logged.
        </p>
        {canManage && <CsvExportButton href="/admin/campaigns/marketing-contacts/export" label="Export CSV" />}
      </div>
      <Card className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="p-3 font-medium">POC</th>
              <th className="p-3 font-medium">Details</th>
              <th className="p-3 font-medium">Uploaded by</th>
              <th className="p-3 font-medium">City</th>
              <th className="p-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {marketingContacts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.contactName}</td>
                <td className="p-3">
                  <RevealMarketingContact
                    contactId={c.id}
                    maskedPhone={maskPhone(c.phone)}
                    maskedEmail={c.email ? maskEmail(c.email) : "—"}
                  />
                </td>
                <td className="p-3 text-muted">{c.partner.firmName}</td>
                <td className="p-3 text-muted">{c.city ?? "—"}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {marketingContacts.length === 0 && <p className="p-6 text-center text-muted">No marketing contacts uploaded yet.</p>}
      </Card>
    </div>
  );
}

async function RequestsTab({ canManage }: { canManage: boolean }) {
  const requests = await db.campaign.findMany({
    where: { requestedByPartner: true },
    include: { partner: { select: { firmName: true } } },
    orderBy: { createdAt: "desc" },
  });
  const pending = requests.filter((r) => r.status === "PENDING_APPROVAL");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">Campaigns advisors have requested for their own clients, awaiting OmniCard&apos;s review.</p>

      {canManage && pending.length > 0 && (
        <form id="bulk-approve-form" action={bulkApproveCampaignRequestsAction} className="flex items-center gap-2">
          <Button type="submit" size="sm" variant="outline">
            Approve selected
          </Button>
          <span className="text-xs text-muted">Select requests below, e.g. all requests for the same festive theme, then approve together.</span>
        </form>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              {canManage && <th className="p-3 font-medium"></th>}
              <th className="p-3 font-medium">Partner</th>
              <th className="p-3 font-medium">Mode</th>
              <th className="p-3 font-medium">Title/Topic</th>
              <th className="p-3 font-medium">Note</th>
              <th className="p-3 font-medium">Requested</th>
              <th className="p-3 font-medium">Status</th>
              {canManage && <th className="p-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                {canManage && (
                  <td className="p-3">
                    {r.status === "PENDING_APPROVAL" && (
                      <input type="checkbox" name="campaignIds" value={r.id} form="bulk-approve-form" />
                    )}
                  </td>
                )}
                <td className="p-3 font-medium">{r.partner.firmName}</td>
                <td className="p-3 text-muted">{r.type}</td>
                <td className="p-3">{r.title}</td>
                <td className="p-3 text-muted">{r.requestNote ?? "—"}</td>
                <td className="p-3 text-muted">{formatDate(r.createdAt)}</td>
                <td className="p-3">
                  <Badge variant={statusVariant[r.status as CampaignStatus]}>{r.status.replace("_", " ")}</Badge>
                </td>
                {canManage && (
                  <td className="p-3">
                    {r.status === "PENDING_APPROVAL" && (
                      <form action={approveCampaignRequestAction.bind(null, r.id)}>
                        <Button size="sm" type="submit">
                          Approve
                        </Button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <p className="p-6 text-center text-muted">No advisor requests yet.</p>}
      </Card>
    </div>
  );
}
