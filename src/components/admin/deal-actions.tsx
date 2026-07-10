"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveDealAction, rejectDealAction } from "@/app/actions/deals";

export function DealActions({ dealId, status }: { dealId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status !== "PENDING") return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => rejectDealAction(dealId))}
      >
        Reject
      </Button>
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => approveDealAction(dealId))}
      >
        Approve
      </Button>
    </div>
  );
}
