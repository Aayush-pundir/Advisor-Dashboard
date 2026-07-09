"use server";

import { redirect } from "next/navigation";
import { login, destroySession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await login(email, password);
  if (!user) {
    redirect("/login?error=1");
  }

  if (user.role === "CA") {
    redirect("/partner");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
