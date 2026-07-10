"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EarningsCalculator } from "@/components/site/earnings-calculator";
import { MouModal } from "@/components/site/mou-modal";
import { Reveal, RevealGroup, RevealItem, TiltCard, GradientBlend } from "@/components/site/motion";

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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "clamp(11px,2.6vw,13px)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#D6362B",
  marginBottom: 14,
};

export function HomeLanding() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
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

  const openApply = () => setApplyOpen(true);
  const closeApply = () => setApplyOpen(false);

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
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
            style={{
              fontSize: "clamp(11px,2.6vw,13px)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#E8695F",
              marginBottom: "clamp(16px,4vw,24px)",
            }}
          >
            India&apos;s First Business Fintech OS
          </div>
          <div
            style={{
              borderRadius: "clamp(12px,3vw,20px)",
              overflow: "hidden",
              border: "1px solid rgba(250,249,247,0.14)",
              background: "#000",
              position: "relative",
              aspectRatio: "16/9",
              width: "100%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/dashboard-screenshot.png"
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
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
                objectFit: "cover",
                background: "#000",
                opacity: videoReady ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            />
          </div>
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
                gap: 8,
                border: "1px solid rgba(214,54,43,0.4)",
                color: "#D6362B",
                padding: "7px 16px",
                borderRadius: 100,
                fontSize: "clamp(11px,2.6vw,13px)",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              OmniCard &times; Chartered Accountants
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1
              style={{
                fontFamily: "'IBM Plex Serif', serif",
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
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(21px,4.5vw,27px)", fontWeight: 600, color: "#D6362B" }}>
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
                fontFamily: "'IBM Plex Serif', serif",
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

      {/* PROBLEM -> SOLUTION (from flyer) */}
      <section style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,10vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ ...sectionLabelStyle, color: "#E8695F" }}>Expand your practice beyond compliance</div>
              <h2
                style={{
                  fontFamily: "'IBM Plex Serif', serif",
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

      {/* THE VALUE */}
      <section id="why" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <div style={{ maxWidth: 660, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
            <div style={sectionLabelStyle}>What every client gains</div>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
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
                <div style={{ fontWeight: 600, fontSize: 17.5, marginBottom: 10, fontFamily: "'IBM Plex Serif', serif", color: "#171310" }}>
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
              <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
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
                marginTop: 40,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
                gap: 12,
              }}
            >
              {EXECUTION_HIGHLIGHTS.map((h) => (
                <div
                  key={h}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: 13.5,
                    color: "rgba(27,23,20,0.7)",
                    background: "#FFFFFF",
                    border: "1px solid rgba(27,23,20,0.08)",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <span style={{ color: "#D6362B", fontWeight: 700 }}>&#10003;</span>
                  {h}
                </div>
              ))}
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

      {/* PRODUCT IN ACTION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,104px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal>
            <div style={{ maxWidth: 640, margin: "0 auto clamp(36px,7vw,56px)", textAlign: "center" }}>
              <div style={sectionLabelStyle}>Built for easy execution</div>
              <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(24px,5vw,36px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
                The Business Fintech OS your clients will actually use
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 32, alignItems: "center" }}>
            <Reveal>
              <TiltCard style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(23,19,16,0.14)", lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/dashboard-screenshot.png"
                  alt="OmniCard dashboard — petty cash, approvals and spend analytics in one screen"
                  style={{ width: "100%", display: "block" }}
                />
              </TiltCard>
            </Reveal>
            <Reveal delay={0.1}>
              <TiltCard
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 24px 60px rgba(23,19,16,0.14)",
                  lineHeight: 0,
                  maxWidth: 280,
                  margin: "0 auto",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marketing/qr-payment-screen.png" alt="OmniCard QR payment screen" style={{ width: "100%", display: "block" }} />
              </TiltCard>
            </Reveal>
          </div>
          <div style={{ maxWidth: 820, margin: "clamp(32px,6vw,44px) auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 28, textAlign: "center" }}>
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
          </div>
        </div>
      </section>

      {/* CLIENTS */}
      <section style={{ padding: "clamp(56px,9vw,96px) clamp(20px,5vw,32px)", maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <div style={sectionLabelStyle}>Our proud collaborations</div>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(22px,4.6vw,30px)", fontWeight: 600, margin: "0 0 36px", letterSpacing: "-0.01em", color: "#171310" }}>
            Firms already advancing this mission with us
          </h2>
        </Reveal>
        <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 14 }}>
          {CLIENT_LOGOS.map((logo) => (
            <RevealItem key={logo.alt}>
              <TiltCard
                style={{
                  background: "#FAF9F7",
                  border: "1px solid rgba(27,23,20,0.1)",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 68,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt={logo.alt} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
        <div style={{ fontSize: 14, color: "rgba(27,23,20,0.5)", marginTop: 20 }}>&amp; many more</div>
      </section>

      {/* RECOGNITION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)" }}>
        <Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div style={sectionLabelStyle}>For advisory partners</div>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(24px,5vw,34px)", fontWeight: 600, margin: "0 0 20px", letterSpacing: "-0.01em", color: "#171310" }}>
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

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ maxWidth: 640, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
            <div style={sectionLabelStyle}>How the partnership works</div>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
              Three steps. You only own step one.
            </h2>
          </div>
        </Reveal>
        <RevealGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <RevealItem key={step.n}>
              <TiltCard style={{ background: "#F1EEE8", border: "1px solid rgba(27,23,20,0.1)", borderRadius: 8, padding: "34px 28px", height: "100%" }}>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 30, fontWeight: 600, color: "#D6362B", marginBottom: 18 }}>
                  {step.n}
                </div>
                <div style={{ fontWeight: 600, fontSize: 18.5, marginBottom: 10, color: "#171310" }}>{step.title}</div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(27,23,20,0.65)" }}>{step.desc}</div>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,36px)", fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
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

      <MouModal open={applyOpen} onClose={closeApply} />
    </div>
  );
}
