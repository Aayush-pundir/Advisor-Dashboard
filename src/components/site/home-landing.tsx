"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { EarningsCalculator } from "@/components/site/earnings-calculator";
import { MouModal } from "@/components/site/mou-modal";
import { IndiaMap } from "@/components/site/india-map";
import { Reveal, RevealGroup, RevealItem, TiltCard, GradientBlend } from "@/components/site/motion";

// A distinct, editorial font pairing for the marketing site only — kept
// separate from the IBM Plex used across the app's dashboards.
const displayFont = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["normal"] });
const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const DISPLAY = displayFont.style.fontFamily;
const BODY = bodyFont.style.fontFamily;

const CLIENT_LOGOS = [
  { src: "/marketing/logo-cfocentre.png", alt: "The CFO Centre" },
  { src: "/marketing/logo-dna.png", alt: "DNA" },
  { src: "/marketing/logo-aaron.png", alt: "Aaron — Aspire to Grow" },
  { src: "/marketing/logo-beb.png", alt: "BEB — Behind Every Business" },
  { src: "/marketing/logo-ags.png", alt: "Aggarwal Goyal Singh & Co., Chartered Accountants" },
  { src: "/marketing/logo-finpracto.png", alt: "FinPracto" },
  { src: "/marketing/logo-arar.png", alt: "Arar & Associates" },
  { src: "/marketing/logo-dbc.png", alt: "DBC" },
];

const STATS = [
  { value: "₹3,400 Cr+", label: "Payments processed" },
  { value: "1,000+", label: "Enterprise clients" },
  { value: "700+", label: "Cities served" },
  { value: "RBI licensed", label: "PPI issuer" },
];

const BENEFITS = [
  {
    title: "Clean books, by design",
    desc: "Every rupee of client spend is digital, categorised and GST-tagged at source — month-end closes without shoeboxes of bills.",
  },
  {
    title: "Reconciliation, automated",
    desc: "Real-time ledgers, maker-checker approvals and export-ready statements cut audit and bookkeeping effort dramatically.",
  },
  {
    title: "Audit trail you can trust",
    desc: "A licensed platform with full transaction trails, policy controls and role-based access — defensible in any audit.",
  },
  {
    title: "Kills cash leakage",
    desc: "Petty cash, advances and unvouched spends move to controlled prepaid cards, closing the gaps that quietly drain a business.",
  },
  {
    title: "Deeper advisory relationship",
    desc: "You move from compliance vendor to spend-governance advisor — a board-level conversation, not a filing deadline.",
  },
  {
    title: "Zero effort after intro",
    desc: "OmniCard’s team handles demos, onboarding, KYC and support — so the value reaches your client without adding to your workload.",
  },
];

const PILLARS = ["No investment required", "No liability, ever", "Rewards grow with your clients"];

const STEPS = [
  {
    n: "01",
    title: "Introduce",
    desc: "Make a warm introduction between a client you trust and a platform built for their financial discipline.",
  },
  {
    n: "02",
    title: "We onboard & operate",
    desc: "Demo, onboarding, KYC, card issuance and ongoing account management — fully handled by OmniCard, end to end.",
  },
  {
    n: "03",
    title: "Grow, together",
    desc: "Your client’s finances get healthier, your advisory relationship deepens, and your firm is recognised for the difference — automatically, without any added admin.",
  },
];

// From the CA Event Flyer — the problem/solution puzzle infographic
const PROBLEM_SOLUTION = [
  { problem: "Revenue ceiling beyond core practice", solution: "Opens a new advisory revenue stream" },
  { problem: "Clients asking for finance ops advisory", solution: "Lets the firm offer a modern business solution" },
  { problem: "Undifferentiated in a crowded CA market", solution: "Become the go-to digital finance advisor in your city" },
  { problem: "No bandwidth to build new practice verticals", solution: "Platform, compliance, tech — all handled by OmniCard" },
  { problem: "Client onboarding is time-intensive", solution: "OmniCard team runs demos, onboarding, and support" },
  { problem: "Fear of compliance and operational complexity", solution: "The partner does not carry the compliance burden" },
  { problem: "Practice revenue is transactional, not recurring", solution: "Bill structured professional retainer for ongoing managed advisory" },
  { problem: "Clients need real-time finance operations", solution: "Deliver dashboards, spend controls, and MIS your clients need today" },
];

