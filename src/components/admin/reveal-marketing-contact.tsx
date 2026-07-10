"use client";

import { useState, useTransition } from "react";
import { revealMarketingContactAction } from "@/app/actions/marketing-contacts";

export function RevealMarketingContact({
  contactId,
  maskedPhone,
  maskedEmail,
}: {
  contactId: string;
  maskedPhone: string;
  maskedEmail: string;
}) {
  const [revealed, setRevealed] = useState<{ phone: string; email?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (revealed) {
    return (
      <div className="text-xs">
        <p>{revealed.phone}</p>
        {revealed.email && <p className="text-muted">{revealed.email}</p>}
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
            const result = await revealMarketingContactAction(contactId);
            if (result.ok) setRevealed({ phone: result.phone!, email: result.email });
          })
        }
        className="mt-0.5 text-brand hover:underline disabled:opacity-50"
      >
        {isPending ? "Revealing…" : "Reveal"}
      </button>
    </div>
  );
}
