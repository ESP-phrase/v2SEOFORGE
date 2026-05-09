"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updatePostHtml } from "@/lib/wordpress";
import { publishExistingDraft } from "@/lib/runner";

function wordCount(html: string): number {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ");
  return stripped.split(/\s+/).filter(Boolean).length;
}

export async function saveArticleHtmlAction(articleId: number, formData: FormData) {
  const html = String(formData.get("html") ?? "");
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) redirect("/");

  await prisma.article.update({
    where: { id: articleId },
    data: { html, wordCount: wordCount(html) },
  });

  if (article.status === "published" && article.wpPostId) {
    const site = await prisma.site.findUnique({ where: { id: article.siteId } });
    if (site) {
      try {
        await updatePostHtml(article.wpPostId, html, {
          wpUrl: site.wpUrl,
          wpUsername: site.wpUsername,
          wpAppPasswordEnc: site.wpAppPasswordEnc,
        });
      } catch {
        // Surface the failure on the article page redirect for now; we still
        // saved locally so the user can retry.
        revalidatePath(`/articles/${articleId}`);
        redirect(`/articles/${articleId}?error=wp-update-failed`);
      }
    }
  }

  revalidatePath(`/articles/${articleId}`);
  redirect(`/articles/${articleId}?saved=1`);
}

export async function saveArticleMetaAction(articleId: number, formData: FormData) {
  const meta = String(formData.get("metaDescription") ?? "").trim();
  await prisma.article.update({
    where: { id: articleId },
    data: { metaDescription: meta },
  });
  revalidatePath(`/articles/${articleId}`);
  redirect(`/articles/${articleId}?saved=1`);
}

export async function publishDraftAction(articleId: number, formData: FormData) {
  const html = String(formData.get("html") ?? "").trim();
  if (html) {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (article && html !== article.html) {
      await prisma.article.update({
        where: { id: articleId },
        data: { html, wordCount: wordCount(html) },
      });
    }
  }

  const result = await publishExistingDraft(articleId);
  revalidatePath(`/articles/${articleId}`);
  if (!result.ok) {
    redirect(`/articles/${articleId}?error=${encodeURIComponent(result.error ?? "publish failed")}`);
  }
  redirect(`/articles/${articleId}?published=1`);
}

export async function deleteArticleAction(articleId: number) {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) redirect("/");
  await prisma.article.delete({ where: { id: articleId } });
  revalidatePath(`/sites/${article!.siteId}`);
  redirect(`/sites/${article!.siteId}`);
}
