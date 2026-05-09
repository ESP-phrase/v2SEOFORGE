import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardTitle } from "@/components/Card";
import { ResearchForm } from "@/components/ResearchForm";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  return (
    <>
      <PageHeader
        title="Keyword research"
        subtitle={
          <>
            {site.name} · niche: <em>{site.niche || "unset"}</em>
          </>
        }
      />
      <Card>
        <CardTitle
          title="Generate keyword candidates"
          desc="Claude proposes long-tail keywords a new domain can realistically rank for"
        />
        <ResearchForm siteId={siteId} />
      </Card>
    </>
  );
}
