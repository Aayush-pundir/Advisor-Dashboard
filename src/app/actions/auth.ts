"use server";

import { redirect } from "next/navigation";
import { login, destroySession, signOutEverywhere, requireSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const result = await login(email, password);
  if (!result.ok) {
    const code = result.error === "RATE_LIMITED" ? "rate_limited" : result.error === "INACTIVE" ? "inactive" : "invalid";
    redirect(`/login?error=${code}`);
  }

  if (result.requiresTwoFactor) {
    redirect("/login/2fa");
  }

  if (result.user!.mustChangePassword) {
    redirect("/change-password");
  }

  if (result.user!.role === "CA") {
    redirect("/partner");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function signOutEverywhereAction() {
  const session = await requireSession();
  await signOutEverywhere(session.userId);
  redirect("/login");
}
