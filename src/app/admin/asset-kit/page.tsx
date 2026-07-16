import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { BulkAssetUploadForm } from "@/components/admin/bulk-asset-upload-form";

export default async function AdminAssetKitPage() {
  const [partners, teamMembers, deliveredItems] = await Promise.all([
    db.partner.findMany({ select: { id: true, firmName: true }, orderBy: { firmName: "asc" } }),
    db.user.findMany({ where: { role: "OMNICARD_TEAM", active: true }, select: { name: true }, orderBy: { name: "asc" } }),
    db.assetKitItem.findMany({
      where: { fileUrl: { not: null } },
      include: { partner: { select: { firmName: true } } },
      orderBy: { deliveredAt: "desc" },
    }),
  ]);
  const teamNames = teamMembers.map((t) => t.name);

  const groups = new Map<
    string,
    { title: string; note: string | null; fileUrl: string; fileName: string | null; owner: string; deliveredAt: Date | null; firms: string[] }
  >();
  for (const item of deliveredItems) {
    const existing = groups.get(item.key);
    if (existing) {
      existing.firms.push(item.partner.firmName);
    } else {
      groups.set(item.key, {
        title: item.customLabel ?? item.key,
        note: item.note,
        fileUrl: item.fileUrl!,
        fileName: item.fileName,
        owner: item.owner,
        deliveredAt: item.deliveredAt,
        firms: [item.partner.firmName],
      });
    }
  }
  const uploads = Array.from(groups.values());

  return (
    <div>
      <h1 className="text-2xl font-bold">Asset Kit</h1>
      <p className="mt-1 text-muted">
        Bulk-upload marketing assets to one or every advisor at once. Per-partner asset management lives on each
        partner&apos;s detail page.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <Card className="p-5">
          <p className="text-sm font-semibold">Upload an asset to one or more advisors</p>
          <p className="mt-1 text-xs text-muted">
            Any file type — image, PDF, video, audio. Uploaded once and delivered instantly to every advisor selected,
            with a notification pointing them to their Asset Kit.
          </p>
          <div className="mt-4">
            <BulkAssetUploadForm partners={partners} teamNames={teamNames} />
          </div>
        </Card>

        <div>
          <p className="mb-2 text-sm font-semibold">Recently shared</p>
          <Card className="divide-y divide-border">
            {uploads.map((u) => (
              <div key={u.fileUrl + u.title} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{u.title}</p>
                  {u.note && <p className="mt-0.5 text-xs text-muted">{u.note}</p>}
                  <p className="mt-1 text-xs text-muted">
                    {u.firms.length === 1 ? u.firms[0] : `${u.firms.length} advisors`} &middot; {u.owner}
                    {u.deliveredAt ? ` · ${formatDate(u.deliveredAt)}` : ""}
                  </p>
                </div>
                <a href={u.fileUrl} download={u.fileName ?? undefined} className="text-xs font-medium text-brand-dark hover:underline">
                  Download {u.fileName ?? "file"} &#8595;
                </a>
              </div>
            ))}
            {uploads.length === 0 && <p className="p-6 text-center text-muted">No assets uploaded yet.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