// What clients are living with today, before an Advisory Partner brings OmniCard in
const CLIENT_STRUGGLES = [
  "Petty cash, advances and vendor payments leak silently, with no audit trail until it's too late",
  "Month-end reconciliation eats days the finance team could spend on the business, not on chasing receipts",
  "Multiple branches or teams mean one blind spot — no real-time view of where money is actually going",
  "Clients are asking for more than tax filing and compliance, and there's nothing modern to offer them yet",
  "Every audit becomes a fire drill of paper trails, manual approvals and after-the-fact explanations",
];

// From the CA Event Brochure — "What Advisors Can Offer"
const ADVISOR_OFFERS = [
  "Corporate Expense Digitisation Advisory",
  "OmniCard Program Design & Rollout",
  "Spend Policy Architecture",
  "ERP & Accounting Integration Support",
  "Multi-Level Spend Governance",
  "Vendor Payment Audit & Control",
  "Real-Time MIS & Analytics Setup",
  "Client Training & Change Enablement",
];

// From the brochure's execution highlights
const EXECUTION_HIGHLIGHTS = [
  "Works across all client industries and sizes",
  "Add measurable value beyond tax & compliance",
  "Dedicated advisory success manager assigned",
  "No investment — bill professional fees for advisory rendered",
  "Limited empanelment slots per region",
  "Access OmniCard's enterprise client ecosystem",
];

// Credibility strip — flyer footer
const CREDENTIALS = [
  "RBI PPI Licensed",
  "ISO 27001 Certified",
  "SOC 2 Type II",
  "Advisory Board: ex-RBI Dy. Governor · ex-NPCI · ex-SBI Chairman",
];

const FAQS = [
  {
    q: "Is there any cost or investment required to become an Advisory Partner?",
    a: "None. There's no fee to join, no minimum commitment, and no liability on your firm at any point — you make the introduction, OmniCard runs everything else.",
  },
  {
    q: "How much can I earn per client I refer?",
    a: "15% of the client's Year-1 contract value, plus 5% trailing every year they stay active on the platform — use the earnings calculator above to see it for your own client mix.",
  },
  {
    q: "What does onboarding and certification involve?",
    a: "A short demo session, after which your firm is certified as an Implementation Advisor and your full asset kit (landing page, QR code, WhatsApp pack, mini-deck) is delivered within 48 hours.",
  },
  {
    q: "What if I introduce a client another advisor is already talking to?",
    a: "Register the deal from your dashboard and it's protected under your attribution for 90 days — if another partner tries to register the same prospect, they're notified instead of silently overlapping.",
  },
  {
    q: "Do I need to handle onboarding, KYC, or client support myself?",
    a: "No — OmniCard's team runs the demo, onboarding, KYC, card issuance and ongoing support. Your role stops at the warm introduction; the account management is ours.",
  },
  {
    q: "How and when do I get paid?",
    a: "Commissions are credited automatically to your OmniCard wallet the moment a client closes, and every trailing renewal after that — visible in real time on your partner dashboard.",
  },
];

// What partner firms are actually earning — same 15% Year-1 + 5% trailing
// model as the earnings calculator above, applied to real firm profiles.
const CASE_STUDIES = [
  {
    profile: "4-partner tax & audit firm",
    city: "Pune",
    clients: "20 clients referred, Year 1",
    acv: "₹4L average contract value",
    earned: "₹12L Year-1 + building toward ₹70L+ lifetime",
  },
  {
    profile: "Boutique GST compliance practice",
    city: "Bengaluru",
    clients: "15 clients referred, Year 1",
    acv: "₹2.5L average contract value",
    earned: "₹5.6L Year-1 + building toward ₹33L+ lifetime",
  },
  {
    profile: "Mid-size CA firm, multi-partner",
    city: "Delhi NCR",
    clients: "25 clients referred, first 3 quarters",
    acv: "₹6L average contract value",
    earned: "₹22.5L Year-1 + building toward ₹1.3Cr+ lifetime",
  },
  {
    profile: "Mid-size CA firm, multi-partner",
    city: "Delhi NCR",
    clients: "5 clients referred, first 3 quarters",
    acv: "₹6L average contract value",
    earned: "₹4.5L Year-1 + building toward ₹26L+ lifetime",
  },
];

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "clamp(11px,2.6vw,13px)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#D6362B",
  marginBottom: 14,
};

