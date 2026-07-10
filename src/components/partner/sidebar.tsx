"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/partner/leads", label: "Leads & Pipeline" },
  { href: "/partner/leads/bulk-upload", label: "Bulk Upload Leads" },
  { href: "/partner/marketing-contacts", label: "Marketing Contact List" },
  { href: "/partner/deals", label: "Deal Registration" },
  { href: "/partner/mdf", label: "MDF Requests" },
  { href: "/partner/assets", label: "My Asset Kit" },
  { href: "/partner/campaigns", label: "Campaigns" },
  { href: "/partner/badges", label: "Milestones & Badges" },
  { href: "/partner/leaderboard", label: "Leaderboard" },
  { href: "/partner/certification", label: "Certification Track" },
  { href: "/partner/referrals", label: "Refer a CA" },
  { href: "/partner/documents", label: "Documents" },
  { href: "/partner/integrations", label: "Integrations" },
  { href: "/partner/team", label: "Team" },
];

export function PartnerSidebar({
  firmName,
  unreadCount = 0,
  isCertified = true,
}: {
  firmName: string;
  unreadCount?: number;
  isCertified?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface print:hidden">
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold">{firmName}</p>
        <p className="text-xs text-muted">Advisor Partner Portal</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
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
          href="/partner/notifications"
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-brand-light hover:text-brand-dark",
            pathname === "/partner/notifications" && "bg-brand-light text-brand-dark",
          )}
        >
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
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
  );
}
