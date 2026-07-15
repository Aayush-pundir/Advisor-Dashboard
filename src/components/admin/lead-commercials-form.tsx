"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateLeadCommercialsAction } from "@/app/actions/lead";
import { LEAD_CATEGORIES, LEAD_CATEGORY_LABELS, type LeadCategory } from "@/lib/enums";

export function LeadCommercialsForm({
  leadId,
  dealValue,
  billingCycle,
  category,
}: {
  leadId: string;
  dealValue: number;
  billingCycle: string;
  category: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => updateLeadCommercialsAction(leadId, formData))}
      className="flex flex-wrap items-center gap-1"
    >
      <input
        name="dealValue"
        type="number"
        min="0"
        defaultValue={dealValue}
        className="w-24 rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand"
      />
      <select
        name="billingCycle"
        defaultValue={billingCycle}
        className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand"
      >
        <option value="ANNUAL">Annual</option>
        <option value="MONTHLY">Monthly</option>
      </select>
      <select
        name="category"
        defaultValue={category ?? ""}
        className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand"
      >
        <option value="">No category</option>
        {LEAD_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {LEAD_CATEGORY_LABELS[c as LeadCategory]}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        Save
      </Button>
    </form>
  );
}
