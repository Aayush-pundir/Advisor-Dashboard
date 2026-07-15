"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/auth";
import { canManageTeam, ForbiddenError } from "@/lib/permissions";
import type { UserRole } from "@/lib/enums";

async function requireAdmin() {
  const user = await getAuthedUser();
  if (!user || !canManageTeam(user.role as UserRole)) {
    throw new ForbiddenError("manage sales reps");
  }
}

export async function setSalesRepAction(userId: string, isSalesRep: boolean) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { isSalesRep } });
  revalidatePath("/admin/ops");
}

export async function setAssignmentPriorityAction(userId: string, priority: number) {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { assignmentPriority: priority } });
  revalidatePath("/admin/ops");
}
