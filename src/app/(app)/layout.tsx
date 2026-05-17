import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { Clarity } from "@/components/Clarity";
import { RedditPixel } from "@/components/RedditPixel";
import { TikTokPixel } from "@/components/TikTokPixel";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // First user wins admin rights (same convention as adminQuickLoginAction
  // and /admin/live page-level check). Only the admin sees the Mission
  // Control link in the nav.
  const admin = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  const isAdmin = !!admin && admin.id === session.user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <Clarity userId={session.user.id} />
      <RedditPixel email={session.user.email ?? undefined} />
      <TikTokPixel email={session.user.email ?? undefined} />
      <div className="sticky top-0 z-30 px-3 md:px-6 pt-3 pb-2 bg-gradient-to-b from-bg via-bg/95 to-bg/0">
        <div className="max-w-[1600px] mx-auto">
          <TopBar
            username={session.user.email ?? session.user.name ?? "Account"}
            isAdmin={isAdmin}
          />
        </div>
      </div>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
