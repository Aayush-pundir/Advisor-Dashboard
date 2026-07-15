"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { inviteInternalUserAction } from "@/app/actions/team";
import { USER_ROLES } from "@/lib/enums";

const INVITABLE_ROLES = USER_ROLES.filter((r) => r !== "CA");
const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", OMNICARD_TEAM: "OmniCard Team" };

export function InviteInternalUserForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setTempPassword(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteInternalUserAction(fd);
      if (result.ok) {
        setTempPassword(result.tempPassword ?? null);
        e.currentTarget.reset();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-4">
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          name="role"
          required
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {INVITABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r] ?? r}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add teammate"}
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {tempPassword && (
        <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-semibold text-amber-800">Teammate added — share this temporary password</p>
          <p className="mt-1 text-xs text-amber-700">
            No email provider is wired up yet, so relay this manually. They&apos;ll set their own password on
            first sign-in.
          </p>
          <p className="mt-2 font-mono text-sm text-amber-900">{tempPassword}</p>
        </div>
      )}
    </div>
  );
}
