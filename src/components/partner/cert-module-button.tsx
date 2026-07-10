"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeCertModuleAction } from "@/app/actions/certification";
import type { CertModuleKey } from "@/lib/enums";

export function CertModuleButton({ moduleKey, done }: { moduleKey: CertModuleKey; done: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (done) return <span className="text-xs font-medium text-emerald-600">Completed</span>;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => completeCertModuleAction(moduleKey))}
    >
      {isPending ? "Marking…" : "Mark complete"}
    </Button>
  );
}
