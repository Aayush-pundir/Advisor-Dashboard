"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { inviteTeammateAction } from "@/app/actions/settings";

export function InviteTeammateForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTempPassword(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    startTransition(async () => {
      const result = await inviteTeammateAction(fd);
      if (result.ok) {
        setTempPassword(result.tempPassword ?? null);
        setName("");
        setEmail("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Inviting…" : "Invite"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {tempPassword && (
        <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-semibold text-amber-800">Teammate added — share this temporary password</p>
          <p className="mt-1 text-xs text-amber-700">
            No email provider is wired up yet, so relay this manually. They&apos;ll be asked to set their own
            password on first sign-in.
          </p>
          <p className="mt-2 font-mono text-sm text-amber-900">{tempPassword}</p>
        </div>
      )}
    </div>
  );
}
