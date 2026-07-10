"use client";

import { useTransition } from "react";
import { deactivateInternalUserAction, reactivateInternalUserAction } from "@/app/actions/team";

export function DeactivateTeamMemberButton({ userId, active }: { userId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(() =>
          active ? deactivateInternalUserAction(userId) : reactivateInternalUserAction(userId),
        )
      }
      className={`text-xs hover:underline disabled:opacity-50 ${active ? "text-rose-600" : "text-emerald-600"}`}
    >
      {active ? "Deactivate" : "Reactivate"}
    </button>
  );
}
