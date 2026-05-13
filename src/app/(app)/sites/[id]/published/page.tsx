import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { SiteTabs } from "@/components/SiteTabs";

export const dynamic = "force-dynamic";

export default async function PublishedArticlesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const articles = await prisma.article.findMany({
    where: { siteId, status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <SiteTabs siteId={siteId} siteName={site.name} />
      <PageHeader
        title={`Published articles · ${site.name}`}
        subtitle={
          <>
            {articles.length} live article{articles.length === 1 ? "" : "s"} on{" "}
            <a href={site.wpUrl} target="_blank" rel="noreferrer">
              {site.wpUrl}
            </a>
            {" · "}
            <Link href={`/sites/${siteId}`}>back to site</Link>
          </>
        }
      />

      {articles.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-accent-dim text-accent rounded-2xl grid place-items-center text-2xl mb-4">
              ↗
            </div>
            <h2 className="text-lg font-bold mb-1">No articles published yet</h2>
            <p className="text-muted max-w-md text-sm">
              Generate an article in the Run panel, review it, then click{" "}
              <strong className="text-text">Publish to WordPress</strong> on the article page.
              Once it&apos;s live, the URL will show up here.
            </p>
            <Link
              href={`/sites/${siteId}`}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black rounded-lg text-sm font-bold no-underline"
            >
              Back to site →
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Live URL</Th>
                <Th>Words</Th>
                <Th>Cost</Th>
                <Th align="right">Published</Th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <Td>
                    <Link href={`/articles/${a.id}`} className="text-text hover:text-accent">
                      {a.title}
                    </Link>
                  </Td>
                  <Td>
                    {a.wpUrl ? (
                      <a
                        href={a.wpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent font-mono text-xs break-all"
                      >
                        {a.wpUrl.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <Pill status="failed">missing URL</Pill>
                    )}
                  </Td>
                  <Td muted>{a.wordCount}</Td>
                  <Td muted>${a.costUsd.toFixed(3)}</Td>
                  <Td muted align="right">
                    {a.publishedAt
                      ? a.publishedAt.toISOString().slice(0, 10)
                      : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className="text-muted font-semibold text-[0.65rem] uppercase tracking-wider py-2.5 px-3 border-b border-border"
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  muted,
}: {
  children: React.ReactNode;
  align?: "right";
  muted?: boolean;
}) {
  return (
    <td
      className={`py-3 px-3 ${muted ? "text-muted text-xs" : ""}`}
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </td>
  );
}
