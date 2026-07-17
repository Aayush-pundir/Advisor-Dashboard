import Link from "next/link";

/** A removable active-filter pill. `removeHref` points at the same page with
 * this one filter cleared. */
export function FilterChip({ label, removeHref }: { label: string; removeHref: string }) {
  return (
    <Link
      href={removeHref}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand-dark"
    >
      <span>{label}</span>
      <span aria-hidden className="text-sm leading-none">
        &times;
      </span>
    </Link>
  );
}
