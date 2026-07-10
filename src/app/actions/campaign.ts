"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "@/lib/auth";
import { notifyPartnerUsers } from "@/lib/notify";
import { canManageCampaigns, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";

/** Step 3.11 / Step 7 — Marketing Ops drafts a campaign for CA approval. */
export async function createCampaignAction(formData: FormData) {
  const actor = await getAuthedUser();
  if (!actor || !canManageCampaigns(actor.role as UserRole)) {
    throw new ForbiddenError("manage campaigns");
  }

  const partnerId = String(formData.get("partnerId") ?? "");
  const type = String(formData.get("type") ?? "EMAIL");
  const title = String(formData.get("title") ?? "").trim();
  if (!partnerId || !title) return;

  await db.campaign.create({
    data: { partnerId, type, title, status: "PENDING_APPROVAL" },
  });

  await notifyPartnerUsers(partnerId, {
    type: "CAMPAIGN_PENDING",
    title: `New campaign ready for your approval: ${title}`,
    body: "OmniCard drafted this campaign for your clients — approve it in one click.",
    href: "/partner/campaigns",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "CREATE_CAMPAIGN",
    targetType: "Campaign",
    meta: title,
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
