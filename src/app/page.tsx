import Link from "next/link";
import { SiteNavbar } from "@/components/site/navbar";
import { EarningsCalculator } from "@/components/site/earnings-calculator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROGRAM_STATS, FLOW_STEPS, PROOF_BRANDS } from "@/lib/plan-content";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNavbar />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-brand-light to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            CA Partner Network &middot; 0 to 500 Partners in 12 Months
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            &ldquo;The CA Introduces. <span className="text-brand">OmniCard</span>{" "}
            Does Everything Else.&rdquo;
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            One program. Ten steps. Every asset co-branded, every campaign
            done-for-you, every lead closed by OmniCard, every milestone
            rewarded.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Become a Certified Advisor</Button>
            </Link>
            <Link href="#calculator">
              <Button variant="outline" size="lg">
                Calculate my earnings
              </Button>
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-5">
            {PROGRAM_STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">How the program works</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The entire program in 12 sequential steps, from awareness to payout
          and beyond. Your only actions: attend one demo, sign, share the
          link, and approve campaigns — everything else is OmniCard.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FLOW_STEPS.map((s) => (
            <Card key={s.step} className="flex items-start gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-medium">{s.what}</p>
                <p className="mt-0.5 text-xs text-muted">Owner: {s.who}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="border-y border-border bg-brand-light/40">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EarningsCalculator />
        </div>
      </section>

      {/* Milestones teaser */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Milestone rewards, every quarter</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-t-4 border-t-silver p-5">
            <p className="text-xs font-semibold uppercase text-silver">
              Silver Advisor
            </p>
            <p className="mt-1 text-lg font-semibold">5 clients / quarter</p>
            <p className="mt-1 text-sm text-muted">
              Premium gift hamper + Rs 5,000 voucher, priority webinar slot
            </p>
          </Card>
          <Card className="border-t-4 border-t-gold p-5">
            <p className="text-xs font-semibold uppercase text-gold">
              Gold Advisor
            </p>
            <p className="mt-1 text-lg font-semibold">10 clients / quarter</p>
            <p className="mt-1 text-sm text-muted">
              CEO-signed certificate, premium gadget + Rs 15,000 voucher
            </p>
          </Card>
          <Card className="border-t-4 border-t-platinum p-5">
            <p className="text-xs font-semibold uppercase text-platinum">
              Platinum Advisor
            </p>
            <p className="mt-1 text-lg font-semibold">50 clients / quarter</p>
            <p className="mt-1 text-sm text-muted">
              International trip / MacBook + advisory council seat
            </p>
          </Card>
        </div>
      </section>

      {/* Proof */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">
            Proof — Indian brands that scaled this way
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            The CA/advisor channel is a proven, at-scale growth strategy in
            India. OmniCard isn&apos;t inventing the channel — it&apos;s
            upgrading it.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PROOF_BRANDS.map((b) => (
              <Card key={b.brand} className="p-5">
                <p className="font-semibold">{b.brand}</p>
                <p className="mt-1 text-sm text-muted">{b.strategy}</p>
                <p className="mt-2 text-sm font-medium text-brand-dark">
                  {b.scale}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        OmniCard — India&apos;s Business Fintech OS &middot;{" "}
        <Link href="/directory" className="text-brand hover:underline">
          Advisor Directory
        </Link>
      </footer>
    </div>
  );
}
