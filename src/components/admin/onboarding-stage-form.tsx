"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function OnboardingStageForm({
  action,
  locked,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  locked: boolean;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => action(formData))}
      className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-brand-light/20 p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-xs font-medium text-muted">
          Date
          <input
            type="date"
            name="date"
            disabled={locked}
            className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand disabled:opacity-50"
          />
        </label>
        <textarea
          name="comment"
          disabled={locked}
          placeholder="Comment (optional)"
          rows={1}
          className="flex-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-brand disabled:opacity-50"
        />
      </div>
      <div>
        <Button type="submit" size="sm" disabled={locked || isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
        {locked && <span className="ml-2 text-xs text-muted">Complete the previous step first</span>}
      </div>
    </form>
  );
}
