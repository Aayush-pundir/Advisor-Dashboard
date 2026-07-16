"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateLogoAction } from "@/app/actions/settings";

export function LogoUploadForm({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Firm logo" className="h-14 w-14 rounded-lg border border-border bg-white object-contain p-1" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted">
          No logo
        </div>
      )}
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            const result = await updateLogoAction(formData);
            setMessage(
              result.ok
                ? { ok: true, text: "Logo updated." }
                : { ok: false, text: result.error ?? "Failed to upload logo." },
            );
          })
        }
        className="flex flex-1 flex-wrap items-center gap-3"
      >
        <input
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Uploading…" : "Upload logo"}
        </Button>
        {message && (
          <p className={`text-xs ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
        )}
      </form>
    </div>
  );
}
