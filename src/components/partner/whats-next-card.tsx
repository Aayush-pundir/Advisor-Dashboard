import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Nudge = { text: string; href: string };

export function WhatsNextCard({ nudges }: { nudges: Nudge[] }) {
  if (nudges.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What&apos;s next</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {nudges.map((n) => (
          <Link
            key={n.href + n.text}
            href={n.href}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-brand-light/40"
          >
            <span>{n.text}</span>
            <span className="text-muted">&rarr;</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
