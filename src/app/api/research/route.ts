import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { suggestKeywords } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    siteId?: number;
    seed?: string;
    count?: number;
  };
  const siteId = Number(body.siteId);
  const seed = String(body.seed ?? "").trim();
  const count = Math.max(10, Math.min(60, Number(body.count) || 30));

  if (!siteId || !seed) {
    return NextResponse.json({ error: "siteId and seed are required" }, { status: 400 });
  }
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return NextResponse.json({ error: "site not found" }, { status: 404 });

  try {
    const result = await suggestKeywords(seed, site, count);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
