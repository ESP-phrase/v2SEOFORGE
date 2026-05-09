import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";
import { Pill } from "@/components/Pill";
import { LinkButton } from "@/components/Button";

async function loadSites() {
  const sites = await prisma.site.findMany({ orderBy: { name: "asc" } });
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const enriched = await Promise.all(
    sites.map(async (s) => {
      const [queued, publishedTotal, publishedToday, articlesTotal, drafts, costAgg] =
        await Promise.all([
          prisma.keyword.count({ where: { siteId: s.id, status: "queued" } }),
          prisma.article.count({ where: { siteId: s.id, status: "published" } }),
          prisma.article.count({
            where: {
              siteId: s.id,
              status: "published",
              publishedAt: { gte: todayStart },
            },
          }),
          prisma.article.count({ where: { siteId: s.id } }),
          prisma.article.count({ where: { siteId: s.id, status: "draft" } }),
          prisma.article.aggregate({
            where: { siteId: s.id, createdAt: { gte: monthStart } },
            _sum: { costUsd: true },
          }),
        ]);
      return {
        ...s,
        stats: {
          queued,
          publishedTotal,
          publishedToday,
          articlesTotal,
          drafts,
          costMonth: costAgg._sum.costUsd ?? 0,
        },
      };
    }),
  );
  return enriched;
}

async function loadGlobalStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [activeSites, queuedTotal, publishedTotal, publishedToday, costAgg] =
    await Promise.all([
      prisma.site.count({ where: { active: true } }),
      prisma.keyword.count({ where: { status: "queued" } }),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "published", publishedAt: { gte: todayStart } } }),
      prisma.article.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { costUsd: true },
      }),
    ]);
  return {
    activeSites,
    queuedTotal,
    publishedTotal,
    publishedToday,
    costMonth: costAgg._sum.costUsd ?? 0,
  };
}

export default async function HomePage() {
  const [sites, gstats] = await Promise.all([loadSites(), loadGlobalStats()]);

  if (sites.length === 0) {
    return (
      <>
        <PageHeader
          title="Sites"
          subtitle="Manage every WordPress site you publish to from one place."
        />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-[72px] h-[72px] bg-accent-dim text-accent rounded-2xl grid place-items-center text-3xl mb-5">
            ▦
          </div>
          <h2 className="text-lg font-bold mb-2">No sites yet</h2>
          <p className="text-muted max-w-md">
            Add a WordPress site and start queuing keywords. Each site has its own niche, daily
            cap, and credentials.
          </p>
          <div className="mt-6">
            <LinkButton href="/sites/new" size="lg">
              + Add your first site
            </LinkButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Sites"
        subtitle="Manage every WordPress site you publish to from one place."
        actions={
          <>
            <LinkButton href="/sites/new">+ Add site</LinkButton>
            <LinkButton href="/activity" variant="secondary">View activity</LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-5">
        <StatTile value={gstats.activeSites} label="Active sites" />
        <StatTile value={gstats.queuedTotal} label="Keywords queued" />
        <StatTile value={gstats.publishedToday} label="Published today" />
        <StatTile value={gstats.publishedTotal} label="Published total" />
        <StatTile value={`$${gstats.costMonth.toFixed(2)}`} label="API cost · month" />
      </div>

      {sites.map((s) => (
        <Link
          key={s.id}
          href={`/sites/${s.id}`}
          className="block no-underline text-current"
        >
          <div className="bg-surface border border-border rounded-xl p-5 mb-3 hover:border-border-strong hover:bg-surface-2 transition-colors">
            <div className="flex justify-between items-baseline gap-3">
              <h3 className="text-base font-bold m-0">
                {s.name}{" "}
                <span className="text-muted text-sm font-medium">/{s.slug}</span>
              </h3>
              <Pill status={s.active ? "active" : "inactive"}>
                {s.active ? "active" : "disabled"}
              </Pill>
            </div>
            <div className="text-muted text-xs mt-1">
              {s.wpUrl} &nbsp;·&nbsp; cap {s.maxPerDay}/day &nbsp;·&nbsp; publishes as{" "}
              <strong>{s.publishStatus}</strong>
            </div>
            <div className="flex gap-7 mt-3 flex-wrap text-sm text-muted">
              <span>
                <b className="text-text font-bold mr-1">{s.stats.queued}</b>queued
              </span>
              <span>
                <b className="text-text font-bold mr-1">
                  {s.stats.publishedToday}/{s.maxPerDay}
                </b>
                today
              </span>
              <span>
                <b className="text-text font-bold mr-1">{s.stats.publishedTotal}</b>published
              </span>
              <span>
                <b className="text-text font-bold mr-1">{s.stats.drafts}</b>drafts
              </span>
              <span>
                <b className="text-text font-bold mr-1">${s.stats.costMonth.toFixed(2)}</b>
                cost/mo
              </span>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
