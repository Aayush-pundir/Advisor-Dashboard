import { SiteNavbar } from "@/components/site/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import Link from "next/link";
import { MILESTONE_TIER_META, type MilestoneTier } from "@/lib/enums";

const badgeVariant: Record<MilestoneTier, "neutral" | "silver" | "gold" | "platinum"> = {
  NONE: "neutral",
  CLIENT_1: "neutral",
  CLIENT_3: "neutral",
  CLIENT_5: "silver",
  CLIENT_10: "silver",
  CLIENT_15: "gold",
  CLIENT_20: "gold",
  CLIENT_25: "platinum",
};

export default async function DirectoryPage() {
  const partners = await db.partner.findMany({
    where: { stage: { in: ["CERTIFIED", "ACTIVE"] } },
    orderBy: { firmName: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <h1 className="text-2xl font-bold">Certified Advisor Directory</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Inbound businesses are routed to these certified Implementation
          Advisors. Every advisor here has completed certification and can
          be recommended for OmniCard implementation.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Link key={p.id} href={`/advisor/${p.slug}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{p.firmName}</p>
                    <p className="text-sm text-muted">
                      {p.contactName} &middot; {p.city}, {p.state}
                    </p>
                  </div>
                  {p.eliteClubMember ? (
                    <Badge variant="platinum">Elite Club</Badge>
                  ) : (
                    p.badgeTier !== "NONE" && (
                      <Badge variant={badgeVariant[p.badgeTier as MilestoneTier]}>
                        {MILESTONE_TIER_META[p.badgeTier as Exclude<MilestoneTier, "NONE">].label}
                      </Badge>
                    )
                  )}
                </div>
                <p className="mt-3 text-xs text-muted">
                  Certified Implementation Advisor
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {partners.length === 0 && (
          <p className="mt-10 text-center text-muted">
            No certified advisors yet — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
