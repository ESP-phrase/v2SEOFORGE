import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const siteId = Number(id);
  const form = await req.formData();
  const raw = String(form.get("keywords") ?? "");

  let inserted = 0;
  let total = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    total += 1;
    const [kwPart, intentPart] = trimmed.split("|").map((p) => p.trim());
    try {
      await prisma.keyword.create({
        data: {
          siteId,
          keyword: kwPart,
          intent: (intentPart || "informational").toLowerCase(),
        },
      });
      inserted += 1;
    } catch {
      // duplicate, ignore
    }
  }
  return NextResponse.json({ inserted, duplicates: total - inserted });
}
