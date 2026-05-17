/**
 * Live mission-control data endpoint. Polled by /admin/live every few seconds.
 *
 * Returns:
 *   - active visitors right now (60s / 5min / 30min windows, deduped by ipHash)
 *   - per-session timeline (each ipHash's last few hops)
 *   - 24h funnel: homepage → features → pricing → login → signup → checkout
 *   - recent signups (last 7 days)
 *   - live Stripe checkout sessions + subscriptions (live mode)
 *   - geo + referrer breakdown
 *
 * Auth: any authed user can read. Single-tenant for now; if multi-admin
 * becomes a thing, gate on user.email matching an ADMIN_EMAILS allowlist.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PATH_BUCKETS: { name: string; match: (p: string) => boolean }[] = [
  { name: "homepage",   match: (p) => p === "/" || p === "" },
  { name: "features",   match: (p) => p.startsWith("/features") },
  { name: "pricing",    match: (p) => p.startsWith("/pricing") },
  { name: "testimonials", match: (p) => p.startsWith("/testimonials") },
  { name: "docs",       match: (p) => p.startsWith("/docs") },
  { name: "blog",       match: (p) => p.startsWith("/blog") },
  { name: "login",      match: (p) => p === "/login" || p.startsWith("/login?") },
  { name: "signup",     match: (p) => p.includes("mode=signup") },
  { name: "dashboard",  match: (p) => p.startsWith("/dashboard") },
  { name: "billing",    match: (p) => p.startsWith("/billing") },
];

function bucketize(path: string): string {
  for (const b of PATH_BUCKETS) if (b.match(path)) return b.name;
  return "other";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, err: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const sec60 = new Date(now - 60 * 1000);
  const min5 = new Date(now - 5 * 60 * 1000);
  const min30 = new Date(now - 30 * 60 * 1000);
  const h24 = new Date(now - 24 * 3600 * 1000);
  const d7 = new Date(now - 7 * 24 * 3600 * 1000);

  // All recent marketing pageviews (siteId IS NULL = our own site).
  const recent30 = await prisma.pageView.findMany({
    where: { siteId: null, createdAt: { gte: min30 }, isBot: false },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const active60sIps = new Set<string>();
  const active5mIps = new Set<string>();
  const active30mIps = new Set<string>();
  for (const v of recent30) {
    active30mIps.add(v.ipHash);
    if (v.createdAt >= min5) active5mIps.add(v.ipHash);
    if (v.createdAt >= sec60) active60sIps.add(v.ipHash);
  }

  // Build a per-session view: last 8 hops per ipHash, newest first.
  type Hop = { path: string; bucket: string; at: number };
  type Sess = {
    ipHash: string;
    firstSeen: number;
    lastSeen: number;
    country: string;
    referrer: string;
    bucket: string;
    hops: Hop[];
    pageCount: number;
  };
  const sessMap = new Map<string, Sess>();
  // recent30 is newest-first; walk it once.
  for (const v of recent30) {
    const ip = v.ipHash;
    const path = v.path || "/";
    const bucket = bucketize(path);
    const at = v.createdAt.getTime();
    let s = sessMap.get(ip);
    if (!s) {
      s = {
        ipHash: ip,
        firstSeen: at,
        lastSeen: at,
        country: v.country || "—",
        referrer: v.referrer || "—",
        bucket,
        hops: [],
        pageCount: 0,
      };
      sessMap.set(ip, s);
    }
    s.firstSeen = Math.min(s.firstSeen, at);
    s.lastSeen = Math.max(s.lastSeen, at);
    s.pageCount += 1;
    if (s.hops.length < 8) s.hops.push({ path, bucket, at });
  }
  const sessions = Array.from(sessMap.values()).sort((a, b) => b.lastSeen - a.lastSeen);

  // 24h funnel: count uniques per bucket
  const h24Views = await prisma.pageView.findMany({
    where: { siteId: null, createdAt: { gte: h24 }, isBot: false },
    select: { path: true, ipHash: true, country: true, referrer: true },
  });
  const funnelUniq: Record<string, Set<string>> = {};
  const countryCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};
  for (const v of h24Views) {
    const b = bucketize(v.path || "/");
    if (!funnelUniq[b]) funnelUniq[b] = new Set();
    funnelUniq[b].add(v.ipHash);
    const c = v.country || "—";
    countryCounts[c] = (countryCounts[c] ?? 0) + 1;
    const r = (v.referrer || "direct").split("?")[0].replace(/^https?:\/\//, "").split("/")[0] || "direct";
    referrerCounts[r] = (referrerCounts[r] ?? 0) + 1;
  }
  const funnel24h: Record<string, number> = {};
  for (const k of Object.keys(funnelUniq)) funnel24h[k] = funnelUniq[k].size;
  funnel24h["total_uniques"] = new Set(h24Views.map((v) => v.ipHash)).size;
  funnel24h["total_pageviews"] = h24Views.length;

  // Recent signups (7 days)
  const signups = await prisma.user.findMany({
    where: { createdAt: { gte: d7 } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      createdAt: true,
      lastLogin: true,
      plan: true,
      articleCredits: true,
      articlesUsed: true,
      stripeCustomerId: true,
    },
  });

  // Stripe live: recent checkout sessions + subscriptions
  type StripeCheckout = {
    id: string;
    amount: number | null;
    currency: string | null;
    status: string | null;
    payment_status: string | null;
    customer_email: string | null;
    created: number;
    metadata_plan: string | null;
  };
  type StripeSub = {
    id: string;
    status: string;
    customer: string;
    created: number;
    price_id: string | null;
    amount: number | null;
    trial_end: number | null;
    cancel_at_period_end: boolean;
  };
  let stripeCheckouts: StripeCheckout[] = [];
  let stripeSubs: StripeSub[] = [];
  let stripeErr: string | null = null;
  if (isStripeConfigured()) {
    try {
      const cs = await stripe.checkout.sessions.list({ limit: 25 });
      stripeCheckouts = cs.data.map((s) => ({
        id: s.id,
        amount: s.amount_total ?? null,
        currency: s.currency ?? null,
        status: s.status ?? null,
        payment_status: s.payment_status ?? null,
        customer_email: s.customer_details?.email ?? s.customer_email ?? null,
        created: s.created * 1000,
        metadata_plan: (s.metadata?.plan as string | undefined) ?? null,
      }));
    } catch (e) { stripeErr = e instanceof Error ? e.message : String(e); }
    try {
      const subs = await stripe.subscriptions.list({ limit: 25, status: "all" });
      stripeSubs = subs.data.map((s) => ({
        id: s.id,
        status: s.status,
        customer: typeof s.customer === "string" ? s.customer : s.customer.id,
        created: s.created * 1000,
        price_id: s.items.data[0]?.price.id ?? null,
        amount: s.items.data[0]?.price.unit_amount ?? null,
        trial_end: s.trial_end ? s.trial_end * 1000 : null,
        cancel_at_period_end: s.cancel_at_period_end,
      }));
    } catch (e) { stripeErr = (stripeErr ? stripeErr + " | " : "") + (e instanceof Error ? e.message : String(e)); }
  } else {
    stripeErr = "STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not set";
  }

  return NextResponse.json({
    ok: true,
    now,
    active: {
      now_60s: active60sIps.size,
      min5: active5mIps.size,
      min30: active30mIps.size,
    },
    sessions: sessions.slice(0, 50),
    funnel24h,
    geo24h: Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
    referrers24h: Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
    signups: signups.map((s) => ({
      id: s.id,
      email: s.email,
      createdAt: s.createdAt.getTime(),
      lastLogin: s.lastLogin ? s.lastLogin.getTime() : null,
      plan: s.plan,
      credits: s.articleCredits,
      used: s.articlesUsed,
      hasStripe: !!s.stripeCustomerId,
    })),
    stripeCheckouts,
    stripeSubs,
    stripeErr,
  });
}
