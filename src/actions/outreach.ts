"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  findProspects,
  scoreProspects,
  draftOutreachEmail,
} from "@/lib/outreach";

/**
 * Run the SerpApi + Claude prospect pipeline for a seed term, persist the
 * results to OutreachProspect, return summary stats.
 */
export async function findProspectsAction(siteId: number, seed: string) {
  const cleanSeed = seed.trim();
  if (!cleanSeed) return { ok: false as const, error: "Enter a seed term." };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false as const, error: "Site not found." };

  let found;
  try {
    found = await findProspects(cleanSeed);
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "SerpApi failed.",
    };
  }
  if (found.raw.length === 0) {
    return { ok: false as const, error: "No prospects surfaced for that seed." };
  }

  const { candidates, costUsd } = await scoreProspects(found.raw, {
    niche: site.niche,
    audience: site.audience,
  });

  let inserted = 0;
  let updated = 0;
  for (const c of candidates) {
    const existing = await prisma.outreachProspect.findUnique({
      where: { siteId_url: { siteId, url: c.url } },
    });
    if (existing) {
      await prisma.outreachProspect.update({
        where: { id: existing.id },
        data: {
          relevanceScore: c.relevanceScore,
          scoreReason: c.scoreReason,
          searchSeed: c.searchSeed,
          pageTitle: c.pageTitle,
          snippet: c.snippet,
        },
      });
      updated += 1;
    } else {
      await prisma.outreachProspect.create({
        data: {
          siteId,
          url: c.url,
          domain: c.domain,
          pageTitle: c.pageTitle,
          snippet: c.snippet,
          searchSeed: c.searchSeed,
          relevanceScore: c.relevanceScore,
          scoreReason: c.scoreReason,
          status: "new",
        },
      });
      inserted += 1;
    }
  }

  revalidatePath(`/sites/${siteId}/backlinks`);
  return {
    ok: true as const,
    inserted,
    updated,
    total: candidates.length,
    searches: found.searchCount,
    costUsd,
  };
}

/** Draft an outreach email for a single prospect, pointing at a specific article. */
export async function draftEmailAction(prospectId: number, articleId: number) {
  const prospect = await prisma.outreachProspect.findUnique({ where: { id: prospectId } });
  if (!prospect) return { ok: false as const, error: "Prospect not found." };
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return { ok: false as const, error: "Article not found." };
  if (!article.wpUrl) {
    return { ok: false as const, error: "Pick a PUBLISHED article — drafts don't have a URL yet." };
  }
  const site = await prisma.site.findUnique({ where: { id: prospect.siteId } });
  if (!site) return { ok: false as const, error: "Site not found." };

  let result;
  try {
    result = await draftOutreachEmail({
      prospect: {
        pageTitle: prospect.pageTitle,
        url: prospect.url,
        snippet: prospect.snippet,
        domain: prospect.domain,
      },
      article: {
        title: article.title,
        url: article.wpUrl,
        metaDescription: article.metaDescription,
      },
      site: {
        name: site.name,
        niche: site.niche,
        expertVoice: site.expertVoice,
      },
    });
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }

  await prisma.outreachProspect.update({
    where: { id: prospectId },
    data: {
      draftSubject: result.subject,
      draftBody: result.body,
      status: prospect.status === "new" ? "drafted" : prospect.status,
      targetArticleId: articleId,
    },
  });

  revalidatePath(`/sites/${prospect.siteId}/backlinks`);
  return { ok: true as const, subject: result.subject, body: result.body, costUsd: result.costUsd };
}

/** Update prospect status (sent / replied / won / dead) and optional notes/contact email. */
export async function updateProspectAction(
  prospectId: number,
  patch: Partial<{ status: string; notes: string; contactEmail: string }>,
) {
  const prospect = await prisma.outreachProspect.findUnique({ where: { id: prospectId } });
  if (!prospect) return { ok: false as const, error: "Prospect not found." };

  const data: Record<string, unknown> = { ...patch };
  if (patch.status === "sent" && !prospect.sentAt) data.sentAt = new Date();
  if (patch.status === "replied" && !prospect.repliedAt) data.repliedAt = new Date();
  if (patch.status === "won" && !prospect.linkedAt) data.linkedAt = new Date();

  await prisma.outreachProspect.update({ where: { id: prospectId }, data });
  revalidatePath(`/sites/${prospect.siteId}/backlinks`);
  return { ok: true as const };
}

export async function deleteProspectAction(prospectId: number) {
  const prospect = await prisma.outreachProspect.findUnique({ where: { id: prospectId } });
  if (!prospect) return;
  await prisma.outreachProspect.delete({ where: { id: prospectId } });
  revalidatePath(`/sites/${prospect.siteId}/backlinks`);
}

export async function deleteAllProspectsForSite(siteId: number) {
  await prisma.outreachProspect.deleteMany({ where: { siteId } });
  revalidatePath(`/sites/${siteId}/backlinks`);
  redirect(`/sites/${siteId}/backlinks`);
}
