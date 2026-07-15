"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { canManagePartners, ForbiddenError } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";
import { randomBytes } from "crypto";

async function requireAssetManager() {
  const user = await getAuthedUser();
  if (!user || !canManagePartners(user.role as UserRole)) {
    throw new ForbiddenError("manage asset kits");
  }
  return user;
}

/** Admin: add an ad-hoc asset to a partner's kit beyond the fixed 12-item
 * catalogue, assigning an OmniCard Team owner up front. */
export async function addAssetKitItemAction(partnerId: string, formData: FormData) {
  await requireAssetManager();

  const customLabel = String(formData.get("customLabel") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  if (!customLabel || !owner) return;

  await db.assetKitItem.create({
    data: {
      partnerId,
      key: `CUSTOM_${randomBytes(6).toString("hex")}`,
      customLabel,
      owner,
      status: "PENDING",
    },
  });

  revalidatePath(`/admin/partners/${partnerId}`);
}

/** Admin: reassign owner and/or mark status on any asset kit item. */
export async function updateAssetKitItemAction(itemId: string, formData: FormData) {
  await requireAssetManager();

  const owner = String(formData.get("owner") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!owner || !status) return;

  const item = await db.assetKitItem.update({
    where: { id: itemId },
    data: {
      owner,
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : null,
    },
  });

  revalidatePath(`/admin/partners/${item.partnerId}`);
}
