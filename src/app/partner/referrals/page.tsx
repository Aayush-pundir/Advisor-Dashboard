import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export default async function PartnerReferralsPage() {
  const session = await getSession();
  const partner = await db.partner.findUniqueOrThrow({
    where: { id: session!.partnerId! },
  });
  const referred = await db.partner.findMany({
    where: { referredById: partner.id },
  });
  const bonuses = await db.referralBonus.findMany({
    where: { referrerId: partner.id },
  });

  const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Refer a CA</h1>
      <p className="mt-1 text-muted">
        The flywheel compounds — earn a referral bonus on your referred CA&apos;s
        first closure (Step 8).
      </p>

      <Card className="mt-6 p-6">
        <p className="text-sm font-medium">Your referral code</p>
        <p className="mt-1 font-mono text-lg text-brand-dark">
          {partner.referralCode}
        </p>
        <p className="mt-2 text-sm text-muted">
          Share this code with fellow CAs — new signups referred by you count
          toward your bonus.
        </p>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs uppercase text-muted">CAs referred</p>
          <p className="mt-1 text-2xl font-semibold">{referred.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase text-muted">Referral bonus earned</p>
          <p className="mt-1 text-2xl font-semibold">{formatINR(totalBonus)}</p>
        </Card>
      </div>

      <Card className="mt-6 divide-y divide-border">
        {referred.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <span>{r.firmName}</span>
            <span className="text-muted">{r.stage}</span>
          </div>
        ))}
        {referred.length === 0 && (
          <p className="p-6 text-center text-muted">
            No referrals yet — share your code to start compounding.
          </p>
        )}
      </Card>
    </div>
  );
}
