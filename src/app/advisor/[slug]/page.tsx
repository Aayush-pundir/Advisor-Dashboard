import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { captureLeadAction } from "@/app/actions/partner";
import { notFound } from "next/navigation";
import { Reveal, TiltCard, GradientBlend } from "@/components/site/motion";

const displayFont = Fraunces({ subsets: ["latin"], weight: ["500", "600"] });
const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const STATS = [
  { value: "RBI Licensed", label: "PPI issuer" },
  { value: "12L+", label: "Cards issued" },
  { value: "32L+", label: "Users on OmniCard" },
  { value: "1000+", label: "Businesses trust us" },
];

const BENEFITS = [
  {
    title: "Save a guaranteed 10% on costs",
    desc: "AI-powered automation catches wasteful and duplicate spend before it happens, not after the fact.",
  },
  {
    title: "Zero manual work",
    desc: "Policy-driven automation approves, flags and reconciles spend on its own — no more chasing receipts at month-end.",
  },
  {
    title: "Seamless integrations",
    desc: "Connects directly with SAP, Zoho and Tally, so your books stay in sync without any re-entry.",
  },
  {
    title: "Your CA stays in the loop",
    desc: "Every step stays visible to your advisor — this isn't a handoff, it's a relationship the two of you built together.",
  },
];

export default async function AdvisorMicrosite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = await db.partner.findUnique({ where: { slug } });
  if (!partner || (partner.stage !== "CERTIFIED" && partner.stage !== "ACTIVE")) {
    notFound();
  }

  return (
    <div style={{ fontFamily: bodyFont.style.fontFamily, color: "#1B1714", background: "#FAF9F7" }}>
      <div style={{ padding: "18px clamp(16px,4vw,32px)", borderBottom: "1px solid rgba(27,23,20,0.08)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/omnicard-logo.png" alt="OmniCard" style={{ height: 22, width: "auto" }} />
      </div>

      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,9vw,84px) clamp(20px,5vw,32px)" }}>
        <GradientBlend />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(214,54,43,0.4)",
                color: "#D6362B",
                padding: "7px 16px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Certified Implementation Advisor
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              style={{
                fontFamily: displayFont.style.fontFamily,
                fontSize: "clamp(28px,5.5vw,44px)",
                lineHeight: 1.16,
                fontWeight: 600,
                margin: "0 0 18px",
                letterSpacing: "-0.01em",
              }}
            >
              {`${partner.firmName} × OmniCard`}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: "clamp(15.5px,3.4vw,18px)", lineHeight: 1.6, color: "rgba(27,23,20,0.68)", maxWidth: 600, margin: "0 auto" }}>
              {`${partner.contactName} is a Certified OmniCard Implementation Advisor, helping businesses in ${partner.city} run on India's first AI-powered Business Fintech OS — a fully interoperable, RBI-licensed spend & payment ecosystem.`}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div
            style={{
              maxWidth: 720,
              margin: "clamp(36px,7vw,52px) auto 0",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))",
              borderTop: "1px solid rgba(27,23,20,0.1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: "20px 12px 0",
                  textAlign: "center",
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(27,23,20,0.1)" : undefined,
                }}
              >
                <div style={{ fontFamily: displayFont.style.fontFamily, fontSize: "clamp(17px,3.6vw,22px)", fontWeight: 600, color: "#D6362B" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(27,23,20,0.6)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,32px) clamp(56px,9vw,88px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 40 }}>
          <div>
            <h2 style={{ fontFamily: displayFont.style.fontFamily, fontSize: "clamp(20px,4vw,26px)", fontWeight: 600, margin: "0 0 20px" }}>
              Why businesses trust this recommendation
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {BENEFITS.map((b) => (
                <Reveal key={b.title}>
                  <TiltCard style={{ background: "#FFFFFF", border: "1px solid rgba(27,23,20,0.1)", borderRadius: 12, padding: "20px 22px" }}>
                    <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 6 }}>{b.title}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(27,23,20,0.65)" }}>{b.desc}</div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
            <Card className="p-6">
              <h3 className="font-semibold">Get your free spend-leakage audit</h3>
              <p className="mt-1 text-sm text-muted">
                Referred by {partner.contactName}, {partner.firmName}
              </p>
              <form action={captureLeadAction} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="partnerId" value={partner.id} />
                <input type="hidden" name="source" value="MICROSITE" />
                <input
                  name="businessName"
                  placeholder="Business name"
                  required
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  name="contactName"
                  placeholder="Your name"
                  required
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  required
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <Button type="submit">Request my audit</Button>
              </form>
            </Card>
          </Reveal>
        </div>
      </section>

      <div style={{ padding: 32, textAlign: "center", borderTop: "1px solid rgba(27,23,20,0.08)" }}>
        <div style={{ fontSize: 13, color: "rgba(27,23,20,0.45)" }}>
          OmniCard &middot; Eroute Technologies Pvt. Ltd. &middot; businesspayments.ai
        </div>
      </div>
    </div>
  );
}
