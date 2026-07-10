"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addLeadManuallyAction } from "@/app/actions/lead";

export function AddLeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + Add a lead
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Add a single client lead</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            const result = await addLeadManuallyAction(formData);
            if (result.ok) {
              setMessage({ ok: true, text: "Lead added to your pipeline." });
              formRef.current?.reset();
            } else {
              setMessage({ ok: false, text: result.error ?? "Failed to add lead." });
            }
          })
        }
        className="mt-4 grid gap-3 sm:grid-cols-2"
      >
        <input name="businessName" required placeholder="Business name" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        <input name="contactName" required placeholder="Contact name" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        <input name="phone" required placeholder="Phone" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        <input name="email" type="email" required placeholder="Email" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        <input name="dealValue" type="number" min="0" placeholder="Deal value (INR, optional)" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding…" : "Add lead"}
          </Button>
        </div>
        {message && (
          <p className={`sm:col-span-2 text-sm ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {message.text}
          </p>
        )}
      </form>
    </Card>
  );
}
