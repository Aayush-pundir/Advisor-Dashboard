"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

/** Step 3.11 / Step 7 — Marketing Ops drafts a campaign for CA approval. */
export async function createCampaignAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const type = String(formData.get("type") ?? "EMAIL");
  const title = String(formData.get("title") ?? "").trim();
  if (!partnerId || !title) return;

  await db.campaign.create({
    data: { partnerId, type, title, status: "PENDING_APPROVAL" },
  });

  revalidatePath("/admin/campaigns");
  revalidatePath("/partner/campaigns");
}

/** Step 6 / Step 3.11 — CA approves a pre-drafted campaign in one click. */
export async function approveCampaignAction(campaignId: string) {
  const session = await getSession();
  if (!session?.partnerId) throw new Error("UNAUTHENTICATED");

  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });
  if (campaign.partnerId !== session.partnerId) throw new Error("FORBIDDEN");

  await db.campaign.update({
    where: { id: campaignId },
    data: { status: "APPROVED", approvedAt: new Date() },
  });

  await db.activityEvent.create({
    data: {
      partnerId: session.partnerId,
      type: "CAMPAIGN_APPROVED",
      meta: campaign.title,
    },
  });

  revalidatePath("/partner/campaigns");
}
