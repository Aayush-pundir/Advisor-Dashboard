"use client";

import { useState } from "react";

export function CoLandingAccordion({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  const words = title.split(" ");

  return (
    <div className="rounded-xl bg-[#141414]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left font-bold"
      >
        <span>
          {words.map((w, idx) => (
            <span key={idx} className={idx === 1 || idx === 2 ? "mr-1 text-[#DC2E22]" : "mr-1"}>
              {w}
            </span>
          ))}
        </span>
        <span className="shrink-0 text-white/50">{open ? "▲" : "▼"}</span>
      </button>
      {open && <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">{body}</p>}
    </div>
  );
}
