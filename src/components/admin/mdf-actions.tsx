"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveMdfAction, rejectMdfAction, markMdfPaidAction } from "@/app/actions/mdf";

export function MdfActions({
  mdfId,
  status,
  requestedAmount,
}: {
  mdfId: string;
  status: string;
  requestedAmount: number;
}) {
  const [amount, setAmount] = useState(String(requestedAmount));
  const [isPending, startTransition] = useTransition();

  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => rejectMdfAction(mdfId))}
        >
          Reject
        </Button>
        <Button
          size="sm"
          disabled={isPending || !Number(amount)}
          onClick={() => startTransition(() => approveMdfAction(mdfId, Number(amount)))}
        >
          Approve
        </Button>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => markMdfPaidAction(mdfId))}
      >
        Mark Paid
      </Button>
    );
  }

  return null;
}
