/**
 * Vercel Cron entry point. Configured in vercel.json to run daily.
 * Iterates every active site and runs one keyword each, respecting the
 * site-level daily cap.
 *
 * Authentication: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runOneForSite, type RunResult } from "@/lib/runner";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sites = await prisma.site.findMany({ where: { active: true } });
  const results: RunResult[] = [];
  for (const site of sites) {
    // One article per site per cron tick. Ramp up by raising max_per_day on the
    // site or scheduling additional cron jobs.
    const r = await runOneForSite(site.id, { dryRun: false });
    results.push(r);
  }
  return NextResponse.json({ runs: results.length, results });
}
