import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { CampaignStatus } from "@/lib/enums";
import { RequestCampaignForm } from "@/components/partner/request-campaign-form";
import { ApproveCampaignButton } from "@/components/partner/approve-campaign-button";

const statusVariant: Record<CampaignStatus, "neutral" | "warning" | "default" | "success"> = {
  DRAFTED: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "default",
  SENT: "success",
};

export default async function PartnerCampaignsPage() {
  const session = await getSession();
  const campaigns = await db.campaign.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Campaigns</h1>
      <p className="mt-1 text-muted">
        OmniCard drafts campaigns to your client base for your approval — or
        request one yourself with your preferred mode and topic.
      </p>

      <Card className="mt-6 p-5">
        <p className="text-sm font-medium">Request a campaign</p>
        <RequestCampaignForm />
      </Card>

      <div className="mt-6 grid gap-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-muted">
                {c.type} &middot; {c.requestedByPartner ? "requested by you" : "drafted by OmniCard"}{" "}
                {formatDate(c.createdAt)}
              </p>
              {c.requestNote && <p className="mt-1 text-xs text-muted">&ldquo;{c.requestNote}&rdquo;</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant[c.status as CampaignStatus]}>
                {c.status === "PENDING_APPROVAL" && c.requestedByPartner
                  ? "Awaiting OmniCard review"
                  : c.status.replace("_", " ")}
              </Badge>
              {c.status === "PENDING_APPROVAL" && !c.requestedByPartner && <ApproveCampaignButton campaignId={c.id} />}
            </div>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <Card className="p-6 text-center text-muted">
            No campaigns yet.
          </Card>
        )}
      </div>
    </div>
  );
}
