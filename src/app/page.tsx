import Link from "next/link";
import { LandingHeader } from "@/components/site/landing-header";
import { EarningsCalculator } from "@/components/site/earnings-calculator";
import { PROGRAM_STATS, FLOW_STEPS, PROOF_BRANDS } from "@/lib/plan-content";

const BENEFITS = [
  {
    title: "Zero investment, zero liability",
    desc: "There's no cost, no risk and no operational burden in introducing OmniCard to a client. You make the introduction — OmniCard runs everything after.",
  },
  {
    title: "Every asset, co-branded",
    desc: "Landing page, QR code, explainer video, decks, WhatsApp packs — all generated in your firm's name within 48 hours of certification.",
  },
  {
    title: "Campaigns you just approve",
    desc: "OmniCard drafts every email, WhatsApp nudge and newsletter to your client base. You approve in one click; nothing goes out without your sign-off.",
  },
  {
    title: "Earnings tied to lifetime value",
    desc: "15% in Year 1, then 5% every year a client stays active — auto-credited to your OmniCard wallet the moment they go live.",
  },
  {
    title: "Recognition that compounds",
    desc: "Silver, Gold and Platinum milestones, city leaderboards, and a referral flywheel that rewards you for bringing in the next CA too.",
  },
  {
    title: "A live tracker, always on",
    desc: "Every share, click, QR scan and campaign is attributed to you end-to-end — see leads, pipeline, earnings and rank in one dashboard.",
  },
];

const STEPS_3 = [
  {
    n: "01",
    title: "Introduce",
    desc: "Attend one product demo, sign the advisory MSA, and share your personal link or QR with clients you trust.",
  },
  {
    n: "02",
    title: "OmniCard runs everything",
    desc: "Demos, onboarding, KYC, campaigns and client support — fully handled by OmniCard, end to end. You approve, you don't execute.",
  },
  {
    n: "03",
    title: "Earn, together",
    desc: "Your clients' finances get healthier, your advisory relationship deepens, and your firm is rewarded automatically — for the life of the client.",
  },
];

