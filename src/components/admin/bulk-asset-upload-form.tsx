"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PartnerPicker } from "@/components/admin/partner-picker";
import { bulkUploadSharedAssetAction } from "@/app/actions/asset-kit";

export function BulkAssetUploadForm({
  partners,
}: {
  partners: { id: string; firmName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        const count = new FormData(e.currentTarget).getAll("partnerIds").filter(Boolean).length;
        if (count > 0 && !confirm(`Share this asset with ${count} advisor(s)? Each one gets a notification.`)) {
          e.preventDefault();
        }
      }}
      action={(formData) =>
        startTransition(async () => {
          const result = await bulkUploadSharedAssetAction(formData);
          if (result.ok) {
            setMessage({ ok: true, text: `Shared with ${result.created} advisor(s).` });
            formRef.current?.reset();
          } else {
            setMessage({ ok: false, text: result.error ?? "Upload failed." });
          }
        })
      }
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-muted">Title</label>
          <input
            name="title"
            required
            placeholder="e.g. Diwali WhatsApp creative pack"
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">Note for advisors (optional)</label>
          <textarea
            name="note"
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted">File</label>
          <input name="file" type="file" required className="mt-1 block text-sm" />
        </div>
        <div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Uploading…" : "Upload & share"}
          </Button>
          {message && (
            <span className={`ml-3 text-xs ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted">Send to</label>
        <div className="mt-1">
          <PartnerPicker partners={partners} />
        </div>
      </div>
    </form>
  );
}
