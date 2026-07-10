"use client";

import { useState, useTransition } from "react";
import { createSupportTicketAction } from "@/app/actions/support";

const WHATSAPP_NUMBER = "917042704232";
const SUPPORT_EMAIL = "connect@omnicard.in";

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "ticket" | "sent">("menu");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createSupportTicketAction(fd);
      if (result.ok) {
        setMode("sent");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  function close() {
    setOpen(false);
    setTimeout(() => setMode("menu"), 250);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden">
      {open && (
        <div className="mb-3 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <p className="text-sm font-semibold">Support</p>
            <button onClick={close} className="text-white/80 hover:text-white">
              &#10005;
            </button>
          </div>

          {mode === "menu" && (
            <div className="flex flex-col gap-2 p-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-brand-light/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1s-.6.8-.8 1c-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.5-.3z" />
                  </svg>
                </span>
                <span>
                  <span className="block font-medium">Chat on WhatsApp</span>
                  <span className="block text-xs text-muted">Usually replies in minutes</span>
                </span>
              </a>

              <button
                onClick={() => setMode("ticket")}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-left text-sm hover:bg-brand-light/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6M9 16h4M4 6h16v14l-4-3H4z" />
                  </svg>
                </span>
                <span>
                  <span className="block font-medium">Raise a ticket</span>
                  <span className="block text-xs text-muted">We&apos;ll route it to your success manager</span>
                </span>
              </button>

              <div className="mt-1 rounded-lg bg-background p-3 text-xs text-muted">
                <p className="font-medium text-foreground">Dedicated support</p>
                <p>{WHATSAPP_NUMBER.replace("91", "+91 ")}</p>
                <p>{SUPPORT_EMAIL}</p>
              </div>
            </div>
          )}

          {mode === "ticket" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
              <input
                name="subject"
                required
                placeholder="Subject"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Describe the issue..."
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <select
                name="priority"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                defaultValue="NORMAL"
              >
                <option value="LOW">Low priority</option>
                <option value="NORMAL">Normal priority</option>
                <option value="HIGH">High priority</option>
                <option value="URGENT">Urgent</option>
              </select>
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="flex-1 rounded-lg border border-border py-2 text-sm text-muted"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isPending ? "Sending…" : "Submit"}
                </button>
              </div>
            </form>
          )}

          {mode === "sent" && (
            <div className="p-6 text-center">
              <p className="text-2xl">✅</p>
              <p className="mt-2 text-sm font-medium">Ticket raised</p>
              <p className="mt-1 text-xs text-muted">
                Your Partner Success Manager has been notified. We&apos;ll follow up shortly.
              </p>
              <button onClick={close} className="mt-4 text-xs text-brand hover:underline">
                Close
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Support"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark"
      >
        {open ? (
          <span className="text-xl">&#10005;</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
