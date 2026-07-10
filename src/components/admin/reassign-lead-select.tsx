"use client";

import { useTransition } from "react";
import { reassignLeadAction } from "@/app/actions/lead";

export function ReassignLeadSelect({
  leadId,
  assignedToId,
  reps,
}: {
  leadId: string;
  assignedToId: string | null;
  reps: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={assignedToId ?? ""}
      disabled={isPending}
      onChange={(e) => startTransition(() => reassignLeadAction(leadId, e.target.value))}
      className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand disabled:opacity-50"
    >
      <option value="">Unassigned</option>
      {reps.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
