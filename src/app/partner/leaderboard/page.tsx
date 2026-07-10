import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, quarterStart } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BadgeTier } from "@/lib/enums";

const tierVariant: Record<BadgeTier, "neutral" | "silver" | "gold" | "platinum"> = {
  NONE: "neutral",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
};

export default async function PartnerLeaderboardPage() {
  const session = await getSession();
  const since = quarterStart(new Date());

  const partners = await db.partner.findMany({
    where: { stage: { in: ["CERTIFIED", "ACTIVE"] } },
    include: {
      leads: { where: { stage: "CLOSED_WON", closedAt: { gte: since } }, select: { dealValue: true } },
    },
  });

  const ranked = partners
    .map((p) => ({
      id: p.id,
      firmName: p.firmName,
      city: p.city,
      badgeTier: p.badgeTier as BadgeTier,
      clients: p.leads.length,
      revenue: p.leads.reduce((s, l) => s + l.dealValue, 0),
    }))
    .filter((p) => p.clients > 0)
    .sort((a, b) => b.clients - a.clients || b.revenue - a.revenue)
    .slice(0, 20);

  return (
    <div>
      <h1 className="text-2xl font-bold">Advisor Leaderboard</h1>
      <p className="mt-1 text-muted">
        Top advisors this quarter, ranked by clients closed — the same
        milestone count that drives your Silver/Gold/Platinum badge.
      </p>

      <Card className="mt-6 divide-y divide-border">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center justify-between gap-4 p-4",
              p.id === session?.partnerId && "bg-brand-light/40",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-semibold text-muted">{i + 1}</span>
              <div>
                <p className="text-sm font-medium">
                  {p.firmName}
                  {p.id === session?.partnerId && (
                    <span className="ml-2 text-xs font-normal text-brand">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted">{p.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{p.clients} clients</p>
                <p className="text-xs text-muted">{formatINR(p.revenue)}</p>
              </div>
              {p.badgeTier !== "NONE" && (
                <Badge variant={tierVariant[p.badgeTier]}>{p.badgeTier}</Badge>
              )}
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <p className="p-6 text-center text-muted">
            No clients closed yet this quarter — be the first on the board.
          </p>
        )}
      </Card>
    </div>
  );
}
