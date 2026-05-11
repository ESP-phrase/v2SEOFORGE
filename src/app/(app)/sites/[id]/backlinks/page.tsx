import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { BacklinksWorkbench } from "@/components/BacklinksWorkbench";

export const dynamic = "force-dynamic";

export default async function BacklinksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const [prospects, articles] = await Promise.all([
    prisma.outreachProspect.findMany({
      where: { siteId },
      orderBy: [{ status: "asc" }, { relevanceScore: "desc" }],
      include: { targetArticle: { select: { id: true, title: true, wpUrl: true } } },
    }),
    prisma.article.findMany({
      where: { siteId, status: "published" },
      select: { id: true, title: true, wpUrl: true },
      orderBy: { id: "desc" },
    }),
  ]);

  const stats = {
    total: prospects.length,
    new: prospects.filter((p) => p.status === "new").length,
    drafted: prospects.filter((p) => p.status === "drafted").length,
    sent: prospects.filter((p) => p.status === "sent").length,
    replied: prospects.filter((p) => p.status === "replied").length,
    won: prospects.filter((p) => p.status === "won").length,
  };

  return (
    <>
      <PageHeader
        title={`Backlinks · ${site.name}`}
        subtitle={
          <>
            Find resource-page prospects, get AI-scored linkability, draft
            personalised outreach. &nbsp; · &nbsp;{" "}
            <Link href={`/sites/${siteId}`}>back to site</Link>
          </>
        }
      />

      <BacklinksWorkbench
        siteId={siteId}
        prospects={prospects.map((p) => ({
          id: p.id,
          url: p.url,
          domain: p.domain,
          pageTitle: p.pageTitle,
          snippet: p.snippet,
          searchSeed: p.searchSeed,
          relevanceScore: p.relevanceScore,
          scoreReason: p.scoreReason,
          status: p.status,
          contactEmail: p.contactEmail,
          draftSubject: p.draftSubject,
          draftBody: p.draftBody,
          notes: p.notes,
          targetArticleId: p.targetArticleId,
          targetArticleTitle: p.targetArticle?.title ?? null,
        }))}
        articles={articles.map((a) => ({
          id: a.id,
          title: a.title,
          wpUrl: a.wpUrl ?? "",
        }))}
        stats={stats}
      />
    </>
  );
}
