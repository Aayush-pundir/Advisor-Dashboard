"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signMouAction } from "@/app/actions/partner";

type MouForm = {
  firmName: string;
  contactName: string;
  designation: string;
  icaiNumber: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  referralCode: string;
};

const EMPTY_FORM: MouForm = {
  firmName: "",
  contactName: "",
  designation: "",
  icaiNumber: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  referralCode: "",
};

const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function MouModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<MouForm>(EMPTY_FORM);
  const [signed, setSigned] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof MouForm>(key: K, value: string) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      const result = await signMouAction(fd);
      if (result.ok) {
        setSigned(true);
        setTempPassword(result.tempPassword ?? null);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSigned(false);
      setTempPassword(null);
      setError(null);
      setForm(EMPTY_FORM);
    }, 300);
  }

  const firmDisplay = form.firmName || "___________________";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,19,16,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FDFBF5",
              border: "2px solid #D4A017",
              borderRadius: 16,
              maxWidth: 620,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "clamp(24px,5vw,44px)",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "rgba(27,23,20,0.5)",
              }}
              aria-label="Close"
            >
              &#10005;
            </button>

            {signed ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(214,54,43,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 22px",
                    fontSize: 26,
                    color: "#D6362B",
                  }}
                >
                  &#10003;
                </div>
                <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 24, fontWeight: 600, marginBottom: 10, color: "#171310" }}>
                  Agreement signed
                </div>
                <div style={{ fontSize: 15, color: "rgba(27,23,20,0.65)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
                  Your Implementation Advisor Agreement has been recorded. Eroute&apos;s partnerships team will
                  countersign and reach out to schedule your certification demo — you can track every step of that
                  from your new advisor login below.
                </div>
                {tempPassword && (
                  <div
                    style={{
                      marginTop: 24,
                      maxWidth: 380,
                      marginLeft: "auto",
                      marginRight: "auto",
                      background: "rgba(212,160,23,0.08)",
                      border: "1px solid rgba(212,160,23,0.35)",
                      borderRadius: 8,
                      padding: 16,
                      textAlign: "left",
                    }}
                  >
                    <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#B22C22", margin: "0 0 8px" }}>
                      Your advisor login (no email provider configured — copy this now)
                    </p>
                    <p style={{ fontSize: 13.5, margin: "0 0 4px", color: "#171310" }}>
                      Email: <strong>{form.email}</strong>
                    </p>
                    <p style={{ fontSize: 13.5, margin: 0, color: "#171310" }}>
                      Temporary password: <strong style={{ fontFamily: "monospace" }}>{tempPassword}</strong>
                    </p>
                    <Link
                      href="/login"
                      style={{ display: "inline-block", marginTop: 12, fontSize: 13.5, fontWeight: 600, color: "#D6362B", textDecoration: "none" }}
                    >
                      Sign in to track your status &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/marketing/omnicard-logo.png"
                    alt="OmniCard"
                    style={{ height: 26, margin: "0 auto 22px", display: "block" }}
                  />
                  <h2
                    style={{
                      fontFamily: "'IBM Plex Serif', serif",
                      fontSize: "clamp(18px,4vw,24px)",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: "#171310",
                      margin: 0,
                    }}
                  >
                    IMPLEMENTATION ADVISOR AGREEMENT
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(27,23,20,0.55)", margin: "6px 0 0" }}>
                    Advisory Services &amp; Fee Agreement
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      margin: "18px 0",
                    }}
                  >
                    <span style={{ flex: 1, height: 1, background: "rgba(212,160,23,0.4)" }} />
                    <span style={{ width: 6, height: 6, background: "#D4A017", transform: "rotate(45deg)" }} />
                    <span style={{ flex: 1, height: 1, background: "rgba(212,160,23,0.4)" }} />
                  </div>
                </div>

                <p style={{ textAlign: "center", color: "#D6362B", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", margin: "0 0 6px" }}>
                  BETWEEN
                </p>
                <p style={{ textAlign: "center", fontWeight: 700, fontSize: 16, color: "#171310", margin: "0 0 14px", borderBottom: "1px solid rgba(27,23,20,0.3)", paddingBottom: 8, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
                  EROUTE TECHNOLOGIES PRIVATE LIMITED
                </p>
                <p style={{ textAlign: "center", color: "#D6362B", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", margin: "0 0 6px" }}>
                  AND
                </p>
                <div style={{ maxWidth: 340, margin: "0 auto 6px" }}>
                  <input
                    required
                    placeholder="Your firm's legal name"
                    value={form.firmName}
                    onChange={(e) => set("firmName", e.target.value)}
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#171310",
                      border: "none",
                      borderBottom: "1px solid rgba(27,23,20,0.5)",
                      background: "transparent",
                      padding: "0 0 8px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#1B1714", margin: "18px 0 12px" }}>
                  This Agreement is made between <strong>Eroute Technologies Private Limited</strong>, operating under
                  the registered brand name &ldquo;OmniCard&rdquo;, having its registered office at C 56 A/12, 8th Floor,
                  Technopolis IT Hub, Sector 62, Noida, Uttar Pradesh 201301 (&ldquo;Eroute&rdquo;), and{" "}
                  <strong>{firmDisplay}</strong>, an independent advisor / advisory firm (&ldquo;Advisor&rdquo;). Eroute
                  and the Advisor are together the &ldquo;Parties&rdquo;.
                </p>

                <ClauseHeading n={1} title="Background" />
                <ClauseBody>
                  Eroute is an RBI-licensed Prepaid Payment Instrument issuer operating OmniCard, India&apos;s Business
                  Fintech OS — covering centralised corporate funding, an expense management stack, Motion for
                  real-time location tracking, reimbursements, BBPS, corporate cards, a mobile application, fleet
                  management, and corporate FASTags. The Advisor is an independent professional or advisory firm who,
                  in the ordinary course of advising client businesses, is well placed to identify businesses that
                  would benefit from OmniCard. This Agreement sets out the terms on which the Advisor will render
                  advisory and implementation-support services to facilitate the adoption of OmniCard by such
                  businesses (&ldquo;Clients&rdquo;), in exchange for the Advisory Fees set out in Schedule A. This
                  engagement is non-exclusive; the Advisor is free to advise Clients on, or refer Clients to, other
                  platforms or service providers.
                </ClauseBody>

                <ClauseHeading n={2} title="Scope of Services" />
                <ClauseBody>
                  The Advisor&apos;s engagement under this Agreement consists of genuine advisory work, not a passive
                  referral. Specifically, the Advisor shall: assess whether OmniCard&apos;s Business Fintech OS is a
                  good fit for a given Client&apos;s spend and control needs, as part of the Advisor&apos;s ordinary
                  advisory work; advise the Client on the suitability and implementation approach for adopting the
                  platform; coordinate between the Client and Eroute&apos;s onboarding team to support a smooth
                  go-live; and remain available to the Client for basic queries during the first year of use. A
                  business already an active OmniCard client as of the date of the Advisor&apos;s introduction does
                  not qualify as a Client, and no Advisory Fee is payable in respect of such a business. Where more
                  than one Advisor introduces the same business, Advisory Fees are attributed to whichever Advisor
                  first formally registers that Client with Eroute; Eroute&apos;s onboarding records are final in case
                  of dispute. In return, Eroute shall provide each Client, at no separate cost, unlimited use of the
                  Business Fintech OS, product training, and support and ERP integration at the level set out for
                  that Client&apos;s segment in Schedule A. Customisations requested by a Client are scoped and
                  charged separately by Eroute; customisation, cross-sell, or up-sell revenue realised carries no
                  Advisory Fee. Eroute shall close all commercial terms directly with the Client, keeping the Advisor
                  in copy.
                </ClauseBody>

                <ClauseHeading n={3} title="Advisory Fees" />
                <ClauseBody>
                  In consideration of the services rendered under Clause 2, Eroute shall pay the Advisor Advisory Fees
                  calculated as set out in Schedule A. Advisory Fees are recurring — payable every year a Client
                  remains active and renews, not merely on first onboarding — and are payable within 45 days of
                  Eroute realising the corresponding revenue from the Client. Advisory Fees stated in Schedule A are
                  exclusive of GST; the Advisor shall charge GST separately in its invoice where registered to do so,
                  and Advisory Fees are otherwise subject to applicable taxes, including TDS. Eroute shall provide the
                  Advisor a quarterly statement showing Clients introduced, realised ACV, and Advisory Fees payable.
                  Where the Advisor has 10 or more Clients onboarded under this Agreement, Eroute shall additionally
                  provide the Advisor access to a dedicated online dashboard for real-time tracking of Client
                  onboarding and Advisory Fees, in lieu of the quarterly statement.
                </ClauseBody>

                <ClauseHeading n={4} title="Onboarding Integrity & Compliance" />
                <ClauseBody>
                  A Client counts toward the volume milestones in Schedule A only if it remains an Active Client for
                  at least 90 consecutive days. Eroute may claw back any Advisory Fee or milestone bonus already paid
                  on a Client later found to have been onboarded fraudulently, artificially, or without a genuine
                  business relationship. The Advisor shall not introduce any Client that the Advisor knows or
                  reasonably suspects to be engaged in unlawful activity, or that fails Eroute&apos;s KYC/AML checks.
                  Each Party shall handle any personal data encountered under this Agreement in compliance with the
                  Digital Personal Data Protection Act, 2023, and other applicable data protection law.
                </ClauseBody>

                <ClauseHeading n={5} title="Confidentiality & Data" />
                <ClauseBody>
                  Each Party shall keep confidential all non-public information of the other Party and its Clients,
                  and use it solely for the purposes of this Agreement. This obligation survives termination for one
                  year. The Advisor shall not store, replicate or share any Client data beyond what is necessary for
                  the services in Clause 2.
                </ClauseBody>

                <ClauseHeading n={6} title="Intellectual Property & Marketing" />
                <ClauseBody>
                  Eroute retains all right, title and interest in the Business Fintech OS and its trademarks. The
                  Advisor may reference its status as an OmniCard Implementation Advisor in its own marketing only
                  with Eroute&apos;s prior written consent, and Eroute may similarly reference the Advisor as an
                  Implementation Advisor in its own marketing. The Advisor consents to Eroute using the Advisor&apos;s
                  name and logo, and any testimonials or feedback provided by the Advisor or its Clients about
                  OmniCard, in Eroute&apos;s marketing and promotional materials, unless the Advisor withdraws such
                  consent in writing.
                </ClauseBody>

                <ClauseHeading n={7} title="Liability & Indemnity" />
                <ClauseBody>
                  Each Party shall indemnify the other against direct losses arising from its own breach of this
                  Agreement, fraud, gross negligence, or wilful misconduct. Neither Party shall be liable to the other
                  for indirect, consequential, or loss-of-revenue damages. Except in cases of fraud or wilful
                  misconduct, each Party&apos;s aggregate liability under this Agreement is capped at the Advisory
                  Fees paid or payable to the Advisor in the preceding 12 months. Nothing in this clause limits either
                  Party&apos;s liability for matters that cannot be limited under Applicable Law.
                </ClauseBody>

                <ClauseHeading n={8} title="Non-Solicitation & Assignment" />
                <ClauseBody>
                  For 6 months after termination of this Agreement, the Advisor shall not solicit or assist any
                  Client onboarded under this Agreement to migrate to a platform competing with OmniCard. The Advisor
                  may not assign, subcontract, or transfer its rights or obligations under this Agreement without
                  Eroute&apos;s prior written consent.
                </ClauseBody>

                <ClauseHeading n={9} title="Term & Termination" />
                <ClauseBody>
                  This Agreement runs for 12 months from the Effective Date and auto-renews annually unless either
                  Party gives 30 days&apos; written notice of non-renewal or termination. Either Party may terminate
                  immediately on written notice for material breach not cured within 30 days, insolvency, or a change
                  in Applicable Law that makes the arrangement unlawful. This Agreement also terminates immediately
                  and automatically if any professional licence or registration required for the Advisor to operate
                  is suspended, cancelled, or otherwise ceases to be valid. Notwithstanding termination for any
                  reason, Advisory Fees on Clients already onboarded and active as of the termination date shall
                  continue to be paid for as long as such Clients remain active with Eroute. Clauses 4, 5, 6, 7 and 8
                  survive termination.
                </ClauseBody>

                <ClauseHeading n={10} title="General" />
                <ClauseBody>
                  This Agreement does not create a partnership, joint venture, or employment relationship; both
                  Parties act as independent contractors. It is governed by the laws of India; disputes shall first
                  be discussed in good faith and, failing resolution within 30 days, referred to a sole arbitrator in
                  Noida under the Arbitration and Conciliation Act, 1996, subject to the exclusive jurisdiction of
                  courts at Gautam Buddh Nagar, Uttar Pradesh. Notices may be sent by email — to connect@omnicard.in
                  for Eroute, and to the Advisor&apos;s registered email on file. This Agreement is the entire
                  understanding between the Parties on this subject and may only be amended in writing signed by both
                  Parties.
                </ClauseBody>

                <div
                  style={{
                    border: "1px solid rgba(27,23,20,0.15)",
                    borderRadius: 8,
                    padding: 18,
                    margin: "22px 0 24px",
                    background: "rgba(27,23,20,0.02)",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#171310", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Schedule A — Advisory Fee Structure
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#1B1714", margin: "0 0 10px" }}>
                    Eroute shall pay the Advisor 15% of the Annual Contract Value (ACV) realised by Eroute from every
                    Client onboarded through the Advisor&apos;s advisory services in that Client&apos;s first active
                    year, and 5% of realised ACV every year thereafter for as long as the Client remains Active.
                  </p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#1B1714", margin: "0 0 14px" }}>
                    Customisations requested by a Client — including API/ERP integration — are scoped and charged
                    separately by Eroute and carry no Advisory Fee. Advisory Fees are payable within 45 days of Eroute
                    realising the corresponding revenue, exclusive of GST.
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(27,23,20,0.2)", textAlign: "left" }}>
                        <th style={{ padding: "6px 8px 6px 0", fontWeight: 700 }}>Component</th>
                        <th style={{ padding: "6px 8px" }}>Rate</th>
                        <th style={{ padding: "6px 0 6px 8px" }}>Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(27,23,20,0.1)" }}>
                        <td style={{ padding: "8px 8px 8px 0" }}>Year 1 Advisory Fee</td>
                        <td style={{ padding: 8 }}>15% flat</td>
                        <td style={{ padding: "8px 0 8px 8px" }}>On realised ACV of each Client in its first active year</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px 8px 8px 0" }}>Year 2+ Trailing Fee</td>
                        <td style={{ padding: 8 }}>5% flat</td>
                        <td style={{ padding: "8px 0 8px 8px" }}>
                          On realised ACV of each Client, every year from Year 2 onward, for as long as the Client
                          remains Active
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Registration details required to countersign */}
                <div
                  style={{
                    border: "1px solid rgba(212,160,23,0.35)",
                    borderRadius: 8,
                    padding: 18,
                    marginBottom: 26,
                    background: "rgba(212,160,23,0.05)",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#B22C22", margin: "0 0 12px" }}>
                    Required to countersign &amp; activate your account
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
                    <Field label="Your name" value={form.contactName} onChange={(v) => set("contactName", v)} required />
                    <Field label="Designation" value={form.designation} onChange={(v) => set("designation", v)} placeholder="e.g. Partner" required />
                    <Field label="Membership No." value={form.icaiNumber} onChange={(v) => set("icaiNumber", v)} />
                    <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
                    <Field label="Phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} required />
                    <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
                    <Field label="State" value={form.state} onChange={(v) => set("state", v)} required />
                    <Field label="Referral code (optional)" value={form.referralCode} onChange={(v) => set("referralCode", v)} placeholder="Referred by another CA?" />
                  </div>
                  <p style={{ marginTop: 10, fontSize: 12, color: "rgba(27,23,20,0.55)" }}>
                    Referred by another CA? Enter their code — you&apos;ll both get a surprise hamper on your first client activation.
                  </p>
                </div>

                {/* Signature blocks */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <p style={{ color: "#D6362B", fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>
                      For Eroute Technologies Pvt. Ltd.
                    </p>
                    <SigLine label="Name" value="Abhishek Saxena" />
                    <SigLine label="Date" value={today()} />
                    <SigLine label="Designation" value="CEO & MD" />
                    <SigLine label="Signature" value="Abhishek Saxena" script />
                  </div>
                  <div>
                    <p style={{ color: "#D6362B", fontWeight: 700, fontSize: 13, margin: "0 0 10px" }}>
                      For {firmDisplay}
                    </p>
                    <SigLine label="Name" value={form.contactName || "—"} />
                    <SigLine label="Date" value={today()} />
                    <SigLine label="Designation" value={form.designation || "—"} />
                    <SigLine label="Signature" value={form.contactName || "—"} script />
                  </div>
                </div>

                <p style={{ textAlign: "center", fontSize: 12, fontStyle: "italic", color: "rgba(27,23,20,0.45)", margin: "26px 0 20px" }}>
                  IN WITNESS WHEREOF the Parties have executed this Agreement as of the Effective Date.
                </p>

                {error && (
                  <p style={{ textAlign: "center", color: "#B22C22", fontSize: 13, marginBottom: 12 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    width: "100%",
                    background: "#171310",
                    color: "#FAF9F7",
                    border: "none",
                    padding: 16,
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 15.5,
                    cursor: isPending ? "default" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {isPending ? "Signing…" : "Sign & Join the Initiative"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ClauseHeading({ n, title }: { n: number; title: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: "#171310", margin: "16px 0 6px" }}>
      {n}. {title.toUpperCase()}
    </p>
  );
}

function ClauseBody({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12.5, lineHeight: 1.7, color: "rgba(27,23,20,0.75)", margin: 0 }}>{children}</p>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "rgba(27,23,20,0.6)", marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: "#D6362B" }}> *</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid rgba(27,23,20,0.2)",
          borderRadius: 4,
          fontSize: 13.5,
          fontFamily: "inherit",
          background: "#fff",
        }}
      />
    </label>
  );
}

function SigLine({ label, value, script }: { label: string; value: string; script?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid rgba(27,23,20,0.15)" }}>
      <span style={{ color: "rgba(27,23,20,0.55)" }}>{label}:</span>
      <span
        style={{
          color: "#171310",
          fontWeight: script ? 600 : 500,
          fontFamily: script ? "'IBM Plex Serif', serif" : "inherit",
          fontStyle: script ? "italic" : "normal",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
