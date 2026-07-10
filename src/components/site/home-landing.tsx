"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EarningsCalculator } from "@/components/site/earnings-calculator";

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

type ApplyForm = {
  name: string;
  firm: string;
  icai: string;
  email: string;
  phone: string;
};

export function HomeLanding() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [form, setForm] = useState<ApplyForm>({
    name: "",
    firm: "",
    icai: "",
    email: "",
    phone: "",
  });
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

  const openApply = () => {
    setApplyOpen(true);
    setSubmitted(false);
  };
  const closeApply = () => setApplyOpen(false);

  const submitApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center", position: "relative" }}>
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
          <p style={{ fontSize: "clamp(15.5px,3.6vw,18.5px)", lineHeight: 1.6, color: "rgba(27,23,20,0.68)", maxWidth: 640, margin: "0 auto 24px" }}>
            OmniCard and Chartered Accountants both exist to protect the financial health of Indian businesses. As
            Advisory Partners, we bring that mission to life together — you open the door, OmniCard&apos;s Business
            Fintech OS closes every leakage on the other side.
          </p>
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
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={openApply}
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
            </button>
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
        </div>

        {/* stats */}
        <div
          style={{
            maxWidth: 980,
            margin: "clamp(48px,9vw,72px) auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))",
            borderTop: "1px solid rgba(27,23,20,0.1)",
          }}
        >
          {STATS.map((stat, i) => (
            <div
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
            </div>
          ))}
        </div>
      </section>

      {/* THE MISSION */}
      <section id="mission" style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,10vw,104px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E8695F", marginBottom: 16 }}>
            Why this is a shared mission
          </div>
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
      </section>

      {/* THE VALUE */}
      <section id="why" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ maxWidth: 660, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D6362B", marginBottom: 14 }}>
            What every client gains
          </div>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
            A Business Fintech OS built to stop leakage before it happens
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))",
            gap: 1,
            background: "rgba(27,23,20,0.1)",
            border: "1px solid rgba(27,23,20,0.1)",
          }}
        >
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ background: "#FAF9F7", padding: "34px 30px" }}>
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
            </div>
          ))}
        </div>
      </section>

      {/* EARNINGS CALCULATOR (added) */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <EarningsCalculator />
        </div>
      </section>

      {/* PRODUCT IN ACTION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,10vw,104px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 640, margin: "0 auto clamp(36px,7vw,56px)", textAlign: "center" }}>
            <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D6362B", marginBottom: 14 }}>
              Built for easy execution
            </div>
            <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(24px,5vw,36px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
              The Business Fintech OS your clients will actually use
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 32, alignItems: "center" }}>
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(23,19,16,0.14)", lineHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marketing/dashboard-screenshot.png"
                alt="OmniCard dashboard — petty cash, approvals and spend analytics in one screen"
                style={{ width: "100%", display: "block" }}
              />
            </div>
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(23,19,16,0.14)", lineHeight: 0, maxWidth: 280, margin: "0 auto" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marketing/qr-payment-screen.png" alt="OmniCard QR payment screen" style={{ width: "100%", display: "block" }} />
            </div>
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
        <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D6362B", marginBottom: 14 }}>
          Our proud collaborations
        </div>
        <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(22px,4.6vw,30px)", fontWeight: 600, margin: "0 0 36px", letterSpacing: "-0.01em", color: "#171310" }}>
          Firms already advancing this mission with us
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 14 }}>
          {CLIENT_LOGOS.map((logo) => (
            <div
              key={logo.alt}
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
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: "rgba(27,23,20,0.5)", marginTop: 20 }}>&amp; many more</div>
      </section>

      {/* RECOGNITION */}
      <section style={{ background: "#F1EEE8", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D6362B", marginBottom: 16 }}>
            For advisory partners
          </div>
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
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "clamp(60px,10vw,110px) clamp(20px,5vw,32px)", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, margin: "0 auto clamp(40px,8vw,64px)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(11px,2.6vw,13px)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D6362B", marginBottom: 14 }}>
            How the partnership works
          </div>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,38px)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em", color: "#171310" }}>
            Three steps. You only own step one.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{ background: "#F1EEE8", border: "1px solid rgba(27,23,20,0.1)", borderRadius: 8, padding: "34px 28px" }}>
              <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 30, fontWeight: 600, color: "#D6362B", marginBottom: 18 }}>
                {step.n}
              </div>
              <div style={{ fontWeight: 600, fontSize: 18.5, marginBottom: 10, color: "#171310" }}>{step.title}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(27,23,20,0.65)" }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: "#171310", color: "#FAF9F7", padding: "clamp(56px,9vw,100px) clamp(20px,5vw,32px)", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: "clamp(26px,5.6vw,36px)", fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            OmniCard and Chartered Accountants, together for healthier Indian businesses
          </h2>
          <p style={{ fontSize: "clamp(15px,3.2vw,16.5px)", color: "rgba(250,249,247,0.68)", lineHeight: 1.6, margin: "0 0 32px" }}>
            Join a growing network of firms turning trusted advisory relationships into stronger, leak-free client
            businesses.
          </p>
          <button
            onClick={openApply}
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
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ padding: 32, textAlign: "center", background: "#FAF9F7" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/omnicard-logo.png" alt="OmniCard" style={{ height: 18, width: "auto", opacity: 0.7, marginBottom: 10 }} />
        <div style={{ fontSize: 13, color: "rgba(27,23,20,0.45)" }}>
          OmniCard &middot; Eroute Technologies Pvt. Ltd. &middot; businesspayments.ai &middot;{" "}
          <a href="mailto:partnerships@omnicard.in" style={{ color: "rgba(27,23,20,0.45)", textDecoration: "underline" }}>
            partnerships@omnicard.in
          </a>
          {" "}&middot;{" "}
          <Link href="/login" style={{ color: "rgba(27,23,20,0.45)", textDecoration: "underline" }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* APPLY MODAL */}
      {applyOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,19,16,0.55)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={closeApply}
        >
          <div
            style={{
              background: "#FAF9F7",
              borderRadius: 8,
              maxWidth: 480,
              width: "100%",
              padding: "clamp(24px,6vw,40px)",
              position: "relative",
              maxHeight: "88vh",
              overflowY: "auto",
              animation: "fadeUp 0.25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeApply}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "rgba(27,23,20,0.5)",
                fontFamily: "inherit",
              }}
            >
              &#10005;
            </button>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(214,54,43,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 22px",
                    fontSize: 24,
                    color: "#D6362B",
                  }}
                >
                  &#10003;
                </div>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 22, fontWeight: 600, marginBottom: 10, color: "#171310" }}>
                  You&apos;re in
                </div>
                <div style={{ fontSize: 15, color: "rgba(27,23,20,0.65)", lineHeight: 1.6 }}>
                  Our partnerships team will reach out to schedule a call and walk through your first client
                  introduction.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 22, fontWeight: 600, marginBottom: 6, color: "#171310" }}>
                  Join the Initiative
                </div>
                <div style={{ fontSize: 14, color: "rgba(27,23,20,0.6)", marginBottom: 26 }}>Takes under two minutes.</div>
                <form onSubmit={submitApply} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#171310" }}>Full name</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#171310" }}>Firm name</label>
                    <input
                      required
                      type="text"
                      value={form.firm}
                      onChange={(e) => setForm((s) => ({ ...s, firm: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#171310" }}>
                      ICAI membership number
                    </label>
                    <input
                      required
                      type="text"
                      value={form.icai}
                      onChange={(e) => setForm((s) => ({ ...s, icai: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#171310" }}>Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#171310" }}>Phone</label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      marginTop: 10,
                      background: "#171310",
                      color: "#FAF9F7",
                      border: "none",
                      padding: 15,
                      borderRadius: 4,
                      fontWeight: 600,
                      fontSize: 15.5,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Submit application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid rgba(27,23,20,0.2)",
  borderRadius: 4,
  fontSize: 14.5,
  fontFamily: "inherit",
  background: "#fff",
};
