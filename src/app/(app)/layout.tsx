import { redirect } from "next/navigation";
import { auth, hasUsers } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasUsers())) redirect("/setup");
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar username={session.user.username} />
      <main className="flex-1 px-8 py-7 max-w-[1280px]">{children}</main>
    </div>
  );
}
