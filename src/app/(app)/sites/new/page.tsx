import { createSiteAction } from "@/actions/sites";
import { SiteForm } from "@/components/SiteForm";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SiteForm action={createSiteAction} error={error} />;
}
