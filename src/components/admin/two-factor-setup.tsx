"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  startTwoFactorEnrollmentAction,
  confirmTwoFactorEnrollmentAction,
  disableTwoFactorAction,
} from "@/app/actions/twofactor";

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleStart() {
    setError(null);
    startTransition(async () => {
      const result = await startTwoFactorEnrollmentAction();
      setQrDataUrl(result.qrDataUrl);
      setSecret(result.secret);
    });
  }

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await confirmTwoFactorEnrollmentAction(fd);
      if (result.ok) {
        setDone(true);
        setQrDataUrl(null);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  if (enabled || done) {
    return (
      <div>
        <p className="text-sm text-emerald-700">Two-factor authentication is enabled on your account.</p>
        <form action={disableTwoFactorAction} className="mt-3">
          <Button variant="outline" size="sm" type="submit">
            Disable 2FA
          </Button>
        </form>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div>
        <p className="text-sm text-muted">
          Add an extra layer of protection using an authenticator app (Google Authenticator, Authy, 1Password).
        </p>
        <Button className="mt-3" onClick={handleStart} disabled={isPending}>
          Set up 2FA
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">Scan this QR code with your authenticator app:</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="2FA QR code" className="mt-3 h-40 w-40 rounded-lg border border-border" />
      <p className="mt-2 text-xs text-muted">
        Or enter this key manually: <span className="font-mono">{secret}</span>
      </p>
      <form onSubmit={handleConfirm} className="mt-4 flex items-end gap-3">
        <div>
          <label className="text-sm font-medium">Enter the 6-digit code</label>
          <input
            name="code"
            inputMode="numeric"
            maxLength={6}
            required
            className="mt-1 w-32 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="000000"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          Confirm
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
