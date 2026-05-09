import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";

export default async function SiteActivityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const id = Number(siteId);
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site) notFound();

  const runs = await prisma.run.findMany({
    where: { siteId: id },
    orderBy: { id: "desc" },
    take: 200,
    include: { article: { select: { id: true, title: true } } },
  });

  return (
    <>
      <PageHeader
        title={`Activity · ${site.name}`}
        subtitle={`${runs.length} events`}
        actions={
          <Link href="/activity" className="text-sm">
            ← all sites
          </Link>
        }
      />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Action</Th>
              <Th>Status</Th>
              <Th>Detail</Th>
              <Th>Article</Th>
              <Th align="right">Cost</Th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted text-center py-6 text-sm">
                  No activity yet for this site.
                </td>
              </tr>
            ) : (
              runs.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <Td muted>{r.startedAt.toISOString().slice(0, 16).replace("T", " ")}</Td>
                  <Td muted>{r.action}</Td>
                  <Td>
                    <Pill status={r.status}>{r.status}</Pill>
                  </Td>
                  <Td muted>
                    <span className="block max-w-[30rem] overflow-hidden text-ellipsis whitespace-nowrap">
                      {r.message}
                    </span>
                  </Td>
                  <Td muted>
                    {r.article ? (
                      <Link href={`/articles/${r.article.id}`}>
                        {r.article.title || `#${r.article.id}`}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td align="right" muted>
                    ${r.costUsd.toFixed(3)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className="text-muted font-semibold text-[0.7rem] uppercase tracking-wider py-2.5 px-3 border-b border-border"
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
      className={`py-2.5 px-3 ${muted ? "text-muted text-xs" : ""}`}
      style={{ textAlign: align ?? "left" }}
    >
      {children}
    </td>
  );
}
