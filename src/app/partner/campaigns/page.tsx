import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveCampaignAction } from "@/app/actions/campaign";
import { formatDate } from "@/lib/utils";
import type { CampaignStatus } from "@/lib/enums";

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
        OmniCard drafts every campaign to your client base — you approve in
        one click.
      </p>

      <div className="mt-6 grid gap-4">
        {campaigns.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-muted">
                {c.type} &middot; drafted {formatDate(c.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant[c.status as CampaignStatus]}>
                {c.status.replace("_", " ")}
              </Badge>
              {c.status === "PENDING_APPROVAL" && (
                <form action={approveCampaignAction.bind(null, c.id)}>
                  <Button size="sm" type="submit">
                    Approve
                  </Button>
                </form>
              )}
            </div>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <Card className="p-6 text-center text-muted">
            No campaigns drafted yet.
          </Card>
        )}
      </div>
    </div>
  );
}
