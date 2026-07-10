"use client";

import { useState, useTransition } from "react";
import { revealLeadPiiAction } from "@/app/actions/pii";

export function RevealPii({
  leadId,
  maskedPhone,
  maskedEmail,
}: {
  leadId: string;
  maskedPhone: string;
  maskedEmail: string;
}) {
  const [revealed, setRevealed] = useState<{ phone: string; email: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (revealed) {
    return (
      <div className="text-xs">
        <p>{revealed.phone}</p>
        <p className="text-muted">{revealed.email}</p>
      </div>
    );
  }

  return (
    <div className="text-xs">
      <p>{maskedPhone}</p>
      <p className="text-muted">{maskedEmail}</p>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await revealLeadPiiAction(leadId);
            if (result.ok) setRevealed({ phone: result.phone!, email: result.email! });
          })
        }
        className="mt-0.5 text-brand hover:underline disabled:opacity-50"
      >
        {isPending ? "Revealing…" : "Reveal"}
      </button>
    </div>
  );
}
