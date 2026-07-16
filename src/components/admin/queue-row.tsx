import Link from "next/link";
import { Card } from "@/components/ui/card";

export function QueueSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <Card>
      <div className="border-b border-border px-5 py-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="divide-y divide-border">
        {hasItems ? children : <p className="p-5 text-center text-sm text-muted">{emptyText}</p>}
      </div>
    </Card>
  );
}

export function QueueRow({
  href,
  primary,
  secondary,
  meta,
  badge,
}: {
  href: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex flex-col gap-1 px-5 py-3 text-sm hover:bg-brand-light/40">
      <p className="truncate font-medium">{primary}</p>
      {secondary && <p className="truncate text-xs text-muted">{secondary}</p>}
      {(meta || badge) && (
        <div className="flex items-center gap-2">
          {meta && <span className="truncate text-xs text-muted">{meta}</span>}
          {badge}
        </div>
      )}
    </Link>
  );
}
