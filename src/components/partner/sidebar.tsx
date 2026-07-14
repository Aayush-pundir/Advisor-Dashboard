"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useMobileNav } from "@/components/shared/mobile-nav-context";

const links = [
  { href: "/partner/leads", label: "Leads & Pipeline" },
  { href: "/partner/assets", label: "My Asset Kit" },
  { href: "/partner/campaigns", label: "Campaigns" },
  { href: "/partner/achievements", label: "Achievements" },
];

export function PartnerSidebar({
  firmName,
  isCertified = true,
}: {
  firmName: string;
  isCertified?: boolean;
}) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden print:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 md:relative md:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold">{firmName}</p>
        <p className="text-xs text-muted">Advisor Partner Portal</p>
      </div>
      <nav onClick={() => setOpen(false)} className="flex flex-1 flex-col gap-1 p-3">
        <Link
          href="/partner"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/partner" && "bg-brand-light text-brand-dark",
          )}
        >
          {isCertified ? "Dashboard" : "Onboarding Status"}
        </Link>
        <Link
          href="/partner/documents"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/partner/documents" && "bg-brand-light text-brand-dark",
          )}
        >
          Documents
        </Link>
        {isCertified &&
          links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
                pathname === l.href && "bg-brand-light text-brand-dark",
              )}
            >
              {l.label}
            </Link>
          ))}
        <Link
          href="/partner/settings"
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/partner/settings" && "bg-brand-light text-brand-dark",
          )}
        >
          Settings
        </Link>
      </nav>
      <form action={logoutAction} className="border-t border-border p-3">
        <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-brand-light">
          Sign out
        </button>
      </form>
      </aside>
    </>
  );
}
