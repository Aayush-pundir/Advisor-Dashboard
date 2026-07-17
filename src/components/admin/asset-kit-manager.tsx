"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { uploadAssetKitFileAction, deleteAssetKitItemAction } from "@/app/actions/asset-kit";

type AssetItem = {
  id: string;
  title: string;
  note: string | null;
  owner: string;
  fileUrl: string;
  fileName: string;
  createdAt: Date;
};

export function AssetKitManager({
  partnerId,
  items,
}: {
  partnerId: string;
  items: AssetItem[];
}) {
  const [isDeleting, startDelete] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
              <p className="mt-0.5 text-xs text-muted">
                {item.owner} · {formatDate(item.createdAt)}
              </p>
              <a
                href={item.fileUrl}
                download={item.fileName}
                className="mt-1 inline-block text-xs font-medium text-brand-dark hover:underline"
              >
                Download {item.fileName} &#8595;
              </a>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                if (confirm("Delete this asset? This cannot be undone.")) {
                  startDelete(() => deleteAssetKitItemAction(item.id));
                }
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              Delete
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="py-6 text-center text-muted">No assets shared with this advisor yet.</p>}
      </div>

      <form
        ref={uploadFormRef}
        action={(formData) =>
          startUpload(async () => {
            const result = await uploadAssetKitFileAction(partnerId, formData);
            if (result.ok) {
              setMessage({ ok: true, text: "Asset uploaded — the advisor can download it now." });
              uploadFormRef.current?.reset();
            } else {
              setMessage({ ok: false, text: result.error ?? "Upload failed." });
            }
          })
        }
        className="flex flex-col gap-2 border-t border-border pt-4"
      >
        <p className="text-xs font-medium text-muted">Give this advisor an asset — any file type</p>
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
            <label className="block text-xs font-medium text-muted">File</label>
            <input name="file" type="file" required className="mt-1 block text-sm" />
          </div>
          <Button type="submit" size="sm" disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload"}
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
