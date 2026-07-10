"use client";

import { useTransition } from "react";
import { removeTeammateAction } from "@/app/actions/settings";

export function RemoveTeammateButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => removeTeammateAction(userId))}
      className="text-xs text-rose-600 hover:underline disabled:opacity-50"
    >
      Remove
    </button>
  );
}
