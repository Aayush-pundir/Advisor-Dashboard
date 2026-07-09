"use client";

import { useTransition } from "react";
import { advanceLeadStageAction } from "@/app/actions/lead";
import type { LeadStage } from "@/lib/enums";

export function LeadStageSelect({
  leadId,
  current,
  stages,
  labels,
}: {
  leadId: string;
  current: string;
  stages: readonly LeadStage[];
  labels: Record<LeadStage, string>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={isPending}
      onChange={(e) => {
        const stage = e.target.value as LeadStage;
        startTransition(() => {
          advanceLeadStageAction(leadId, stage);
        });
      }}
      className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand disabled:opacity-50"
    >
      {stages.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
