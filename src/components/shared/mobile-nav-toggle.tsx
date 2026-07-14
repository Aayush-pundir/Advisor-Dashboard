"use client";

import { useMobileNav } from "@/components/shared/mobile-nav-context";

export function MobileNavToggle() {
  const { open, setOpen } = useMobileNav();

  return (
    <button
      onClick={() => setOpen(!open)}
      aria-label="Toggle navigation"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-brand-light hover:text-brand-dark md:hidden"
    >
      {open ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      )}
    </button>
  );
}
