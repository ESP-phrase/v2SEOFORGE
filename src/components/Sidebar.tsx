"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type NavItem = { href: string; label: string; icon: string; activeKey: string };

const NAV: NavItem[] = [
  { href: "/", label: "Sites", icon: "▦", activeKey: "sites" },
  { href: "/sites/new", label: "Add site", icon: "+", activeKey: "add" },
  { href: "/activity", label: "Activity", icon: "⌘", activeKey: "activity" },
];

function activeKeyForPath(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/sites/") || pathname.startsWith("/articles/")) return "sites";
  if (pathname === "/sites/new") return "add";
  if (pathname.startsWith("/activity")) return "activity";
  return "";
}

export function Sidebar({ username }: { username?: string }) {
  const pathname = usePathname();
  const activeKey = activeKeyForPath(pathname);

  return (
    <aside className="w-60 bg-bg border-r border-border p-4 sticky top-0 h-screen hidden md:flex flex-col">
      <div className="flex items-center gap-2.5 font-extrabold text-base px-2 pb-7 tracking-tight">
        <span className="w-[30px] h-[30px] bg-accent text-black rounded-lg grid place-items-center font-black">
          A
        </span>
        <span>auto-seo</span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const isActive = activeKey === item.activeKey;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-dim text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <span className="w-4 text-center opacity-90">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 p-3.5 bg-accent-dim border border-accent-border rounded-xl">
        <div className="text-accent font-bold text-xs mb-1">Pro tip</div>
        <div className="text-muted text-xs leading-snug">
          Start with 1–2 articles/day and <strong>draft</strong> mode. Skim ~20 before flipping any
          site to auto-publish.
        </div>
      </div>

      {username ? (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 w-full px-3 py-2 bg-transparent text-muted border border-border rounded-lg text-sm font-medium hover:bg-surface-2 hover:text-text transition-colors"
        >
          Sign out · {username}
        </button>
      ) : null}
    </aside>
  );
}
