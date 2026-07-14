import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, maskPhone, maskEmail } from "@/lib/utils";
import { createCampaignAction } from "@/app/actions/campaign";
import { CAMPAIGN_TYPES, type CampaignStatus, type UserRole } from "@/lib/enums";
import { getAuthedUser } from "@/lib/auth";
import { canManageCampaigns } from "@/lib/permissions";
import { RevealMarketingContact } from "@/components/admin/reveal-marketing-contact";

const statusVariant: Record<CampaignStatus, "neutral" | "warning" | "default" | "success"> = {
  DRAFTED: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "default",
  SENT: "success",
};

export default async function AdminCampaignsPage() {
  const [campaigns, partners, actor, marketingContacts] = await Promise.all([
    db.campaign.findMany({
      include: { partner: { select: { firmName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.partner.findMany({
      where: { stage: { in: ["CERTIFIED", "ACTIVE"] } },
      select: { id: true, firmName: true },
    }),
    getAuthedUser(),
    db.marketingContact.findMany({
      include: { partner: { select: { firmName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  const canManage = actor ? canManageCampaigns(actor.role as UserRole) : false;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Acquisition Marketing Engine</h1>
        <p className="mt-1 text-muted">
          Draft campaigns for advisor approval — one click and OmniCard sends.
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Draft a new campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCampaignAction} className="grid gap-3 sm:grid-cols-4">
              <select
                name="partnerId"
                required
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="">Select CA partner</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firmName}
                  </option>
                ))}
              </select>
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
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-1"
              />
              <Button type="submit">Draft for approval</Button>
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
              <th className="p-3 font-medium">Drafted</th>
              <th className="p-3 font-medium">Status</th>
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
                  <Badge variant={statusVariant[c.status as CampaignStatus]}>
                    {c.status.replace("_", " ")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && (
          <p className="p-6 text-center text-muted">No campaigns yet.</p>
        )}
      </Card>

      <div>
        <h2 className="text-lg font-semibold">Marketing contact lists</h2>
        <p className="mt-1 text-sm text-muted">
          Client rosters uploaded by partners purely for campaign targeting —
          not a sales pipeline. Contact info is masked by default; reveal is logged.
        </p>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="p-3 font-medium">Contact</th>
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
          {marketingContacts.length === 0 && (
            <p className="p-6 text-center text-muted">No marketing contacts uploaded yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
