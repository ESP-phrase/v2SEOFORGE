"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";

const NAV: { href: string; label: string; icon: () => React.ReactNode }[] = [
  { href: "/dashboard", label: "Sites",     icon: () => <SitesIcon /> },
  { href: "/sites/new", label: "Add site",  icon: () => <PlusIcon /> },
  { href: "/analysis",  label: "Analysis",  icon: () => <LineUpIcon /> },
  { href: "/analytics", label: "Analytics", icon: () => <BarsIcon /> },
  { href: "/backlinks", label: "Backlinks", icon: () => <LinkChainIcon /> },
  { href: "/haro",      label: "HARO",      icon: () => <MicIcon /> },
  { href: "/activity",  label: "Activity",  icon: () => <PulseIcon /> },
  { href: "/pricing",   label: "Pricing",   icon: () => <TagIcon /> },
];

export function TopBar({ username, isAdmin }: { username?: string; isAdmin?: boolean }) {
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

  const initial = (username ?? "A").trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="relative bg-black rounded-2xl shadow-[0_0_60px_-20px_rgba(190,248,72,0.4)]">
      <div className="px-3 md:px-4 py-2 flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-extrabold no-underline shrink-0 px-1.5"
        >
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none" aria-hidden className="drop-shadow-[0_0_8px_rgba(190,248,72,0.45)]">
            <defs>
              <linearGradient id="tb-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4ff7a" />
                <stop offset="55%" stopColor="#b3f048" />
                <stop offset="100%" stopColor="#7bbf3a" />
              </linearGradient>
            </defs>
            <path
              d="M50 22 a11 11 0 0 0 -11 -11 h-14 a11 11 0 0 0 0 22 h14 a11 11 0 0 1 0 22 h-14 a11 11 0 0 1 -11 -11"
              stroke="url(#tb-grad)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline text-lg tracking-tight leading-none">
            <span className="text-text">SEO</span>
            <span className="text-accent">Forge</span>
          </span>
        </Link>

        {/* Nav — icon-prefixed pills */}
        <nav className="flex items-center gap-0.5 ml-3 text-[0.82rem] font-semibold">
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                onClick={active ? handleActiveClick : undefined}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl no-underline transition-all duration-150 ${
                  active
                    ? "text-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgba(190,248,72,0.35),0_0_18px_-4px_rgba(190,248,72,0.45)]"
                    : "text-muted hover:text-text hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 grid place-items-center ${active ? "text-accent" : "text-muted group-hover:text-text"}`}
                  aria-hidden
                >
                  {n.icon()}
                </span>
                <span>{n.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(190,248,72,0.9)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <Link
              href="/admin/live"
              title="Mission Control — live traffic & checkout funnel"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.78rem] font-semibold no-underline transition-colors ${
                pathname?.startsWith("/admin")
                  ? "text-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgba(190,248,72,0.35)]"
                  : "text-muted hover:text-text hover:bg-white/[0.04]"
              }`}
            >
              <span className="relative flex w-1.5 h-1.5" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-accent" />
              </span>
              Live
            </Link>
          ) : null}
          {username ? (
            <>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent text-black rounded-xl text-[0.82rem] font-extrabold no-underline hover:bg-accent/90 transition-colors shadow-[0_0_20px_-4px_rgba(190,248,72,0.7)]"
              >
                <BoltIcon />
                Upgrade
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[0.82rem] font-semibold text-text bg-white/[0.03] border border-white/10 rounded-xl no-underline hover:bg-white/[0.06] transition-colors"
              >
                <CardIcon />
                Billing
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors"
                  title="Sign out"
                >
                  <span className="w-7 h-7 rounded-full bg-accent grid place-items-center text-[0.7rem] font-black text-black shrink-0">
                    {initial}
                  </span>
                  <span className="leading-tight text-left min-w-0">
                    <span className="block text-[0.7rem] font-semibold text-text truncate max-w-[180px]">
                      {username}
                    </span>
                    <span className="block text-[0.55rem] text-muted uppercase tracking-wider font-bold">
                      Sign out
                    </span>
                  </span>
                  <ChevronDownIcon />
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function SitesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function LineUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}
function BarsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  );
}
function LinkChainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-muted ml-1 shrink-0" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
