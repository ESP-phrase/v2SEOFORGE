"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Email + password signup. Creates a User row with a bcrypt-hashed password,
 * then sets the Auth.js session cookie directly (same pattern as admin
 * quick-login) so the user lands on /dashboard signed in.
 *
 * Validation kept simple: 6+ char password, basic email shape.
 */
export async function signUpAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;

  if (!email.includes("@") || email.length < 5) {
    redirect("/signup?error=" + encodeURIComponent("Enter a valid email."));
  }
  if (password.length < 6) {
    redirect("/signup?error=" + encodeURIComponent("Password must be at least 6 characters."));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/signup?error=" + encodeURIComponent("That email is already registered. Sign in instead."));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signInWithPasswordAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Enter email and password."));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    redirect("/login?error=" + encodeURIComponent("No account with that email."));
  }
  const ok = await bcrypt.compare(password, user!.passwordHash!);
  if (!ok) {
    redirect("/login?error=" + encodeURIComponent("Wrong password."));
  }

  await createSession(user!.id);
  redirect("/dashboard");
}

async function createSession(userId: string) {
  const sessionToken = `${crypto.randomUUID()}${crypto.randomBytes(8).toString("hex")}`;
  const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  await prisma.session.create({ data: { sessionToken, userId, expires } });
  const isProd = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set(
    isProd ? "__Secure-authjs.session-token" : "authjs.session-token",
    sessionToken,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      expires,
      path: "/",
    },
  );
  await prisma.user.update({ where: { id: userId }, data: { lastLogin: new Date() } });
}
