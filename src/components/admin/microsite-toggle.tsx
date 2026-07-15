"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setMicrositeEnabledAction } from "@/app/actions/partner";

export function MicrositeToggle({ partnerId, enabled }: { partnerId: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={enabled ? "outline" : "primary"}
      disabled={isPending}
      onClick={() => startTransition(() => setMicrositeEnabledAction(partnerId, !enabled))}
    >
      {isPending ? "Updating…" : enabled ? "Stop page" : "Go live"}
    </Button>
  );
}
