"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { escalateTicketAction, resolveTicketAction, markTicketInProgressAction } from "@/app/actions/support";

export function TicketActions({ ticketId, status }: { ticketId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [resolving, setResolving] = useState(false);

  if (status === "RESOLVED") return <span className="text-xs text-muted">Resolved</span>;

  if (resolving) {
    return (
      <form
        action={(formData) => startTransition(() => resolveTicketAction(ticketId, formData))}
        className="flex w-56 flex-col gap-2"
      >
        <textarea
          name="resolution"
          required
          rows={2}
          placeholder="Resolution notes"
          className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <Button size="sm" type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Confirm resolve"}
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => setResolving(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      {status === "OPEN" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(() => markTicketInProgressAction(ticketId))}
        >
          In progress
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => escalateTicketAction(ticketId))}
      >
        Escalate
      </Button>
      <Button size="sm" disabled={isPending} onClick={() => setResolving(true)}>
        Resolve
      </Button>
    </div>
  );
}
