"use client";

import { useMemo, useState } from "react";

export function PartnerPicker({ partners }: { partners: { id: string; firmName: string }[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) => p.firmName.toLowerCase().includes(q));
  }, [partners, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="sm:col-span-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${partners.length} partners…`}
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border">
        {filtered.map((p) => (
          <label key={p.id} className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-sm last:border-0 hover:bg-brand-light/40">
            <input
              type="checkbox"
              name="partnerIds"
              value={p.id}
              checked={selected.has(p.id)}
              onChange={() => toggle(p.id)}
            />
            {p.firmName}
          </label>
        ))}
        {filtered.length === 0 && <p className="px-3 py-2 text-xs text-muted">No partners match.</p>}
      </div>
      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSelected(new Set(partners.map((p) => p.id)))}
          className="text-xs font-medium text-brand-dark hover:underline"
        >
          Select all {partners.length}
        </button>
        {selected.size > 0 && (
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-muted hover:underline">
            Clear
          </button>
        )}
        {selected.size > 0 && <span className="text-xs text-muted">{selected.size} selected</span>}
      </div>
    </div>
  );
}
