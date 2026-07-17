"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { revealAllLeadsPiiAction } from "@/app/actions/pii";

type RevealedMap = Record<string, { phone: string; email: string }>;

// Holds leads revealed via "reveal all". Default empty so RevealPii works even
// when it's rendered without a provider (e.g. the lead detail page).
const RevealedContext = createContext<RevealedMap>({});
export function useRevealedMap() {
  return useContext(RevealedContext);
}

const RevealAllContext = createContext<{ revealAll: () => void; isPending: boolean; count: number } | null>(null);

export function PiiRevealProvider({ leadIds, children }: { leadIds: string[]; children: React.ReactNode }) {
  const [revealedMap, setRevealedMap] = useState<RevealedMap>({});
  const [isPending, startTransition] = useTransition();

  function revealAll() {
    startTransition(async () => {
      const res = await revealAllLeadsPiiAction(leadIds);
      if (res.ok && res.items) {
        const map: RevealedMap = {};
        for (const it of res.items) map[it.id] = { phone: it.phone, email: it.email };
        setRevealedMap(map);
      }
    });
  }

  return (
    <RevealedContext.Provider value={revealedMap}>
      <RevealAllContext.Provider value={{ revealAll, isPending, count: Object.keys(revealedMap).length }}>
        {children}
      </RevealAllContext.Provider>
    </RevealedContext.Provider>
  );
}

export function RevealAllButton() {
  const ctx = useContext(RevealAllContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={ctx.revealAll}
      disabled={ctx.isPending || ctx.count > 0}
      className="text-xs font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
    >
      {ctx.isPending ? "Revealing…" : ctx.count > 0 ? `Contacts revealed (${ctx.count})` : "Reveal all contacts"}
    </button>
  );
}
