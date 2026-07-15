"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestCampaignAction } from "@/app/actions/campaign";
import { CAMPAIGN_TYPES } from "@/lib/enums";

export function RequestCampaignForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          const result = await requestCampaignAction(formData);
          if (result.ok) {
            setMessage({ ok: true, text: "Request sent to OmniCard for review." });
            formRef.current?.reset();
          } else {
            setMessage({ ok: false, text: result.error ?? "Failed to send request." });
          }
        })
      }
      className="mt-3 grid gap-3 sm:grid-cols-4"
    >
      <select name="type" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand">
        {CAMPAIGN_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        name="title"
        required
        placeholder="Title / topic"
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send request"}
      </Button>
      <input
        name="requestNote"
        placeholder="Note (optional) — e.g. preferred timing"
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-4"
      />
      {message && (
        <p className={`sm:col-span-4 text-sm ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
      )}
    </form>
  );
}
