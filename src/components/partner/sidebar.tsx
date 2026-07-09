"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/partner", label: "Dashboard" },
  { href: "/partner/leads", label: "Leads & Pipeline" },
  { href: "/partner/assets", label: "My Asset Kit" },
  { href: "/partner/campaigns", label: "Campaigns" },
  { href: "/partner/badges", label: "Milestones & Badges" },
  { href: "/partner/referrals", label: "Refer a CA" },
];

export function PartnerSidebar({ firmName }: { firmName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold">{firmName}</p>
        <p className="text-xs text-muted">Advisor Partner Portal</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((l) => (
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
      </nav>
      <form action={logoutAction} className="border-t border-border p-3">
        <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-brand-light">
          Sign out
        </button>
      </form>
    </aside>
  );
}
