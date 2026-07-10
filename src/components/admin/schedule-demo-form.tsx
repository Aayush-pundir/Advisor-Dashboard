"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { scheduleDemoAction } from "@/app/actions/partner";

export function ScheduleDemoForm({ partnerId }: { partnerId: string }) {
  const [date, setDate] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => startTransition(() => scheduleDemoAction(partnerId, date))}
      className="flex items-center gap-2"
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand"
      />
      <Button size="sm" type="submit" disabled={isPending}>
        {isPending ? "Scheduling…" : "Schedule demo"}
      </Button>
    </form>
  );
}
