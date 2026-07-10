"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestMdfAction } from "@/app/actions/mdf";

export function RequestMdfForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          const result = await requestMdfAction(formData);
          if (result.ok) {
            setMessage({ ok: true, text: "MDF request submitted for review." });
            formRef.current?.reset();
          } else {
            setMessage({ ok: false, text: result.error ?? "Request failed." });
          }
        })
      }
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <input name="title" required placeholder="Campaign / activity title" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2" />
      <textarea name="description" placeholder="Description (optional)" rows={2} className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand sm:col-span-2" />
      <input name="requestedAmount" type="number" min="1" required placeholder="Requested amount (INR)" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Request MDF"}
        </Button>
      </div>
      {message && (
        <p className={`sm:col-span-2 text-sm ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
