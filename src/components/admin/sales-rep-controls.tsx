"use client";

import { useTransition } from "react";
import { setSalesRepAction, setAssignmentPriorityAction } from "@/app/actions/ops";

export function SalesRepControls({
  userId,
  isSalesRep,
  priority,
}: {
  userId: string;
  isSalesRep: boolean;
  priority: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-xs text-muted">
        <input
          type="checkbox"
          defaultChecked={isSalesRep}
          disabled={isPending}
          onChange={(e) => startTransition(() => setSalesRepAction(userId, e.target.checked))}
        />
        Sales rep
      </label>
      {isSalesRep && (
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Priority
          <input
            type="number"
            defaultValue={priority}
            disabled={isPending}
            onBlur={(e) => startTransition(() => setAssignmentPriorityAction(userId, Number(e.target.value) || 0))}
            className="w-14 rounded border border-border bg-transparent px-1.5 py-0.5 text-xs outline-none focus:border-brand"
          />
        </label>
      )}
    </div>
  );
}
