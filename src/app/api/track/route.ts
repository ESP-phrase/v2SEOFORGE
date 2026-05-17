/**
 * Public pageview beacon. WordPress articles include a tiny snippet that POSTs
 * here on every load. We resolve the site/article from the URL, hash the IP
 * for unique-visitor counts (never store the raw IP), and write a PageView row.
 *
 * Open CORS — this is meant to be called from any site you publish to.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const BOT_RX = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor/i;

function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? "seoforge";
  return crypto.createHash("sha256").update(salt + "|" + ip).digest("hex").slice(0, 32);
}

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url: string = String(body.url ?? "").slice(0, 1000);
    const referrer: string = String(body.referrer ?? "").slice(0, 500);
    const country: string = (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 4);
    const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
    const isBot = BOT_RX.test(ua);
    const ipHash = hashIp(getIp(req));

    let path = "";
    let host = "";
    try {
      const u = new URL(url);
      path = u.pathname + u.search;
      host = u.host.toLowerCase().replace(/^www\./, "");
    } catch {
      return NextResponse.json({ ok: false, err: "bad url" }, { status: 400, headers: CORS });
    }

    // Fast path: pings from our own marketing site (seoforge.org or a Vercel
    // preview URL) never resolve to a wp Site row, so skip the lookup and
    // write the row directly with siteId=null. /admin/live filters on
    // siteId=null to count own-site visitors. If the request carries an
    // authed Auth.js session cookie we also attach userId+userEmail so the
    // admin dashboard can render real names per live session.
    const isOwnHost =
      host === "seoforge.org" ||
      host === "www.seoforge.org" ||
      host.endsWith(".vercel.app");
    if (isOwnHost) {
      let userId: string | null = null;
      let userEmail: string | null = null;
      try {
        const session = await auth();
        if (session?.user?.id) {
          userId = session.user.id;
          userEmail = session.user.email ?? null;
        }
      } catch {
        /* session resolution failed — treat as anonymous, never block tracking */
      }
      await prisma.pageView.create({
        data: { siteId: null, articleId: null, path, referrer, country, ua, ipHash, isBot, userId, userEmail },
      });
      return NextResponse.json({ ok: true }, { headers: CORS });
    }

    // Customer WP site path: match site by wpUrl host. Match article by exact
    // wpUrl, falling back to slug-in-path.
    const sites = await prisma.site.findMany({
      where: { active: true },
      select: { id: true, wpUrl: true },
    });
    const site = sites.find((s) => {
      try {
        return new URL(s.wpUrl).host.toLowerCase().replace(/^www\./, "") === host;
      } catch {
        return false;
      }
    });

    let articleId: number | null = null;
    if (site) {
      const exact = await prisma.article.findFirst({
        where: { siteId: site.id, wpUrl: url },
        select: { id: true },
      });
      if (exact) {
        articleId = exact.id;
      } else {
        // Slug fallback: last meaningful path segment
        const seg = path.split("/").filter(Boolean).pop() ?? "";
        if (seg) {
          const bySlug = await prisma.article.findFirst({
            where: { siteId: site.id, slug: seg },
            select: { id: true },
          });
          if (bySlug) articleId = bySlug.id;
        }
      }
    }

    await prisma.pageView.create({
      data: {
        siteId: site?.id ?? null,
        articleId,
        path,
        referrer,
        country,
        ua,
        ipHash,
        isBot,
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "track failed";
    return NextResponse.json({ ok: false, err: msg }, { status: 500, headers: CORS });
  }
}
