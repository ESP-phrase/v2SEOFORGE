"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, hasUsers, signIn } from "@/lib/auth";

export async function setupAction(formData: FormData) {
  if (await hasUsers()) redirect("/login");

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (username.length < 3) {
    redirect(`/setup?error=${encodeURIComponent("Username must be at least 3 characters.")}`);
  }
  if (password.length < 8) {
    redirect(`/setup?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }
  if (password !== password2) {
    redirect(`/setup?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  await prisma.user.create({
    data: { username, passwordHash: await hashPassword(password) },
  });

  await signIn("credentials", { username, password, redirect: false });
  redirect("/");
}

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  try {
    await signIn("credentials", { username, password, redirect: false });
  } catch {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  redirect(next.startsWith("/") ? next : "/");
}
