import { db } from "@/lib/db";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";

export default async function AdminReferralsPage() {
  const partners = await db.partner.findMany({
    include: {
      referrals: { select: { id: true, firmName: true, stage: true, createdAt: true } },
      referralBonusesEarned: { select: { amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const roots = partners.filter((p) => p.referrals.length > 0);
  const totalBonusesPaid = partners
    .flatMap((p) => p.referralBonusesEarned)
    .filter((b) => b.status === "PAID")
    .reduce((s, b) => s + b.amount, 0);
  const totalReferrals = partners.reduce((s, p) => s + p.referrals.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Referral Network</h1>
      <p className="mt-1 text-muted">
        The partner-referral flywheel (Step 8) — every advisor who brought in
        another advisor, and what&apos;s been earned for it.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Referring partners</p>
          <p className="mt-1 text-xl font-semibold">{roots.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Total referrals</p>
          <p className="mt-1 text-xl font-semibold">{totalReferrals}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase text-muted">Bonuses paid</p>
          <p className="mt-1 text-xl font-semibold">{formatINR(totalBonusesPaid)}</p>
        </Card>
      </div>

      <Card className="mt-6 divide-y divide-border">
        {roots.map((p) => {
          const bonusEarned = p.referralBonusesEarned.reduce((s, b) => s + b.amount, 0);
          return (
            <div key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <Link href={`/admin/partners/${p.id}`} className="font-medium text-brand-dark hover:underline">
                  {p.firmName}
                </Link>
                <span className="text-xs text-muted">
                  {p.referrals.length} referred &middot; {formatINR(bonusEarned)} earned
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1 border-l-2 border-border pl-4">
                {p.referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <Link href={`/admin/partners/${r.id}`} className="hover:underline">
                      {r.firmName}
                    </Link>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {formatDate(r.createdAt)}
                      <Badge variant="neutral">{r.stage}</Badge>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {roots.length === 0 && (
          <p className="p-6 text-center text-muted">No referrals yet.</p>
        )}
      </Card>
    </div>
  );
}
