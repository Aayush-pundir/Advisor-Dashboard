"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { registerDealAction } from "@/app/actions/deals";

export function RegisterDealForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          const result = await registerDealAction(formData);
          if (result.ok) {
            setMessage({ ok: true, text: "Deal registered — protected while under review." });
            formRef.current?.reset();
          } else {
            setMessage({ ok: false, text: result.error ?? "Registration failed." });
          }
        })
      }
      className="mt-4 grid gap-3 sm:grid-cols-2"
    >
      <input name="businessName" required placeholder="Business name" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="contactName" required placeholder="Contact name" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="phone" required placeholder="Phone" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="email" type="email" placeholder="Email (optional)" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="city" required placeholder="City" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <input name="notes" placeholder="Notes (optional)" className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand" />
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering…" : "Register Deal (90-day protection)"}
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
