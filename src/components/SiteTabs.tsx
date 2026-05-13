"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Persistent tab strip across every /sites/[id]/* page. Surfaces all the
 * per-site tools so they're discoverable from anywhere inside a site.
 */
const TABS = [
  { slug: "", label: "Overview", icon: "◉" },
  { slug: "research", label: "Research", icon: "⚡" },
  { slug: "cluster", label: "Clusters", icon: "🕸" },
  { slug: "published", label: "Articles", icon: "📄" },
  { slug: "analysis", label: "Analysis", icon: "📊" },
  { slug: "analytics", label: "Analytics", icon: "📈" },
  { slug: "backlinks", label: "Outreach", icon: "✉" },
  { slug: "anchors", label: "Anchors", icon: "⚓" },
];

export function SiteTabs({ siteId, siteName }: { siteId: number; siteName?: string }) {
  const pathname = usePathname();
  const base = `/sites/${siteId}`;
  const current = pathname.replace(base, "").split("/")[1] ?? "";

  return (
    <div className="mb-5 sticky top-0 z-10 bg-bg pt-1 -mx-2 px-2">
      {siteName ? (
        <div className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold mb-1.5 px-1">
          {siteName}
        </div>
      ) : null}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
        {TABS.map((t) => {
          const href = t.slug ? `${base}/${t.slug}` : base;
          const active = current === t.slug;
          return (
            <Link
              key={t.slug || "overview"}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap no-underline transition-colors ${
                active
                  ? "bg-accent text-black"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
