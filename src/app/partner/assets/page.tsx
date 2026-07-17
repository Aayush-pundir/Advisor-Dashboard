import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function PartnerAssetsPage() {
  const session = await getSession();
  const items = await db.assetKitItem.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">My Asset Kit</h1>
      <p className="mt-1 text-muted">
        Marketing assets the OmniCard team has shared with you. Download and use them freely.
      </p>

      <Card className="mt-6 divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
              <p className="mt-0.5 text-xs text-muted">Shared {formatDate(item.createdAt)}</p>
            </div>
            <a
              href={item.fileUrl}
              download={item.fileName}
              className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark"
            >
              Download {item.fileName} &#8595;
            </a>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-6 text-center text-muted">
            No assets yet. Your OmniCard team will share marketing assets here — you&apos;ll get a notification
            when they do.
          </p>
        )}
      </Card>
    </div>
  );
}
