import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatINR, quarterStart, maskFirmName } from "@/lib/utils";
import {
  MILESTONE_TIERS,
  MILESTONE_TIER_META,
  ELITE_CLUB_BENEFIT_DESCRIPTION,
  CERT_LEVELS,
  CERT_LEVEL_LABELS,
  CERT_MODULES,
  type MilestoneTier,
  type CertLevel,
} from "@/lib/enums";
import { CertModuleButton } from "@/components/partner/cert-module-button";

const TABS = [
  { key: "badges", label: "Milestones & Badges" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "certification", label: "Certification Track" },
  { key: "refer", label: "Refer a CA" },
] as const;

export default async function PartnerAchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? tab! : "badges";

  return (
    <div>
      <h1 className="text-2xl font-bold">Achievements</h1>
      <p className="mt-1 text-muted">
        Your badges, rank, certification progress, and referral bonus, in one place.
      </p>

      <div className="mt-4 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "badges" ? "/partner/achievements" : `/partner/achievements?tab=${t.key}`}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === t.key ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "badges" && <BadgesTab />}
      {activeTab === "leaderboard" && <LeaderboardTab />}
      {activeTab === "certification" && <CertificationTab />}
      {activeTab === "refer" && <ReferTab />}
    </div>
  );
}

async function BadgesTab() {
  const session = await getSession();
  const [partner, badges] = await Promise.all([
    db.partner.findUniqueOrThrow({ where: { id: session!.partnerId! } }),
    db.badge.findMany({
      where: { partnerId: session!.partnerId! },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const milestoneOrder = MILESTONE_TIERS.filter((t) => t !== "NONE") as Exclude<MilestoneTier, "NONE">[];

  return (
    <div className="mt-6">
      <p className="text-sm text-muted">
        Refer 1 / 3 / 5 / 10 / 15 / 20 / 25 clients within your current anniversary year (12 months from
        certification) to climb the ladder — auto-issued the day the milestone client goes live. Reach 25 in a
        single year and you&apos;re inducted into the Elite Club for good.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {milestoneOrder.map((tier) => {
          const meta = MILESTONE_TIER_META[tier];
          const earned = badges.filter((b) => b.tier === tier);
          return (
            <Card key={tier} className="p-5">
              <p className="text-xs font-semibold uppercase text-muted">{meta.label}</p>
              <p className="mt-1 text-sm text-muted">{meta.reward}</p>
              <p className="mt-3 text-xs font-medium text-brand-dark">Earned {earned.length}&times;</p>
            </Card>
          );
        })}
        <Card className={cn("border-t-4 border-t-platinum p-5", partner.eliteClubMember && "bg-brand-light/40")}>
          <p className="text-xs font-semibold uppercase text-muted">Elite Club</p>
          <p className="mt-1 text-sm text-muted">{ELITE_CLUB_BENEFIT_DESCRIPTION}</p>
          <p className="mt-3 text-xs font-medium text-brand-dark">
            {partner.eliteClubMember
              ? `Member since ${formatDate(partner.eliteMemberSince!)} — ${partner.eliteBenefitsIssued} benefit(s) unlocked`
              : "Reach 25 clients in one anniversary year to join"}
          </p>
        </Card>
      </div>

      <Card className="mt-6 divide-y divide-border">
        {badges.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 text-sm">
            <span>
              {b.tier === "ELITE_BENEFIT" ? "Elite Club benefit" : MILESTONE_TIER_META[b.tier as Exclude<MilestoneTier, "NONE">].label}
              {" — "}
              {b.period} ({b.clientsAtMilestone} clients)
            </span>
            <span className="text-muted">{formatDate(b.issuedAt)}</span>
          </div>
        ))}
        {badges.length === 0 && (
          <p className="p-6 text-center text-muted">No milestones earned yet — close your first client to get started.</p>
        )}
      </Card>
    </div>
  );
}

const tierVariant: Record<MilestoneTier, "neutral" | "silver" | "gold" | "platinum"> = {
  NONE: "neutral",
  CLIENT_1: "neutral",
  CLIENT_3: "neutral",
  CLIENT_5: "silver",
  CLIENT_10: "silver",
  CLIENT_15: "gold",
  CLIENT_20: "gold",
  CLIENT_25: "platinum",
};

async function LeaderboardTab() {
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
      badgeTier: p.badgeTier as MilestoneTier,
      eliteClubMember: p.eliteClubMember,
      clients: p.leads.length,
      revenue: p.leads.reduce((s, l) => s + l.dealValue, 0),
    }))
    .filter((p) => p.clients > 0)
    .sort((a, b) => b.clients - a.clients || b.revenue - a.revenue)
    .slice(0, 20);

  return (
    <div className="mt-6">
      <p className="text-sm text-muted">Top advisors this quarter, ranked by clients closed.</p>
      <Card className="mt-4 divide-y divide-border">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={cn("flex items-center justify-between gap-4 p-4", p.id === session?.partnerId && "bg-brand-light/40")}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center text-sm font-semibold text-muted">{i + 1}</span>
              <div>
                <p className="text-sm font-medium">
                  {p.id === session?.partnerId ? p.firmName : maskFirmName(p.firmName)}
                  {p.id === session?.partnerId && <span className="ml-2 text-xs font-normal text-brand">(you)</span>}
                </p>
                <p className="text-xs text-muted">{p.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{p.clients} clients</p>
                <p className="text-xs text-muted">{formatINR(p.revenue)}</p>
              </div>
              {p.eliteClubMember ? (
                <Badge variant="platinum">Elite Club</Badge>
              ) : (
                p.badgeTier !== "NONE" && (
                  <Badge variant={tierVariant[p.badgeTier]}>{MILESTONE_TIER_META[p.badgeTier as Exclude<MilestoneTier, "NONE">].label}</Badge>
                )
              )}
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <p className="p-6 text-center text-muted">No clients closed yet this quarter — be the first on the board.</p>
        )}
      </Card>
    </div>
  );
}

