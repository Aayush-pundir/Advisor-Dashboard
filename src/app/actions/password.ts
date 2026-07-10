"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  changePassword,
  consumePasswordResetToken,
  createPasswordResetToken,
  getAuthedUser,
  isStrongPassword,
  verifyPassword,
} from "@/lib/auth";

/** Step 1 of self-service reset: issue a token for the given email if it exists.
 * No real email provider is wired up yet, so the caller redirects to a page
 * that displays the link directly — see ARCHITECTURE.md for what a real
 * provider integration would replace here. */
export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/forgot-password?error=1");

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether the account exists.
    redirect("/forgot-password/sent");
  }

  const token = await createPasswordResetToken(user.id);
  redirect(`/forgot-password/sent?token=${token}`);
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password !== confirm) {
    redirect(`/reset-password/${token}?error=mismatch`);
  }
  const strength = isStrongPassword(password);
  if (!strength.ok) {
    redirect(`/reset-password/${token}?error=weak`);
  }

  const userId = await consumePasswordResetToken(token);
  if (!userId) {
    redirect(`/reset-password/${token}?error=expired`);
  }

  await changePassword(userId!, password);
  redirect("/login?reset=1");
}

/** Forced first-login change, and voluntary change from account settings.
 * Voluntary changes must supply the correct current password; the forced
 * first-login flow is exempt since the user just authenticated with it. */
export async function changePasswordAction(formData: FormData) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!user!.mustChangePassword) {
    const valid = await verifyPassword(currentPassword, user!.passwordHash);
    if (!valid) redirect("/change-password?error=current");
  }

  if (password !== confirm) {
    redirect("/change-password?error=mismatch");
  }
  const strength = isStrongPassword(password);
  if (!strength.ok) {
    redirect("/change-password?error=weak");
  }

  const wasForced = user!.mustChangePassword;
  await changePassword(user!.id, password);

  if (wasForced) {
    redirect(user!.role === "CA" ? "/partner" : "/admin");
  }
  redirect(user!.role === "CA" ? "/partner/settings?saved=1" : "/admin/settings?saved=1");
}
