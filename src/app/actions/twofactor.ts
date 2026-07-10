"use server";

import { redirect } from "next/navigation";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import {
  getAuthedUser,
  getPendingTwoFactorUserId,
  completeTwoFactorLogin,
  clearPendingTwoFactorSession,
} from "@/lib/auth";

function buildTotp(email: string, secretBase32: string) {
  return new OTPAuth.TOTP({
    issuer: "OmniCard Advisor",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/** Submits the 6-digit code during login when 2FA is enabled. */
export async function verifyLoginTwoFactorAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const userId = await getPendingTwoFactorUserId();
  if (!userId) redirect("/login?error=invalid");

  const user = await db.user.findUniqueOrThrow({ where: { id: userId! } });
  if (!user.twoFactorSecret) redirect("/login?error=invalid");

  const totp = buildTotp(user.email, user.twoFactorSecret!);
  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    redirect("/login/2fa?error=1");
  }

  await completeTwoFactorLogin(userId!);

  if (user.mustChangePassword) redirect("/change-password");
  redirect(user.role === "CA" ? "/partner" : "/admin");
}

export async function cancelTwoFactorLoginAction() {
  await clearPendingTwoFactorSession();
  redirect("/login");
}

/** Step 1 of enrollment: generate a secret and QR code for the authenticator app. */
export async function startTwoFactorEnrollmentAction(): Promise<{ qrDataUrl: string; secret: string }> {
  const user = await getAuthedUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = buildTotp(user.email, secret.base32);
  const otpauthUrl = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32 } });

  return { qrDataUrl, secret: secret.base32 };
}

/** Step 2: confirm the user's authenticator app is producing valid codes. */
export async function confirmTwoFactorEnrollmentAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!user.twoFactorSecret) return { ok: false, error: "Start enrollment first." };

  const code = String(formData.get("code") ?? "").trim();
  const totp = buildTotp(user.email, user.twoFactorSecret);
  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) return { ok: false, error: "Incorrect code. Try again." };

  await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  return { ok: true };
}

export async function disableTwoFactorAction() {
  const user = await getAuthedUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  await db.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
}
