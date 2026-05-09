"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type KeywordItem = { keyword: string; intent: string };

function parseKeywords(raw: string): KeywordItem[] {
  const items: KeywordItem[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [kwPart, intentPart] = trimmed.split("|").map((p) => p.trim());
    items.push({
      keyword: kwPart,
      intent: (intentPart || "informational").toLowerCase(),
    });
  }
  return items;
}

export async function addKeywordsAction(siteId: number, formData: FormData) {
  const raw = String(formData.get("keywords") ?? "");
  const items = parseKeywords(raw);

  let inserted = 0;
  for (const it of items) {
    try {
      await prisma.keyword.create({
        data: { siteId, keyword: it.keyword, intent: it.intent },
      });
      inserted += 1;
    } catch {
      // Unique constraint violation = duplicate, skip silently.
    }
  }

  revalidatePath(`/sites/${siteId}`);
  redirect(`/sites/${siteId}?added=${inserted}&dupes=${items.length - inserted}`);
}
