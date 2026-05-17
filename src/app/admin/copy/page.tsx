import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CopyList } from "./CopyList";

export const dynamic = "force-dynamic";

/**
 * Admin-only quick-access page with copy-to-clipboard buttons for the ad
 * creative text variants. Lets you tap once to copy each line into TikTok
 * Ads Manager without fighting markdown formatting.
 */
export default async function AdCopyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin/copy");
  const admin = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!admin || admin.id !== session.user.id) redirect("/dashboard");

  return <CopyList />;
}
