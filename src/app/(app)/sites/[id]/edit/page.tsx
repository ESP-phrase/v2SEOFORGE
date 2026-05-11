import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateSiteAction, deleteSiteAction } from "@/actions/sites";
import { SiteForm } from "@/components/SiteForm";
import { Button } from "@/components/Button";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteId = Number(id);
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const update = updateSiteAction.bind(null, siteId);
  const remove = deleteSiteAction.bind(null, siteId);

  return (
    <>
      <SiteForm action={update} site={site} />
      <div className="bg-surface border border-border rounded-xl p-5 mt-5 max-w-4xl">
        <h3 className="text-base font-bold mb-1 text-danger">Danger zone</h3>
        <p className="text-muted text-sm mb-3">
          Deletes this site, all its keywords, articles, and run history. The WordPress site
          itself is not touched.
        </p>
        <form action={remove}>
          <Button type="submit" variant="danger">Delete site</Button>
        </form>
      </div>
    </>
  );
}