async function CertificationTab() {
  const session = await getSession();
  const [partner, progress] = await Promise.all([
    db.partner.findUniqueOrThrow({ where: { id: session!.partnerId! } }),
    db.certificationProgress.findMany({ where: { partnerId: session!.partnerId! } }),
  ]);
  const completed = new Set(progress.map((p) => p.moduleKey));
  const certLevel = partner.certLevel as CertLevel;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Current level:</span>
        <Badge variant={certLevel === "NONE" ? "neutral" : "success"}>{CERT_LEVEL_LABELS[certLevel]}</Badge>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {CERT_LEVELS.filter((l) => l !== "NONE").map((level) => {
          const modules = CERT_MODULES.filter((m) => m.level === level);
          const doneCount = modules.filter((m) => completed.has(m.key)).length;
          const isCurrentOrPast = CERT_LEVELS.indexOf(certLevel) >= CERT_LEVELS.indexOf(level);
          return (
            <Card key={level} className={cn("p-5", isCurrentOrPast && "border-brand")}>
              <p className="text-xs font-semibold uppercase text-muted">{CERT_LEVEL_LABELS[level]}</p>
              <p className="mt-1 text-lg font-semibold">
                {doneCount}/{modules.length} modules
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {modules.map((m) => (
                  <div key={m.key} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{m.label}</span>
                    <CertModuleButton moduleKey={m.key} done={completed.has(m.key)} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

async function ReferTab() {
  const session = await getSession();
  const partner = await db.partner.findUniqueOrThrow({ where: { id: session!.partnerId! } });
  const [referred, bonuses] = await Promise.all([
    db.partner.findMany({ where: { referredById: partner.id } }),
    db.referralBonus.findMany({ where: { referrerId: partner.id } }),
  ]);
  const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mt-6">
      <p className="text-sm text-muted">The flywheel compounds — earn a referral bonus on your referred CA&apos;s first closure.</p>

      <Card className="mt-4 p-6">
        <p className="text-sm font-medium">Your referral code</p>
        <p className="mt-1 font-mono text-lg text-brand-dark">{partner.referralCode}</p>
        <p className="mt-2 text-sm text-muted">Share this code with fellow CAs — new signups referred by you count toward your bonus.</p>
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
          <p className="p-6 text-center text-muted">No referrals yet — share your code to start compounding.</p>
        )}
      </Card>
    </div>
  );
}
