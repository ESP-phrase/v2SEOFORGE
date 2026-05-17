"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { BrandMark } from "@/components/BrandMark";

const NAV = [
  { href: "/dashboard", label: "Sites" },
  { href: "/sites/new", label: "Add site" },
  { href: "/analysis", label: "Analysis" },
  { href: "/analytics", label: "Analytics" },
  { href: "/backlinks", label: "Backlinks" },
  { href: "/haro", label: "HARO" },
  { href: "/activity", label: "Activity" },
  { href: "/pricing", label: "Pricing" },
];

export function TopBar({ username }: { username?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard")
      return (
        pathname === "/dashboard" ||
        (pathname.startsWith("/sites/") &&
          !pathname.endsWith("/backlinks") &&
          !pathname.endsWith("/analysis") &&
          !pathname.endsWith("/analytics")) ||
        pathname.startsWith("/articles/")
      );
    if (href === "/backlinks")
      return pathname === "/backlinks" || pathname.endsWith("/backlinks");
    if (href === "/analysis")
      return pathname === "/analysis" || pathname.endsWith("/analysis");
    if (href === "/analytics")
      return pathname === "/analytics" || pathname.endsWith("/analytics");
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Clarity recordings showed users repeatedly clicking the active top-nav
  // item with no visible response (Next.js no-ops navigations to the same
  // path). Two fixes here: scroll-to-top + router.refresh() so a re-click on
  // the current section gives unambiguous feedback (server components re-run,
  // page snaps to top), and an explicit aria-current for screen readers.
  const handleActiveClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-6 px-2">
      <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-lg no-underline tracking-tight">
        <BrandMark size={34} className="shadow-glow rounded-xl" />
        <span className="hidden sm:inline">SEOForge</span>
      </Link>

      <nav className="flex gap-1 ml-2">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={active ? handleActiveClick : undefined}
              className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
                active
                  ? "bg-accent text-black shadow-glow"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {username ? (
          <>
            <Link
              href="/pricing"
              className="px-3 py-1.5 bg-accent text-black rounded-lg text-xs font-extrabold no-underline hover:bg-accent/90 transition-colors"
            >
              ⚡ Upgrade
            </Link>
            <Link
              href="/billing"
              className="px-3 py-2 text-xs font-medium text-muted hover:text-text no-underline rounded-lg hover:bg-surface-2 transition-colors"
            >
              Billing
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-3 py-2 bg-transparent text-muted border border-border rounded-lg text-xs font-medium hover:bg-surface-2 hover:text-text transition-colors"
              >
                {username} · sign out
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
