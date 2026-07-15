"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveCampaignAction } from "@/app/actions/campaign";

export function ApproveCampaignButton({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button size="sm" disabled={isPending} onClick={() => startTransition(() => approveCampaignAction(campaignId))}>
      {isPending ? "Approving…" : "Approve"}
    </Button>
  );
}
