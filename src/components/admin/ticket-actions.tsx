"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { escalateTicketAction, resolveTicketAction } from "@/app/actions/support";

export function TicketActions({ ticketId, status }: { ticketId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status === "RESOLVED") return <span className="text-xs text-muted">Resolved</span>;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => escalateTicketAction(ticketId))}
      >
        Escalate
      </Button>
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => resolveTicketAction(ticketId))}
      >
        Resolve
      </Button>
    </div>
  );
}
