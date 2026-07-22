import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPartnerDashboard } from "@/lib/queries/partner";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { OnboardingTimeline } from "@/components/partner/onboarding-timeline";
import { WhatsNextCard } from "@/components/partner/whats-next-card";
import { CopyLinkButton } from "@/components/partner/copy-link-button";
import { DashboardCalculator } from "@/components/partner/dashboard-calculator";

export default async function PartnerDashboardPage() {
  const session = await getSession();
  const partnerRecord = await db.partner.findUniqueOrThrow({ where: { id: session!.partnerId! } });

  if (partnerRecord.stage !== "CERTIFIED" && partnerRecord.stage !== "ACTIVE") {
    return <OnboardingTimeline partner={partnerRecord} />;
  }

  const data = await getPartnerDashboard(session!.partnerId!);
  const { partner, pipeline, closedWon, totalEarned, pendingEarnings, milestoneProgress, cityRank, cityTotal } = data;

  const referralLink = `omnicard.in/advisor/${partner.slug}`;
  const referralQrCode = await QRCode.toDataURL(`https://${referralLink}`);

  const openTickets = await db.supportTicket.count({
    where: { userId: session!.userId!, status: { in: ["OPEN", "IN_PROGRESS"] } },
  });

  const nudges: { text: string; href: string }[] = [];
  if (openTickets > 0) {
    nudges.push({
      text: `${openTickets} support ticket${openTickets > 1 ? "s" : ""} you raised still open`,
      href: "/partner/notifications",
    });
  }
  if (partner.certLevel === "NONE") {
    nudges.push({ text: "Start your certification track to level up", href: "/partner/achievements?tab=certification" });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {partner.contactName.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">
          Here&apos;s how {partner.firmName} is performing on the OmniCard
          program.
        </p>
      </div>

      <WhatsNextCard nudges={nudges} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total earned"
          value={formatINR(totalEarned)}
          hint={`${formatINR(pendingEarnings)} pending`}
        />
        <StatTile
          label="Active pipeline"
          value={String(pipeline.length)}
          hint="leads in progress"
        />
        <StatTile
          label="Clients closed"
          value={String(closedWon.length)}
          hint="lifetime"
        />
        <StatTile
          label={`City rank — ${partner.city}`}
          value={`#${cityRank || "-"}`}
          hint={`of ${cityTotal} advisors`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Model your earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCalculator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestone progress</CardTitle>
          </CardHeader>
          <CardContent>
            {milestoneProgress.type === "elite" ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>{milestoneProgress.totalClients} clients closed lifetime</span>
                  <Badge variant="platinum">Elite Club</Badge>
                </div>
                <Progress
                  value={
                    ((milestoneProgress.totalClients - (milestoneProgress.nextBenefitAt - 5)) / 5) * 100
                  }
                  className="mt-2"
                />
                <p className="mt-3 text-xs text-muted">
                  {milestoneProgress.benefitsIssued > 0
                    ? `${milestoneProgress.benefitsIssued} Elite benefit${milestoneProgress.benefitsIssued > 1 ? "s" : ""} unlocked so far. `
                    : ""}
                  Reach {milestoneProgress.nextBenefitAt} clients lifetime to unlock:{" "}
                  {milestoneProgress.benefitDescription}
                </p>
              </>
            ) : milestoneProgress.nextTier ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {milestoneProgress.clientsThisYear} / {milestoneProgress.nextTier.threshold} clients this year
                  </span>
                  <Badge variant="default">{milestoneProgress.nextTier.label}</Badge>
                </div>
                <Progress
                  value={(milestoneProgress.clientsThisYear / milestoneProgress.nextTier.threshold) * 100}
                  className="mt-2"
                />
                <p className="mt-3 text-xs text-muted">
                  Reach {milestoneProgress.nextTier.threshold} clients this year to unlock:{" "}
                  {milestoneProgress.nextTier.reward}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                You&apos;ve hit every milestone this year — keep the streak going!
              </p>
            )}

            <div className="mt-5 rounded-lg bg-brand-light p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-brand-dark">
                    Your live co-landing page
                  </p>
                  <p className="mt-1 break-all text-sm">{referralLink}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={referralQrCode}
                  alt="QR code linking to your co-landing page"
                  className="h-16 w-16 shrink-0 rounded border border-border bg-white p-1"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a
                  href={`https://${referralLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-dark hover:underline"
                >
                  View live page &#8599;
                </a>
                <CopyLinkButton value={`https://${referralLink}`} />
                <a
                  href={referralQrCode}
                  download={`${partner.slug}-qr-code.png`}
                  className="text-xs font-semibold text-brand-dark hover:underline"
                >
                  Download QR &#8595;
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
