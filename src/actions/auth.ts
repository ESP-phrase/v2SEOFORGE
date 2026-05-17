"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

async function createSessionCookie(userId: string): Promise<void> {
  const { prisma } = await import("@/lib/db");
  const crypto = await import("node:crypto");
  const { cookies } = await import("next/headers");

  const sessionToken = `${crypto.randomUUID()}${crypto.randomBytes(8).toString("hex")}`;
  const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const isProd = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set(isProd ? "__Secure-authjs.session-token" : "authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires,
    path: "/",
  });
}

function parseCredentials(formData: FormData): { email: string; password: string } | null {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@") || password.length < 8) return null;
  return { email, password };
}

/**
 * Pull a safe ?next= target from the form. We only allow same-origin relative
 * paths so a malicious ?next=https://evil/ can't be used to redirect victims
 * after they sign in. Defaults to /dashboard.
 */
function safeNext(formData: FormData): string {
  const raw = String(formData.get("next") ?? "").trim();
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function maskEmail(e?: string | null): string {
  if (!e) return "(none)";
  const [u, d] = e.split("@");
  if (!d) return e;
  return `${u.slice(0, 2)}***@${d}`;
}

export async function signUpAction(formData: FormData): Promise<void> {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const next = safeNext(formData);
  const creds = parseCredentials(formData);
  console.log(`[signup ${reqId}] start email=${maskEmail(creds?.email)} next=${next}`);
  if (!creds) {
    console.log(`[signup ${reqId}] invalid creds, bouncing`);
    redirect(`/login?mode=signup&error=${encodeURIComponent("Enter a valid email and a password of at least 8 characters.")}`);
  }
  const { prisma } = await import("@/lib/db");
  const bcrypt = (await import("bcryptjs")).default;

  const existing = await prisma.user.findUnique({ where: { email: creds!.email } });
  if (existing) {
    console.log(`[signup ${reqId}] duplicate email`);
    redirect(`/login?error=${encodeURIComponent("An account with that email already exists. Sign in instead.")}`);
  }

  const passwordHash = await bcrypt.hash(creds!.password, 12);
  const user = await prisma.user.create({
    data: { email: creds!.email, passwordHash },
  });

  // Mirror the side-effects the Auth.js createUser event runs for OAuth signups:
  // referral attribution, welcome email, conversion pixels. Failures must never
  // block account creation.
  try {
    const { cookies } = await import("next/headers");
    const c = await cookies();
    const refCode = c.get("sf_ref")?.value;
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
      if (referrer && referrer.id !== user.id) {
        await prisma.user.update({ where: { id: user.id }, data: { referredBy: refCode } });
        await prisma.referral.create({ data: { referrerId: referrer.id, referredId: user.id } });
      }
    }
  } catch (e) {
    console.warn("[referral] attribution failed:", e);
  }
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    void sendWelcomeEmail(user.email, user.name);
  } catch { /* noop */ }
  try {
    const { sendRedditEvent } = await import("@/lib/redditCapi");
    await sendRedditEvent({ eventName: "SignUp", email: user.email, userId: user.id });
    await sendRedditEvent({ eventName: "Lead", email: user.email, userId: user.id });
  } catch { /* noop */ }
  try {
    const { sendTikTokEvent } = await import("@/lib/tiktokCapi");
    await sendTikTokEvent({
      eventName: "CompleteRegistration",
      email: user.email,
      userId: user.id,
      eventId: `signup_${user.id}`,
    });
  } catch { /* noop */ }

  await createSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  console.log(`[signup ${reqId}] created user=${user.id} in ${Date.now() - t0}ms → redirect ${next}`);
  redirect(next);
}

export async function signInWithPasswordAction(formData: FormData): Promise<void> {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const next = safeNext(formData);
  const creds = parseCredentials(formData);
  console.log(`[signin ${reqId}] start email=${maskEmail(creds?.email)} next=${next}`);
  if (!creds) {
    console.log(`[signin ${reqId}] invalid creds`);
    redirect(`/login?error=${encodeURIComponent("Enter your email and password.")}`);
  }
  const { prisma } = await import("@/lib/db");
  const bcrypt = (await import("bcryptjs")).default;

  const user = await prisma.user.findUnique({ where: { email: creds!.email } });
  if (!user || !user.passwordHash) {
    console.log(`[signin ${reqId}] no user or no passwordHash`);
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }
  const ok = await bcrypt.compare(creds!.password, user!.passwordHash!);
  if (!ok) {
    console.log(`[signin ${reqId}] bad password user=${user!.id}`);
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }

  await createSessionCookie(user!.id);
  await prisma.user.update({ where: { id: user!.id }, data: { lastLogin: new Date() } });
  console.log(`[signin ${reqId}] success user=${user!.id} in ${Date.now() - t0}ms → redirect ${next}`);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function signInWithGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithXAction(): Promise<void> {
  await signIn("twitter", { redirectTo: "/dashboard" });
}

export async function signInWithGitHubAction(): Promise<void> {
  await signIn("github", { redirectTo: "/dashboard" });
}

/**
 * Quick admin login — bypasses normal sign-in. Gated by ADMIN_QUICK_LOGIN=1.
 *
 * Creates a Session row for the first (admin) user, sets the Auth.js session
 * cookie, and redirects to /dashboard. Disable in production by removing the
 * env var.
 */
export async function adminQuickLoginAction(): Promise<void> {
  if (process.env.ADMIN_QUICK_LOGIN !== "1") {
    redirect("/login?error=" + encodeURIComponent("Admin quick login is disabled."));
  }
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("No admin user exists yet."));
  }
  await createSessionCookie(user!.id);
  redirect("/dashboard");
}