export function HomeLanding({ stateCoverage = [] }: { stateCoverage?: { state: string; count: number }[] }) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoBound = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || videoBound.current) return;
    videoBound.current = true;
    el.muted = true;
    const reveal = () => setVideoReady(true);
    const tryPlay = () => {
      reveal();
      el.play().catch(() => {});
    };
    if (el.readyState >= 2) tryPlay();
    else el.addEventListener("loadeddata", tryPlay, { once: true });
    el.addEventListener("canplay", reveal, { once: true });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openApply = () => setApplyOpen(true);
  const closeApply = () => setApplyOpen(false);

  return (
    <div
      style={{
        fontFamily: BODY,
        color: "#1B1714",
        background: "#FAF9F7",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(250,249,247,0.95)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(27,23,20,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "14px clamp(16px,4vw,32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            rowGap: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/omnicard-logo.png" alt="OmniCard" style={{ height: 24, width: "auto", display: "block" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(12px,3vw,28px)",
              flexWrap: "wrap",
              overflowX: "auto",
            }}
          >
            <a href="#mission" style={{ color: "rgba(27,23,20,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              The mission
            </a>
            <a href="#why" style={{ color: "rgba(27,23,20,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              The value
            </a>
            <a href="#calculator" style={{ color: "rgba(27,23,20,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              Earnings calculator
            </a>
            <a href="#how-it-works" style={{ color: "rgba(27,23,20,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              How it works
            </a>
            <Link href="/login" style={{ color: "rgba(27,23,20,0.75)", textDecoration: "none", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>
              Sign in
            </Link>
            <button
              onClick={openApply}
              style={{
                background: "#D6362B",
                color: "#FAF9F7",
                border: "none",
                padding: "9px 16px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Join the Initiative
            </button>
          </div>
        </div>
      </div>

      {/* VIDEO INTRO */}
      <section style={{ background: "#171310", padding: "clamp(36px,7vw,56px) clamp(14px,4vw,20px) clamp(40px,8vw,64px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
          <div
            className="intro-video-frame"
            style={{
              borderRadius: "clamp(12px,3vw,20px)",
              overflow: "hidden",
              border: "1px solid rgba(250,249,247,0.14)",
              background: "#000",
              position: "relative",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/dashboard-screenshot.png"
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            />
            <video
              ref={videoRef}
              src="/marketing/intro-video.mp4"
              preload="auto"
              controls
              muted
              loop
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "contain",
                background: "#000",
                opacity: videoReady ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            />
          </div>
          <style jsx>{`
            .intro-video-frame {
              aspect-ratio: 16 / 9;
              max-height: 78vh;
            }
            @media (max-width: 640px) {
              .intro-video-frame {
                aspect-ratio: 3 / 4;
                max-height: 70vh;
              }
            }
          `}</style>
        </div>
      </section>

      {/* HERO */}
      <section style={{ background: "#FAF9F7", padding: "clamp(56px,10vw,96px) clamp(20px,5vw,32px) clamp(48px,9vw,76px)", position: "relative", overflow: "hidden" }}>
        <GradientBlend />
        <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid rgba(214,54,43,0.4)",
                color: "#D6362B",
                padding: "10px 22px",
                borderRadius: 100,
                fontSize: "clamp(16px,3.6vw,21px)",
                fontFamily: DISPLAY,
                fontWeight: 600,
                letterSpacing: "0.01em",
                marginBottom: 10,
              }}
            >
              Chartered Accountants &times; OmniCard
            </div>
          </Reveal>
          <Reveal delay={0.03}>
            <div
              style={{
                fontSize: "clamp(12px,2.6vw,14px)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(27,23,20,0.5)",
                marginBottom: 24,
              }}
            >
              India&apos;s Brightest Minds &times; India&apos;s Boldest Fintech
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(30px,6.5vw,50px)",
                lineHeight: 1.16,
                fontWeight: 600,
                margin: "0 0 20px",
                letterSpacing: "-0.01em",
                color: "#171310",
              }}
            >
              One mission: stronger, leak-free finances for every Indian business
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: "clamp(15.5px,3.6vw,18.5px)", lineHeight: 1.6, color: "rgba(27,23,20,0.68)", maxWidth: 640, margin: "0 auto 24px" }}>
              OmniCard and Chartered Accountants both exist to protect the financial health of Indian businesses. As
              Advisory Partners, we bring that mission to life together — you open the door, OmniCard&apos;s Business
              Fintech OS closes every leakage on the other side.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div
              style={{
                fontSize: "clamp(11px,2.4vw,13px)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(27,23,20,0.45)",
                marginBottom: 36,
              }}
            >
              For Chartered Accountancy Firms &nbsp;&middot;&nbsp; A Shared Finance Mission &nbsp;&middot;&nbsp; Zero
              Investment, Zero Liability
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                onClick={openApply}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "#D6362B",
                  color: "#FAF9F7",
                  border: "none",
                  padding: "16px 32px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Join the Initiative
              </motion.button>
              <a
                href="#mission"
                style={{
                  border: "1px solid rgba(27,23,20,0.25)",
                  color: "#171310",
                  padding: "16px 32px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                }}
              >
                Why this partnership exists
              </a>
            </div>
          </Reveal>
        </div>

        {/* stats */}
        <RevealGroup
          className="stats-grid"
          style={{
            maxWidth: 980,
            margin: "clamp(48px,9vw,72px) auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))",
            borderTop: "1px solid rgba(27,23,20,0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {STATS.map((stat, i) => (
            <RevealItem
              key={stat.label}
              style={{
                padding: "24px 12px 0",
                textAlign: "center",
                borderRight: i < STATS.length - 1 ? "1px solid rgba(27,23,20,0.1)" : undefined,
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontSize: "clamp(21px,4.5vw,27px)", fontWeight: 600, color: "#D6362B" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(27,23,20,0.6)", marginTop: 6 }}>{stat.label}</div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* credibility strip */}
        <Reveal delay={0.1}>
          <div
            style={{
              maxWidth: 980,
              margin: "28px auto 0",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px 22px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {CREDENTIALS.map((c) => (
              <span key={c} style={{ fontSize: 12, color: "rgba(27,23,20,0.5)", fontWeight: 500 }}>
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* THE MISSION */}
      <section id="mission" style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,10vw,104px) clamp(20px,5vw,32px)" }}>
        <Reveal>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <div style={{ ...sectionLabelStyle, color: "#E8695F" }}>Why this is a shared mission</div>
            <h2
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(24px,5.2vw,34px)",
                fontWeight: 600,
                margin: "0 0 22px",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Two professions serving the same purpose — finally working as one
            </h2>
            <p style={{ fontSize: "clamp(15px,3.2vw,17px)", lineHeight: 1.7, color: "rgba(250,249,247,0.72)", margin: "0 0 20px" }}>
              Chartered Accountants sit closest to a business&apos;s financial truth. OmniCard is built to act on that
              truth in real time — for every rupee that moves through a company. Neither of us can close the loop
              alone.
            </p>
            <p style={{ fontSize: "clamp(15px,3.2vw,17px)", lineHeight: 1.7, color: "rgba(250,249,247,0.72)", margin: 0 }}>
              Together, as Advisory Partners, we can make financial discipline the default for Indian businesses — not
              the exception. That&apos;s the initiative we&apos;re inviting your firm into.
            </p>
          </div>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ maxWidth: 640, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
            <div style={sectionLabelStyle}>How the partnership works</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
              Three steps. You only own step one.
            </h2>
          </div>
        </Reveal>
        <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <RevealItem key={step.n}>
              <TiltCard style={{ background: "#F1EEE8", border: "1px solid rgba(27,23,20,0.1)", borderRadius: 8, padding: "34px 28px", height: "100%" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: "#D6362B", marginBottom: 18 }}>
                  {step.n}
                </div>
                <div style={{ fontWeight: 600, fontSize: 18.5, marginBottom: 10, color: "#171310" }}>{step.title}</div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(27,23,20,0.65)" }}>{step.desc}</div>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* PROBLEM -> SOLUTION (from flyer) */}
      <section style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,10vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ ...sectionLabelStyle, color: "#E8695F" }}>Expand your practice beyond compliance</div>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: "clamp(24px,5.2vw,34px)",
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Every practice constraint, solved
              </h2>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {PROBLEM_SOLUTION.map((row, i) => (
              <RevealItem key={i}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 0",
                    borderBottom: i < PROBLEM_SOLUTION.length - 1 ? "1px solid rgba(250,249,247,0.08)" : undefined,
                  }}
                >
                  <p style={{ fontSize: 14, color: "rgba(250,249,247,0.55)", margin: 0, textAlign: "right" }}>{row.problem}</p>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(214,54,43,0.15)",
                      border: "1px solid rgba(214,54,43,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#E8695F",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    &#8594;
                  </span>
                  <p style={{ fontSize: 14, color: "#FAF9F7", margin: 0, fontWeight: 500 }}>{row.solution}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* WHAT CLIENTS ARE STRUGGLING WITH */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={sectionLabelStyle}>The reality today</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5.2vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                What your clients are struggling with right now
              </h2>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CLIENT_STRUGGLES.map((s, i) => (
              <RevealItem key={i}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    background: "#FAF9F7",
                    border: "1px solid rgba(27,23,20,0.1)",
                    borderRadius: 10,
                    padding: "16px 20px",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(214,54,43,0.1)",
                      color: "#D6362B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    !
                  </span>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(27,23,20,0.75)" }}>{s}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* THE VALUE */}
      <section id="why" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <div style={{ maxWidth: 660, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
            <div style={sectionLabelStyle}>What every client gains</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
              A Business Fintech OS built to stop leakage before it happens
            </h2>
          </div>
        </Reveal>
        <RevealGroup
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
            gap: 1,
            background: "rgba(27,23,20,0.1)",
            border: "1px solid rgba(27,23,20,0.1)",
          }}
        >
          {BENEFITS.map((b) => (
            <RevealItem key={b.title}>
              <TiltCard style={{ background: "#FAF9F7", padding: "34px 30px", height: "100%" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: "rgba(214,54,43,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D6362B" }} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 17.5, marginBottom: 10, fontFamily: DISPLAY, color: "#171310" }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(27,23,20,0.65)" }}>{b.desc}</div>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* WHAT ADVISORS CAN OFFER (from brochure) */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={sectionLabelStyle}>Your advisory scope</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                What your firm can offer, from day one
              </h2>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
            {ADVISOR_OFFERS.map((offer) => (
              <RevealItem key={offer}>
                <TiltCard
                  style={{
                    background: "#FAF9F7",
                    border: "1px solid rgba(27,23,20,0.1)",
                    borderRadius: 10,
                    padding: "18px 20px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D6362B", flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 500, color: "#171310" }}>{offer}</span>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div
              style={{
                marginTop: 44,
                background: "#FFFFFF",
                border: "1px solid rgba(27,23,20,0.1)",
                borderRadius: 14,
                padding: "clamp(24px,5vw,34px)",
              }}
            >
              <div style={sectionLabelStyle}>Why should you partner</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: "#171310", marginBottom: 20, fontFamily: DISPLAY }}>
                Partner terms, at a glance
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
                  columnGap: 32,
                  rowGap: 18,
                }}
              >
                {EXECUTION_HIGHLIGHTS.map((h) => (
                  <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(214,54,43,0.1)",
                        color: "#D6362B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      &#10003;
                    </span>
                    <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "rgba(27,23,20,0.75)" }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <EarningsCalculator />
          </Reveal>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,96px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <div style={{ maxWidth: 640, margin: "0 auto clamp(36px,7vw,56px)", textAlign: "center" }}>
              <div style={sectionLabelStyle}>What this looks like in practice</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,36px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                Earning for our few advisors
              </h2>
              <p style={{ marginTop: 14, fontSize: 14.5, color: "rgba(27,23,20,0.6)" }}>
                Representative examples using the same commission model as the calculator above — actual earnings
                depend on your client mix and contract values. These are the earnings of few of the advisors working with us.
              </p>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20 }}>
            {CASE_STUDIES.map((c, i) => (
              <RevealItem key={`${c.profile}-${i}`}>
                <TiltCard
                  style={{
                    background: "#FAF9F7",
                    border: "1px solid rgba(27,23,20,0.1)",
                    borderRadius: 12,
                    padding: "28px 24px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#D6362B",
                      background: "rgba(214,54,43,0.08)",
                      borderRadius: 100,
                      padding: "4px 10px",
                      marginBottom: 14,
                    }}
                  >
                    Partner outcome
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16.5, color: "#171310", fontFamily: DISPLAY }}>
                    {c.profile}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(27,23,20,0.5)", marginBottom: 18 }}>{c.city}</div>
                  <div style={{ fontSize: 14, color: "rgba(27,23,20,0.65)", marginBottom: 6 }}>{c.clients}</div>
                  <div style={{ fontSize: 14, color: "rgba(27,23,20,0.65)", marginBottom: 16 }}>{c.acv}</div>
                  <div style={{ borderTop: "1px solid rgba(27,23,20,0.1)", paddingTop: 16, fontSize: 15, fontWeight: 600, color: "#D6362B" }}>
                    {c.earned}
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* PRODUCT IN ACTION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,104px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal>
            <div style={{ maxWidth: 640, margin: "0 auto clamp(36px,7vw,56px)", textAlign: "center" }}>
              <div style={sectionLabelStyle}>Built for easy execution</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,36px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                The Business Fintech OS your clients will actually use
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 32 }}>
            <Reveal style={{ flex: "0 1 480px", maxWidth: 480 }}>
              <TiltCard
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(23,19,16,0.14)",
                  lineHeight: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/dashboard-screenshot.png"
                  alt="OmniCard dashboard — petty cash, approvals and spend analytics in one screen"
                  style={{ width: "100%", display: "block" }}
                />
              </TiltCard>
            </Reveal>
            <Reveal delay={0.1} style={{ flex: "0 1 220px", maxWidth: 220 }}>
              <TiltCard
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(23,19,16,0.14)",
                  lineHeight: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marketing/qr-payment-screen.png" alt="OmniCard QR payment screen" style={{ width: "100%", display: "block" }} />
              </TiltCard>
            </Reveal>
          </div>
          <div style={{ maxWidth: 980, margin: "clamp(32px,6vw,44px) auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 28, textAlign: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "#171310", marginBottom: 6 }}>100% digitisation</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(27,23,20,0.6)" }}>Every spend, instantly recorded and categorised</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "#171310", marginBottom: 6 }}>One-tap approvals</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(27,23,20,0.6)" }}>Expense reports and approvals in real time</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "#171310", marginBottom: 6 }}>Every branch, one view</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(27,23,20,0.6)" }}>UPI, card and online payments across locations</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15.5, color: "#171310", marginBottom: 6 }}>Seamless ERP integrations</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(27,23,20,0.6)" }}>Connects directly with Tally, Zoho Books and other systems clients already use</div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section style={{ padding: "clamp(56px,9vw,96px) clamp(20px,5vw,32px)", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <div style={sectionLabelStyle}>Our proud collaborations</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(22px,4.6vw,30px)", fontWeight: 600, margin: "0 0 36px", letterSpacing: "-0.01em", color: "#171310" }}>
            Firms already advancing this mission with us
          </h2>
        </Reveal>
        <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 18 }}>
          {CLIENT_LOGOS.map((logo) => (
            <RevealItem key={logo.alt}>
              <TiltCard
                style={{
                  background: "#FAF9F7",
                  border: "1px solid rgba(27,23,20,0.1)",
                  borderRadius: 12,
                  padding: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 108,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.alt} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#D6362B", marginTop: 24 }}>&hellip; and you&apos;re next.</div>
      </section>

      {/* COVERAGE MAP */}
      {stateCoverage.length > 0 && (
        <section style={{ padding: "clamp(56px,9vw,96px) clamp(20px,5vw,32px)", maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={sectionLabelStyle}>Growing every day</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                Where our Advisory Partners operate
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <IndiaMap stateCoverage={stateCoverage} />
          </Reveal>
        </section>
      )}

      {/* RECOGNITION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)" }}>
        <Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div style={sectionLabelStyle}>For advisory partners</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: "0 0 20px", letterSpacing: "-0.01em", color: "#171310" }}>
              Recognised for the difference you make
            </h2>
            <p style={{ fontSize: "clamp(15px,3.2vw,16.5px)", lineHeight: 1.75, color: "rgba(27,23,20,0.68)", margin: "0 0 28px" }}>
              There&apos;s no cost, no risk and no operational burden in introducing OmniCard to a client. As the
              businesses you bring in grow healthier and more disciplined on the platform, your firm is recognised and
              rewarded in step — quietly built into the partnership, never the reason for it.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {PILLARS.map((pillar) => (
                <div
                  key={pillar}
                  style={{
                    border: "1px solid rgba(27,23,20,0.15)",
                    borderRadius: 100,
                    padding: "10px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#171310",
                    background: "#FAF9F7",
                  }}
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={sectionLabelStyle}>Common questions</div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                Before you join, the answers you&apos;ll want
              </h2>
            </div>
          </Reveal>
          <RevealGroup style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <RevealItem key={item.q}>
                  <div
                    style={{
                      background: "#FAF9F7",
                      border: "1px solid rgba(27,23,20,0.1)",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "18px 22px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        fontSize: 15.5,
                        fontWeight: 600,
                        color: "#171310",
                      }}
                    >
                      {item.q}
                      <span
                        style={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1px solid rgba(27,23,20,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#D6362B",
                          fontSize: 14,
                          transform: open ? "rotate(45deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        +
                      </span>
                    </button>
                    {open && (
                      <div style={{ padding: "0 22px 20px", fontSize: 14.5, lineHeight: 1.65, color: "rgba(27,23,20,0.68)" }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,5.6vw,36px)", fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              OmniCard and Chartered Accountants, together for healthier Indian businesses
            </h2>
            <p style={{ fontSize: "clamp(15px,3.2vw,16.5px)", color: "rgba(250,249,247,0.68)", lineHeight: 1.6, margin: "0 0 32px" }}>
              Join a growing network of firms turning trusted advisory relationships into stronger, leak-free client
              businesses.
            </p>
            <motion.button
              onClick={openApply}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "#D6362B",
                color: "#FAF9F7",
                border: "none",
                padding: "17px 36px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Join the Initiative
            </motion.button>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <div style={{ padding: 32, textAlign: "center", background: "#FAF9F7" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/omnicard-logo.png" alt="OmniCard" style={{ height: 18, width: "auto", opacity: 0.7, marginBottom: 10 }} />
        <div style={{ fontSize: 13, color: "rgba(27,23,20,0.45)" }}>
          OmniCard &middot; Eroute Technologies Pvt. Ltd. &middot; businesspayments.ai
          <br />
          <a href="tel:7042704232" style={{ color: "rgba(27,23,20,0.45)", textDecoration: "underline" }}>
            7042704232
          </a>
          {" "}&middot;{" "}
          <a href="mailto:connect@omnicard.in" style={{ color: "rgba(27,23,20,0.45)", textDecoration: "underline" }}>
            connect@omnicard.in
          </a>
          {" "}&middot;{" "}
          <Link href="/login" style={{ color: "rgba(27,23,20,0.45)", textDecoration: "underline" }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* STICKY SCROLL CTA */}
      <AnimatePresence>
        {showStickyCta && !applyOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              background: "#171310",
              borderTop: "1px solid rgba(250,249,247,0.12)",
              boxShadow: "0 -12px 32px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                maxWidth: 1180,
                margin: "0 auto",
                padding: "14px clamp(16px,4vw,32px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#FAF9F7", fontSize: 14.5, fontWeight: 500 }}>
                Ready to become an Advisory Partner?
              </span>
              <button
                onClick={openApply}
                style={{
                  background: "#D6362B",
                  color: "#FAF9F7",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                Join the Initiative
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MouModal open={applyOpen} onClose={closeApply} />
    </div>
  );
}
