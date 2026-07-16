"use client";

import { useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ASSET_LABELS, ASSET_STATUSES, type AssetKey, type AssetStatus } from "@/lib/enums";
import { uploadAssetKitFileAction, updateAssetKitItemAction, deleteAssetKitItemAction } from "@/app/actions/asset-kit";

const assetStatusVariant: Record<AssetStatus, "neutral" | "warning" | "success"> = {
  PENDING: "neutral",
  IN_PROGRESS: "warning",
  DELIVERED: "success",
};

type AssetItem = {
  id: string;
  key: string;
  customLabel: string | null;
  owner: string;
  status: string;
  deliveredAt: Date | null;
  fileUrl: string | null;
  fileName: string | null;
  note: string | null;
};

export function AssetKitManager({
  partnerId,
  items,
  teamNames,
}: {
  partnerId: string;
  items: AssetItem[];
  teamNames: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">
                {item.customLabel ?? ASSET_LABELS[item.key as AssetKey] ?? item.key}
              </p>
              {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
              {item.deliveredAt && <p className="mt-0.5 text-xs text-muted">Delivered {formatDate(item.deliveredAt)}</p>}
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  download={item.fileName ?? undefined}
                  className="mt-1 inline-block text-xs font-medium text-brand-dark hover:underline"
                >
                  Download {item.fileName ?? "file"} &#8595;
                </a>
              )}
            </div>
            <form
              action={(formData) => startTransition(() => updateAssetKitItemAction(item.id, formData))}
              className="flex items-center gap-2"
            >
              <select
                name="owner"
                defaultValue={item.owner}
                className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-brand"
              >
                {teamNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                {!teamNames.includes(item.owner) && <option value={item.owner}>{item.owner}</option>}
              </select>
              <select
                name="status"
                defaultValue={item.status}
                className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-brand"
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <Badge variant={assetStatusVariant[item.status as AssetStatus]}>{item.status.replace("_", " ")}</Badge>
              <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                Save
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                if (confirm("Delete this asset kit item? This cannot be undone.")) {
                  startDelete(() => deleteAssetKitItemAction(item.id));
                }
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              Delete
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="py-6 text-center text-muted">No asset kit items yet.</p>}
      </div>

      <form
        ref={uploadFormRef}
        action={(formData) =>
          startUpload(async () => {
            const result = await uploadAssetKitFileAction(partnerId, formData);
            if (result.ok) {
              setMessage({ ok: true, text: "Asset uploaded and delivered." });
              uploadFormRef.current?.reset();
            } else {
              setMessage({ ok: false, text: result.error ?? "Upload failed." });
            }
          })
        }
        className="flex flex-col gap-2 border-t border-border pt-4"
      >
        <p className="text-xs font-medium text-muted">Upload a new asset — any file type, delivered instantly</p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs font-medium text-muted">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Diwali creative pack"
              className="mt-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Owner (OmniCard Team)</label>
            <select
              name="owner"
              className="mt-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
            >
              {teamNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">File</label>
            <input
              name="file"
              type="file"
              required
              className="mt-1 block text-sm"
            />
          </div>
          <Button type="submit" size="sm" disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload & deliver"}
          </Button>
        </div>
        <input
          name="note"
          placeholder="Note for the advisor (optional)"
          className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
        {message && (
          <p className={`text-xs ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
