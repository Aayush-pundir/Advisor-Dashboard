"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getAuthedUser, hashPassword } from "@/lib/auth";
import { canManageTeam, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import type { UserRole } from "@/lib/enums";

async function requireTeamManager() {
  const user = await getAuthedUser();
  if (!user || !canManageTeam(user.role as UserRole)) {
    throw new ForbiddenError("manage the internal team");
  }
  return user;
}

/** ADMIN-only: add an internal ops teammate. No email provider is wired up,
 * so the temp password is returned to show once — see ARCHITECTURE.md. */
export async function inviteInternalUserAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; tempPassword?: string }> {
  const actor = await requireTeamManager();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();
  if (!name || !email || !role) return { ok: false, error: "All fields are required." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const tempPassword = randomBytes(6).toString("hex");
  await db.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
    },
  });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "INVITE_TEAM_MEMBER",
    targetType: "User",
    meta: `${name} <${email}> as ${role}`,
  });

  revalidatePath("/admin/team");
  return { ok: true, tempPassword };
}

export async function deactivateInternalUserAction(userId: string) {
  const actor = await requireTeamManager();
  if (userId === actor.id) throw new Error("Cannot deactivate yourself");

  const target = await db.user.update({ where: { id: userId }, data: { active: false, sessionVersion: { increment: 1 } } });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "DEACTIVATE_TEAM_MEMBER",
    targetType: "User",
    targetId: userId,
    meta: target.name,
  });

  revalidatePath("/admin/team");
}

export async function reactivateInternalUserAction(userId: string) {
  const actor = await requireTeamManager();
  const target = await db.user.update({ where: { id: userId }, data: { active: true } });

  await logAudit({
    actorId: actor.id,
    actorName: actor.name,
    action: "REACTIVATE_TEAM_MEMBER",
    targetType: "User",
    targetId: userId,
    meta: target.name,
  });

  revalidatePath("/admin/team");
}
