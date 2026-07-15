"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession, getAuthedUser } from "@/lib/auth";
import { notifyPartnerUsers, notifyInternalUsers } from "@/lib/notify";
import { canManageCampaigns, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";

async function requireCampaignManager() {
  const user = await getAuthedUser();
  if (!user || !canManageCampaigns(user.role as UserRole)) {
    throw new ForbiddenError("manage campaigns");
  }
  return user;
}

/** OmniCard drafts a campaign and sends it for the advisor's approval —
 * one submission can target several partners at once (a festive/themed
 * send), instead of drafting the same campaign one partner at a time. */
export async function createCampaignAction(formData: FormData) {
  const actor = await requireCampaignManager();

  const partnerIds = formData.getAll("partnerIds").map(String).filter(Boolean);
  const type = String(formData.get("type") ?? "EMAIL");
  const title = String(formData.get("title") ?? "").trim();
  if (partnerIds.length === 0 || !title) return;

  await db.campaign.createMany({
    data: partnerIds.map((partnerId) => ({ partnerId, type, title, status: "PENDING_APPROVAL" })),
  });

  for (const partnerId of partnerIds) {
    await notifyPartnerUsers(partnerId, {
      type: "CAMPAIGN_PENDING",
      title: `New campaign ready for your approval: ${title}`,
      body: "OmniCard drafted this campaign for your clients — approve it in one click.",
      href: "/partner/campaigns",
    });
  }

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "CREATE_CAMPAIGN",
    targetType: "Campaign",
    meta: `${title} -> ${partnerIds.length} partner(s)`,
  });

  revalidatePath("/admin/campaigns");
  revalidatePath("/partner/campaigns");
}

/** CA approves a pre-drafted campaign in one click. */
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
  revalidatePath("/admin/campaigns");
}

/** Advisor: request a campaign of their own preferred mode + title/topic —
 * the other direction of createCampaignAction. Lands in OmniCard's Advisor
 * Requests tab for review instead of needing the advisor's own approval. */
export async function requestCampaignAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.partnerId) return { ok: false, error: "You must be signed in as an advisor." };

  const type = String(formData.get("type") ?? "EMAIL");
  const title = String(formData.get("title") ?? "").trim();
  const requestNote = String(formData.get("requestNote") ?? "").trim() || null;
  if (!title) return { ok: false, error: "Please give the campaign a title/topic." };

  const partner = await db.partner.findUniqueOrThrow({ where: { id: session.partnerId } });

  await db.campaign.create({
    data: {
      partnerId: session.partnerId,
      type,
      title,
      requestNote,
      requestedByPartner: true,
      status: "PENDING_APPROVAL",
    },
  });

  await notifyInternalUsers(["ADMIN", "OMNICARD_TEAM"], {
    type: "CAMPAIGN_REQUESTED",
    title: `${partner.firmName} requested a campaign: ${title}`,
    href: "/admin/campaigns?view=requests",
  });

  revalidatePath("/partner/campaigns");
  revalidatePath("/admin/campaigns");
  return { ok: true };
}

/** Admin: approve an advisor-initiated campaign request directly — since it
 * was the advisor's own idea, it skips the reverse advisor-approval step. */
export async function approveCampaignRequestAction(campaignId: string) {
  const actor = await requireCampaignManager();

  const campaign = await db.campaign.update({
    where: { id: campaignId },
    data: { status: "APPROVED", approvedAt: new Date() },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "APPROVE_CAMPAIGN_REQUEST",
    targetType: "Campaign",
    targetId: campaignId,
    meta: campaign.title,
  });

  revalidatePath("/admin/campaigns");
  revalidatePath("/partner/campaigns");
}

/** Admin: approve several advisor requests in one action — a festive/themed
 * batch instead of clicking through each request one at a time. */
export async function bulkApproveCampaignRequestsAction(formData: FormData) {
  const actor = await requireCampaignManager();

  const campaignIds = formData.getAll("campaignIds").map(String).filter(Boolean);
  if (campaignIds.length === 0) return;

  await db.campaign.updateMany({
    where: { id: { in: campaignIds } },
    data: { status: "APPROVED", approvedAt: new Date() },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "BULK_APPROVE_CAMPAIGN_REQUESTS",
    targetType: "Campaign",
    targetId: "bulk",
    meta: `${campaignIds.length} request(s) approved`,
  });

  revalidatePath("/admin/campaigns");
  revalidatePath("/partner/campaigns");
}

/** Admin: mark the creative/content for an approved campaign as reviewed —
 * the lifecycle step between approval and going live. */
export async function markContentApprovedAction(campaignId: string) {
  const actor = await requireCampaignManager();

  const campaign = await db.campaign.update({
    where: { id: campaignId },
    data: { contentApprovedAt: new Date() },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "APPROVE_CAMPAIGN_CONTENT",
    targetType: "Campaign",
    targetId: campaignId,
    meta: campaign.title,
  });

  revalidatePath("/admin/campaigns");
}

/** Admin: mark a campaign live/sent, recording the live date. */
export async function markCampaignLiveAction(campaignId: string, formData: FormData) {
  const actor = await requireCampaignManager();

  const raw = String(formData.get("liveDate") ?? "");
  const liveAt = raw ? new Date(raw) : new Date();

  const campaign = await db.campaign.update({
    where: { id: campaignId },
    data: { liveAt, status: "SENT", sentAt: liveAt },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "MARK_CAMPAIGN_LIVE",
    targetType: "Campaign",
    targetId: campaignId,
    meta: `${campaign.title} -> ${liveAt.toISOString()}`,
  });

  revalidatePath("/admin/campaigns");
}
