"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/admin", label: "KPI Overview" },
  { href: "/admin/partners", label: "Partners (CRM)" },
  { href: "/admin/partners/bulk-upload", label: "Bulk Add Partners" },
  { href: "/admin/leads", label: "Lead-to-Revenue" },
  { href: "/admin/clients", label: "Client Health" },
  { href: "/admin/ops", label: "Ops Efficiency" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/marketing-contacts", label: "Marketing Contact Lists" },
  { href: "/admin/commissions", label: "Commission Ledger" },
  { href: "/admin/deals", label: "Deal Registrations" },
  { href: "/admin/mdf", label: "MDF Requests" },
  { href: "/admin/support", label: "Support Tickets" },
  { href: "/admin/referrals", label: "Referral Network" },
  { href: "/admin/exports", label: "Export Center" },
];

const adminOnlyLinks = [
  { href: "/admin/team", label: "Internal Team" },
  { href: "/admin/audit", label: "Audit Log" },
  { href: "/admin/escalation", label: "Escalation Matrix" },
];

export function AdminSidebar({
  name,
  role,
  queueCount = 0,
}: {
  name: string;
  role: string;
  queueCount?: number;
}) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted">{role.replace("_", " ")}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <Link
          href="/admin/queue"
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/admin/queue" && "bg-brand-light text-brand-dark",
          )}
        >
          <span>Action Queue</span>
          {queueCount > 0 && (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {queueCount > 99 ? "99+" : queueCount}
            </span>
          )}
        </Link>
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
        {isAdmin && (
          <>
            <div className="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
              Admin
            </div>
            {adminOnlyLinks.map((l) => (
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
          </>
        )}
        <Link
          href="/admin/settings"
          className={cn(
            "mt-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/admin/settings" && "bg-brand-light text-brand-dark",
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
  );
}
