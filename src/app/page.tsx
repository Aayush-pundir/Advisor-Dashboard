import { HomeLanding } from "@/components/site/home-landing";
import { db } from "@/lib/db";

export default async function Home() {
  const grouped = await db.partner.groupBy({
    by: ["state"],
    where: { stage: { in: ["CERTIFIED", "ACTIVE"] } },
    _count: { _all: true },
  });

  const stateCoverage = grouped
    .map((g) => ({ state: g.state, count: g._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return <HomeLanding stateCoverage={stateCoverage} />;
}
