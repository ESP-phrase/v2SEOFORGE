import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";

export default async function ActivityPage() {
  const runs = await prisma.run.findMany({
    orderBy: { id: "desc" },
    take: 200,
    include: {
      site: { select: { name: true, slug: true } },
      article: { select: { id: true, title: true } },
    },
  });

  if (runs.length === 0) {
    return (
      <>
        <PageHeader title="Activity" subtitle="All sites · 0 events" />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-[72px] h-[72px] bg-accent-dim text-accent rounded-2xl grid place-items-center text-3xl mb-5">
            ⌘
          </div>
          <h2 className="text-lg font-bold mb-2">No activity yet</h2>
          <p className="text-muted max-w-md">
            Once you run articles, every generation, publish, and failure shows up here with cost
            details.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Activity" subtitle={`All sites · last ${runs.length} events`} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Site</Th>
              <Th>Action</Th>
              <Th>Status</Th>
              <Th>Detail</Th>
              <Th>Article</Th>
              <Th align="right">Cost</Th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <Td muted>{r.startedAt.toISOString().slice(0, 16).replace("T", " ")}</Td>
                <Td muted>{r.site?.name ?? "—"}</Td>
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
            ))}
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
