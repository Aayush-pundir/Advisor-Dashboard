"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logClientActivityAction, logSupportTouchAction, setNpsScoreAction } from "@/app/actions/health";

export function ClientHealthActions({ leadId, npsScore }: { leadId: string; npsScore: number | null }) {
  const [nps, setNps] = useState(npsScore != null ? String(npsScore) : "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => logClientActivityAction(leadId))}
      >
        Log activity
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => logSupportTouchAction(leadId))}
      >
        Log support touch
      </Button>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="10"
          placeholder="NPS"
          value={nps}
          onChange={(e) => setNps(e.target.value)}
          className="w-14 rounded-lg border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-brand"
        />
        <Button
          size="sm"
          disabled={isPending || nps === ""}
          onClick={() => startTransition(() => setNpsScoreAction(leadId, Number(nps)))}
        >
          Set NPS
        </Button>
      </div>
    </div>
  );
}
