import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LiveDashboard } from "./LiveDashboard";

export const dynamic = "force-dynamic";

/**
 * Mission-control dashboard for watching real-time traffic + conversions.
 * Auth-gated, and within authed users, only the first User (admin per the
 * project's "first user = admin" convention used in adminQuickLoginAction)
 * can see it. Everyone else gets bounced to /dashboard.
 */
export default async function LiveDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/admin/live");

  // First user wins admin rights. Cheap query — no extra index needed.
  const admin = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!admin || admin.id !== session.user.id) redirect("/dashboard");

  return <LiveDashboard />;
}
