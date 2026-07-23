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
                  MOU signed
                </div>
                <div style={{ fontSize: 15, color: "rgba(27,23,20,0.65)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
                  Your Memorandum of Understanding has been recorded. OmniCard&apos;s partnerships team will
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
                    MEMORANDUM OF UNDERSTANDING
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(27,23,20,0.55)", margin: "6px 0 0" }}>
                    (Non-Binding — Statement of Intent)
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

                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1B1714", margin: "18px 0 12px" }}>
                  This Memorandum records mutual intent between OmniCard and <strong>{firmDisplay}</strong> to explore
                  collaboration in the area of corporate expense management and digital payment solutions for clients
                  of <strong>{firmDisplay}</strong>.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1B1714", margin: "0 0 12px" }}>
                  Both parties intend to work towards a definitive framework, to be documented separately, covering
                  scope, terms, and responsibilities of collaboration.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(27,23,20,0.6)", fontStyle: "italic", margin: "0 0 24px" }}>
                  This MoU is a non-binding expression of intent only. It does not create any legal obligation,
                  partnership, agency, or commercial commitment between the parties. A separate definitive agreement,
                  executed independently, shall govern any actual engagement.
                </p>

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
                    <SigLine label="Name" value="OmniCard Partnerships Team" />
                    <SigLine label="Date" value={today()} />
                    <SigLine label="Designation" value="Authorized Signatory" />
                    <SigLine label="Signature" value="OmniCard" script />
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
                  Celebrating a shared vision for technology-led financial transformation and smarter business
                  operations.
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
