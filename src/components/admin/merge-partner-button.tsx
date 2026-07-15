"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { mergePartnersAction } from "@/app/actions/partner";

export function MergePartnerButton({
  survivorId,
  survivorFirmName,
  mergedId,
  mergedFirmName,
}: {
  survivorId: string;
  survivorFirmName: string;
  mergedId: string;
  mergedFirmName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            `Merge "${mergedFirmName}" into "${survivorFirmName}"? All leads, contacts, advisory fees and history from "${mergedFirmName}" will move to "${survivorFirmName}", and "${mergedFirmName}" will be deleted. This cannot be undone.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await mergePartnersAction(survivorId, mergedId);
          if (!result.ok) alert(result.error);
        });
      }}
    >
      {isPending ? "Merging…" : `Merge into ${survivorFirmName}`}
    </Button>
  );
}
