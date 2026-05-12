import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";

export const dynamic = "force-dynamic";

function startOfDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

export default async function SiteAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const since7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const startBucket = startOfDayUTC(since30).getTime();

  const [v7, v30, total, daily, topArticles, topRef, uniques] = await Promise.all([
    prisma.pageView.count({ where: { siteId, isBot: false, createdAt: { gte: since7 } } }),
    prisma.pageView.count({ where: { siteId, isBot: false, createdAt: { gte: since30 } } }),
    prisma.pageView.count({ where: { siteId, isBot: false } }),
    prisma.pageView.findMany({
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["articleId"],
      where: { siteId, isBot: false, articleId: { not: null }, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 20,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    prisma.pageView.findMany({
      where: { siteId, isBot: false, createdAt: { gte: since30 } },
      select: { ipHash: true },
      distinct: ["ipHash"],
    }),
  ]);

  const buckets: number[] = Array.from({ length: 30 }, () => 0);
  for (const v of daily) {
    const idx = Math.floor((startOfDayUTC(v.createdAt).getTime() - startBucket) / (24 * 3600 * 1000));
    if (idx >= 0 && idx < 30) buckets[idx]++;
  }

  const aIds = topArticles.map((r) => r.articleId!).filter(Boolean);
  const articles = aIds.length
    ? await prisma.article.findMany({
        where: { id: { in: aIds } },
        select: { id: true, title: true, wpUrl: true, publishedAt: true },
      })
    : [];
  const artById = new Map(articles.map((a) => [a.id, a]));

  return (
    <>
      <PageHeader
        title={`${site.name} · Analytics`}
        subtitle={site.wpUrl}
        right={
          <div className="flex gap-2">
            <Link
              href={`/sites/${siteId}/analysis`}
              className="px-3 py-2 text-xs font-semibold border border-border rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline"
            >
              SEO Scorecard
            </Link>
            <Link
              href="/analytics"
              className="px-3 py-2 text-xs font-semibold border border-border rounded-lg text-muted hover:text-text hover:bg-surface-2 no-underline"
            >
              All sites
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 7d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(v7)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Views · 30d</div>
          <div className="text-3xl font-extrabold text-accent">{fmt(v30)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">Unique · 30d</div>
          <div className="text-3xl font-extrabold text-text">{fmt(uniques.length)}</div>
        </Panel>
        <Panel>
          <div className="text-muted text-xs uppercase tracking-wide mb-1">All-time</div>
          <div className="text-3xl font-extrabold text-text">{fmt(total)}</div>
        </Panel>
      </div>

      <Panel title="Daily views — last 30 days" className="mb-4">
        {total === 0 ? (
          <p className="text-muted text-sm">
            No traffic yet. Make sure the tracking snippet is installed on{" "}
            <a href={site.wpUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              {site.wpUrl}
            </a>
            . See <Link href="/analytics" className="text-accent hover:underline">/analytics</Link> for the snippet.
          </p>
        ) : (
          <svg viewBox="0 0 600 120" className="w-full h-32 block" preserveAspectRatio="none">
            {(() => {
              const max = Math.max(1, ...buckets);
              const step = 600 / 30;
              return buckets.map((v, i) => {
                const h = (v / max) * 100;
                return (
                  <rect
                    key={i}
                    x={i * step + 2}
                    y={120 - h - 4}
                    width={step - 4}
                    height={Math.max(2, h)}
                    fill="rgb(190, 242, 100)"
                    opacity={v === 0 ? 0.15 : 0.85}
                    rx="2"
                  />
                );
              });
            })()}
          </svg>
        )}
      </Panel>

      <Panel title="Top articles · 30 days" className="mb-4">
        {topArticles.length === 0 ? (
          <p className="text-muted text-sm">No article-level data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase border-b border-border">
                <th className="py-2">Article</th>
                <th className="py-2 text-right w-24">Views</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((r) => {
                const a = artById.get(r.articleId!);
                if (!a) return null;
                return (
                  <tr key={r.articleId} className="border-b border-border/40">
                    <td className="py-2">
                      <Link
                        href={`/articles/${a.id}`}
                        className="text-text hover:text-accent no-underline font-medium"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right font-bold text-accent">{fmt(r._count._all)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Top referrers · 30 days">
        {topRef.length === 0 ? (
          <p className="text-muted text-sm">No referrer data yet.</p>
        ) : (
          <ul className="text-sm space-y-1.5">
            {topRef.map((r, i) => {
              let label = r.referrer || "(direct)";
              try {
                if (r.referrer) label = new URL(r.referrer).host.replace(/^www\./, "");
              } catch {}
              return (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-text">{label}</span>
                  <b className="text-accent">{fmt(r._count._all)}</b>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