export default function Home() {
  return (
    <div
      className="flex flex-1 flex-col bg-[#FAF9F7] text-[#1B1714]"
      style={{ fontFamily: "var(--font-plex-sans)" }}
    >
      <LandingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FAF9F7] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-[840px] text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D6362B]/40 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#D6362B]">
            OmniCard &times; Chartered Accountants
          </div>
          <h1
            className="mx-auto max-w-3xl text-[32px] font-semibold leading-[1.16] tracking-tight text-[#171310] sm:text-[48px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            &ldquo;The CA introduces. OmniCard does everything else.&rdquo;
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#1B1714]/68 sm:text-[18px]">
            One program, ten steps, fully done-for-you. Every asset
            co-branded, every campaign drafted for your approval, every lead
            closed by OmniCard — every milestone rewarded.
          </p>
          <div className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-[#1B1714]/45">
            For Chartered Accountancy Firms &nbsp;&middot;&nbsp; A Shared Finance Mission
            &nbsp;&middot;&nbsp; Zero Investment, Zero Liability
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-[4px] bg-[#D6362B] px-8 py-4 text-[16px] font-semibold text-[#FAF9F7] hover:bg-[#B22C22]"
            >
              Join the Initiative
            </Link>
            <Link
              href="#calculator"
              className="rounded-[4px] border border-[#1B1714]/25 px-8 py-4 text-[16px] font-semibold text-[#171310] hover:bg-[#1B1714]/5"
            >
              Calculate my earnings
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 border-t border-[#1B1714]/10 sm:grid-cols-5">
          {PROGRAM_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-3 pt-6 text-center ${
                i < PROGRAM_STATS.length - 1 ? "sm:border-r sm:border-[#1B1714]/10" : ""
              }`}
            >
              <p
                className="text-[22px] font-semibold text-[#D6362B] sm:text-[27px]"
                style={{ fontFamily: "var(--font-plex-serif)" }}
              >
                {s.value}
              </p>
              <p className="mt-1.5 text-[12px] text-[#1B1714]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="bg-[#171310] px-5 py-16 text-[#FAF9F7] sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="mb-4 text-[12px] font-bold uppercase tracking-wide text-[#E8695F]">
            Why this is a shared mission
          </div>
          <h2
            className="text-[24px] font-semibold leading-tight sm:text-[34px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            Two professions serving the same purpose — finally working as one
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-relaxed text-[#FAF9F7]/72 sm:text-[17px]">
            Chartered Accountants sit closest to a business&apos;s financial
            truth. OmniCard is built to act on that truth in real time — for
            every rupee that moves through a company. Neither of us can close
            the loop alone.
          </p>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-relaxed text-[#FAF9F7]/72 sm:text-[17px]">
            As Advisory Partners, we make financial discipline the default
            for Indian businesses — not the exception. That&apos;s the
            initiative we&apos;re inviting your firm into.
          </p>
        </div>
      </section>

      {/* VALUE */}
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto mb-12 max-w-[660px] text-center sm:mb-16">
          <div className="mb-3.5 text-[12px] font-bold uppercase tracking-wide text-[#D6362B]">
            What every advisor gains
          </div>
          <h2
            className="text-[26px] font-semibold text-[#171310] sm:text-[36px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            A referral channel built to stop effort before it starts
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px border border-[#1B1714]/10 bg-[#1B1714]/10 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-[#FAF9F7] p-8">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#D6362B]/8">
                <div className="h-2 w-2 rounded-full bg-[#D6362B]" />
              </div>
              <p
                className="mb-2.5 text-[17.5px] font-semibold text-[#171310]"
                style={{ fontFamily: "var(--font-plex-serif)" }}
              >
                {b.title}
              </p>
              <p className="text-[15px] leading-relaxed text-[#1B1714]/65">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="bg-[#F1EEE8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[760px]">
          <EarningsCalculator />
        </div>
      </section>

      {/* MILESTONES */}
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto mb-12 max-w-[660px] text-center">
          <div className="mb-3.5 text-[12px] font-bold uppercase tracking-wide text-[#D6362B]">
            Recognised for the difference you make
          </div>
          <h2
            className="text-[26px] font-semibold text-[#171310] sm:text-[36px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            Milestone rewards, every quarter
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1B1714]/10 border-t-4 border-t-[#94a3b8] bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
              Silver Advisor
            </p>
            <p
              className="mt-2 text-[19px] font-semibold text-[#171310]"
              style={{ fontFamily: "var(--font-plex-serif)" }}
            >
              5 clients / quarter
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#1B1714]/60">
              Premium gift hamper + Rs 5,000 voucher, priority webinar slot
            </p>
          </div>
          <div className="rounded-xl border border-[#1B1714]/10 border-t-4 border-t-[#D4A017] bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#D4A017]">
              Gold Advisor
            </p>
            <p
              className="mt-2 text-[19px] font-semibold text-[#171310]"
              style={{ fontFamily: "var(--font-plex-serif)" }}
            >
              10 clients / quarter
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#1B1714]/60">
              CEO-signed certificate, premium gadget + Rs 15,000 voucher
            </p>
          </div>
          <div className="rounded-xl border border-[#1B1714]/10 border-t-4 border-t-[#D6362B] bg-white p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#D6362B]">
              Platinum Advisor
            </p>
            <p
              className="mt-2 text-[19px] font-semibold text-[#171310]"
              style={{ fontFamily: "var(--font-plex-serif)" }}
            >
              50 clients / quarter
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#1B1714]/60">
              International trip / MacBook + advisory council seat
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#F1EEE8] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1000px]">
          <div className="mx-auto mb-12 max-w-[640px] text-center sm:mb-16">
            <div className="mb-3.5 text-[12px] font-bold uppercase tracking-wide text-[#D6362B]">
              How the partnership works
            </div>
            <h2
              className="text-[26px] font-semibold text-[#171310] sm:text-[36px]"
              style={{ fontFamily: "var(--font-plex-serif)" }}
            >
              Three steps. You only own step one.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS_3.map((s) => (
              <div
                key={s.n}
                className="rounded-lg border border-[#1B1714]/10 bg-[#FAF9F7] p-8"
              >
                <p
                  className="mb-4 text-[30px] font-semibold text-[#D6362B]"
                  style={{ fontFamily: "var(--font-plex-serif)" }}
                >
                  {s.n}
                </p>
                <p className="mb-2.5 text-[18.5px] font-semibold text-[#171310]">
                  {s.title}
                </p>
                <p className="text-[15px] leading-relaxed text-[#1B1714]/65">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="mb-5 text-center text-[13px] font-semibold uppercase tracking-wide text-[#1B1714]/45">
              The full playbook, mapped step by step
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FLOW_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="flex items-start gap-3 rounded-lg border border-[#1B1714]/10 bg-[#FAF9F7] p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D6362B] text-[12px] font-semibold text-white">
                    {s.step}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium text-[#171310]">
                      {s.what}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[#1B1714]/50">
                      Owner: {s.who}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto mb-10 max-w-[660px] text-center">
          <div className="mb-3.5 text-[12px] font-bold uppercase tracking-wide text-[#D6362B]">
            Our proud collaborations
          </div>
          <h2
            className="text-[24px] font-semibold text-[#171310] sm:text-[30px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            Indian brands that scaled through this exact strategy
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#1B1714]/60">
            OmniCard isn&apos;t inventing the advisor channel — it&apos;s
            upgrading it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROOF_BRANDS.map((b) => (
            <div
              key={b.brand}
              className="rounded-xl border border-[#1B1714]/10 bg-white p-6"
            >
              <p className="font-semibold text-[#171310]">{b.brand}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#1B1714]/60">
                {b.strategy}
              </p>
              <p className="mt-2.5 text-[14px] font-semibold text-[#D6362B]">
                {b.scale}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#171310] px-5 py-16 text-center text-[#FAF9F7] sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[600px]">
          <h2
            className="text-[26px] font-semibold leading-tight sm:text-[36px]"
            style={{ fontFamily: "var(--font-plex-serif)" }}
          >
            OmniCard and Chartered Accountants, together for healthier Indian
            businesses
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-[#FAF9F7]/68 sm:text-[16.5px]">
            Join a growing network of firms turning trusted advisory
            relationships into stronger, leak-free client businesses.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-[4px] bg-[#D6362B] px-9 py-4 text-[16px] font-semibold text-[#FAF9F7] hover:bg-[#B22C22]"
          >
            Join the Initiative
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FAF9F7] py-8 text-center">
        <p
          className="text-[15px] font-semibold text-[#171310]"
          style={{ fontFamily: "var(--font-plex-serif)" }}
        >
          OmniCard <span className="text-[#D6362B]">Advisor</span>
        </p>
        <p className="mt-2 text-[13px] text-[#1B1714]/45">
          OmniCard &middot; India&apos;s Business Fintech OS &middot;{" "}
          <Link href="/directory" className="text-[#D6362B] hover:underline">
            Advisor Directory
          </Link>{" "}
          &middot;{" "}
          <Link href="/login" className="text-[#D6362B] hover:underline">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
}
