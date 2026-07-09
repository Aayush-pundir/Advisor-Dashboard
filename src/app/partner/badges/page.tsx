import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { BADGE_TIER_META, type BadgeTier } from "@/lib/enums";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tierColor: Record<Exclude<BadgeTier, "NONE">, string> = {
  SILVER: "border-t-silver",
  GOLD: "border-t-gold",
  PLATINUM: "border-t-platinum",
};

export default async function PartnerBadgesPage() {
  const session = await getSession();
  const badges = await db.badge.findMany({
    where: { partnerId: session!.partnerId! },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Milestones & Badges</h1>
      <p className="mt-1 text-muted">
        5 / 10 / 50 clients in a quarter earns Silver / Gold / Platinum —
        auto-issued the day the milestone client goes live (Step 4).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(["SILVER", "GOLD", "PLATINUM"] as const).map((tier) => {
          const meta = BADGE_TIER_META[tier];
          const earned = badges.filter((b) => b.tier === tier);
          return (
            <Card key={tier} className={cn("border-t-4 p-5", tierColor[tier])}>
              <p className="text-xs font-semibold uppercase text-muted">
                {tier} Advisor
              </p>
              <p className="mt-1 text-lg font-semibold">
                {meta.threshold} clients / quarter
              </p>
              <p className="mt-1 text-sm text-muted">{meta.gift}</p>
              <p className="mt-3 text-xs font-medium text-brand-dark">
                Earned {earned.length}&times;
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 divide-y divide-border">
        {badges.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 text-sm">
            <span>
              {b.tier} — {b.quarter} ({b.clientsAtMilestone} clients)
            </span>
            <span className="text-muted">{formatDate(b.issuedAt)}</span>
          </div>
        ))}
        {badges.length === 0 && (
          <p className="p-6 text-center text-muted">
            No badges earned yet — close your first 5 clients this quarter.
          </p>
        )}
      </Card>
    </div>
  );
}
