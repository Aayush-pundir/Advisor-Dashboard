"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import { notifyPartnerUsers } from "@/lib/notify";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";
import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

async function requireAssetManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage asset kits");
  }
  return user;
}

const MAX_ASSET_BYTES = 75 * 1024 * 1024; // 75MB — generous enough for a short video

async function saveAssetFile(file: File): Promise<{ fileUrl: string; fileName: string; mimeType: string }> {
  const dir = path.join(process.cwd(), "public", "uploads", "assets");
  await mkdir(dir, { recursive: true });
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const storedName = `${randomBytes(8).toString("hex")}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), bytes);
  return { fileUrl: `/uploads/assets/${storedName}`, fileName: file.name, mimeType: file.type || "application/octet-stream" };
}

/** Admin/marketing: give a single advisor an asset — a title, an optional
 * note, and a file. Uploading it is giving it; the advisor sees it in their
 * Asset Kit immediately. */
export async function uploadAssetKitFileAction(
  partnerId: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireAssetManager();

  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  const file = formData.get("file");

  if (!title) return { ok: false, error: "Please give the asset a title." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose a file." };
  if (file.size > MAX_ASSET_BYTES) return { ok: false, error: "File is too large (max 75MB)." };

  const saved = await saveAssetFile(file);
  const partner = await db.partner.findUniqueOrThrow({ where: { id: partnerId } });

  await db.assetKitItem.create({
    data: { partnerId, title, note, owner: actor.name, ...saved },
  });

  await notifyPartnerUsers(partnerId, {
    type: "ASSET_DELIVERED",
    title: `New asset ready: ${title}`,
    body: note ?? undefined,
    href: "/partner/assets",
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "UPLOAD_ASSET_KIT_FILE",
    targetType: "Partner",
    targetId: partnerId,
    meta: `${title} -> ${partner.firmName}`,
  });

  revalidatePath(`/admin/partners/${partnerId}`);
  revalidatePath("/partner/assets");
  return { ok: true };
}

/** Admin/marketing: give the same asset to several advisors at once — for
 * common creative (a festive campaign pack, a compliance calendar) instead
 * of uploading the same file one advisor at a time. */
export async function bulkUploadSharedAssetAction(
  formData: FormData,
): Promise<{ ok: boolean; created: number; error?: string }> {
  const actor = await requireAssetManager();

  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  const file = formData.get("file");
  const partnerIds = formData.getAll("partnerIds").map(String).filter(Boolean);

  if (!title) return { ok: false, created: 0, error: "Please give the asset a title." };
  if (!(file instanceof File) || file.size === 0) return { ok: false, created: 0, error: "Please choose a file." };
  if (file.size > MAX_ASSET_BYTES) return { ok: false, created: 0, error: "File is too large (max 75MB)." };
  if (partnerIds.length === 0) return { ok: false, created: 0, error: "Select at least one advisor." };

  const saved = await saveAssetFile(file);
  const sharedGroupId = randomBytes(6).toString("hex");

  await db.assetKitItem.createMany({
    data: partnerIds.map((partnerId) => ({
      partnerId,
      title,
      note,
      owner: actor.name,
      sharedGroupId,
      ...saved,
    })),
  });

  for (const partnerId of partnerIds) {
    await notifyPartnerUsers(partnerId, {
      type: "ASSET_DELIVERED",
      title: `New asset ready: ${title}`,
      body: note ?? undefined,
      href: "/partner/assets",
    });
  }

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "BULK_UPLOAD_SHARED_ASSET",
    targetType: "AssetKitItem",
    targetId: "bulk",
    meta: `${title} -> ${partnerIds.length} partner(s)`,
  });

  revalidatePath("/admin/asset-kit");
  for (const id of partnerIds) revalidatePath(`/admin/partners/${id}`);
  revalidatePath("/partner/assets");
  return { ok: true, created: partnerIds.length };
}

/** Admin: remove an asset kit item entirely, deleting the underlying file
 * from disk. */
export async function deleteAssetKitItemAction(itemId: string) {
  const actor = await requireAssetManager();

  const item = await db.assetKitItem.delete({ where: { id: itemId } });

  if (item.fileUrl && item.fileUrl.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", item.fileUrl)).catch(() => {});
  }

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "DELETE_ASSET_KIT_ITEM",
    targetType: "AssetKitItem",
    targetId: itemId,
    meta: item.title,
  });

  revalidatePath(`/admin/partners/${item.partnerId}`);
  revalidatePath("/admin/asset-kit");
  revalidatePath("/partner/assets");
}
