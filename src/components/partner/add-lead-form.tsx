"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { acvFromExpenditure, ltvCommissionPerClient, DEFAULT_ANNUAL_CHURN } from "@/lib/enums";
import { addLeadManuallyAction } from "@/app/actions/lead";

export function AddLeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [expenditure, setExpenditure] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const preview = useMemo(() => {
    const value = Number(expenditure);
    if (!value || value <= 0) return null;
    const acv = acvFromExpenditure(value);
    const perClient = ltvCommissionPerClient(acv, DEFAULT_ANNUAL_CHURN);
    return { acv, ...perClient };
  }, [expenditure]);

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
              setExpenditure("");
              setEstimatedValue(null);
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

        <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted">Client&apos;s avg. annual expenditure</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 25,00,000"
              value={expenditure}
              onChange={(e) => {
                setExpenditure(e.target.value);
                setEstimatedValue(null);
              }}
              className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!preview}
            onClick={() => setShowPreview(true)}
          >
            Preview advisory fee
          </Button>
        </div>

        {estimatedValue !== null && (
          <div className="sm:col-span-2 rounded-lg border border-brand/25 bg-brand-light px-3 py-2 text-xs text-brand-dark">
            Estimated annual contract value used for this lead: <strong>{formatINR(estimatedValue)}</strong>
          </div>
        )}
        <input type="hidden" name="dealValue" value={estimatedValue ?? 0} />

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

      {showPreview && preview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Advisory fee potential</p>
                <p className="mt-1 text-xs text-muted">
                  Based on {formatINR(Number(expenditure))} in annual expenditure for this client.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Close"
                className="shrink-0 text-lg leading-none text-muted hover:text-foreground"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted">Year-1 advisory fee (15%)</span>
                <span className="font-semibold">{formatINR(preview.year1)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="text-muted">Lifetime trailing (5%)</span>
                <span className="font-semibold">{formatINR(preview.trailing)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-brand/25 bg-brand-light px-3 py-2 text-sm">
                <span className="text-brand-dark">Total lifetime value</span>
                <span className="font-semibold text-brand-dark">{formatINR(preview.total)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEstimatedValue(preview.acv);
                  setShowPreview(false);
                }}
              >
                Use this estimate
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
