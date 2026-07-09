import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_LABELS, type AssetKey, type AssetStatus } from "@/lib/enums";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<AssetStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  IN_PROGRESS: "warning",
  DELIVERED: "success",
};

export default async function PartnerAssetsPage() {
  const session = await getSession();
  const items = await db.assetKitItem.findMany({
    where: { partnerId: session!.partnerId! },
  });

  const delivered = items.filter((i) => i.status === "DELIVERED").length;

  return (
    <div>
      <h1 className="text-2xl font-bold">My Asset Kit</h1>
      <p className="mt-1 text-muted">
        Everything OmniCard creates for you — Step 3 checklist. {delivered} of{" "}
        {items.length} delivered.
      </p>

      <Card className="mt-6 divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">
                {ASSET_LABELS[item.key as AssetKey]}
              </p>
              <p className="text-xs text-muted">Owner: {item.owner}</p>
            </div>
            <div className="text-right">
              <Badge variant={statusVariant[item.status as AssetStatus]}>
                {item.status.replace("_", " ")}
              </Badge>
              {item.deliveredAt && (
                <p className="mt-1 text-xs text-muted">
                  {formatDate(item.deliveredAt)}
                </p>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-6 text-center text-muted">
            Your asset kit will appear here once certification completes.
          </p>
        )}
      </Card>
    </div>
  );
}
