"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestDemoAction } from "@/app/actions/partner";

export function RequestDemoButton({ alreadyRequested }: { alreadyRequested: boolean }) {
  const [requested, setRequested] = useState(alreadyRequested);
  const [isPending, startTransition] = useTransition();

  if (requested) {
    return <span className="text-sm text-emerald-600">Demo requested — the team will confirm a slot shortly.</span>;
  }

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await requestDemoAction();
          setRequested(true);
        })
      }
    >
      {isPending ? "Requesting…" : "Request a demo slot"}
    </Button>
  );
}
