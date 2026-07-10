"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setWebhookUrlAction } from "@/app/actions/integrations";

export function WebhookForm({ currentUrl }: { currentUrl: string | null }) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await setWebhookUrlAction(formData);
          setMessage({ ok: result.ok, text: result.ok ? "Webhook URL saved." : result.error ?? "Failed to save." });
        })
      }
      className="mt-3 flex flex-col gap-2 sm:flex-row"
    >
      <input
        name="webhookUrl"
        type="url"
        defaultValue={currentUrl ?? ""}
        placeholder="https://your-crm.example.com/webhooks/omnicard"
        className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {message && (
        <p className={`text-sm sm:self-center ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>{message.text}</p>
      )}
    </form>
  );
}
