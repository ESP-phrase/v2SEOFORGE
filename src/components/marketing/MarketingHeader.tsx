"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { StickyMobileCTA } from "@/components/marketing/StickyMobileCTA";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <>
    <StickyMobileCTA />
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-bg/85">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg no-underline shrink-0">
          <BrandMark size={32} className="shadow-glow" />
          <span>SEOForge</span>
        </Link>
        {/* Pill nav: active state gets a lime ring + bottom dot; hover lifts
            with a subtle gradient. Spacing tightened so all 7 fit cleanly. */}
        <nav className="hidden md:flex items-center gap-0.5 ml-2 text-[0.82rem] font-semibold">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname?.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-1.5 rounded-lg no-underline transition-all duration-150 ${
                  active
                    ? "text-text bg-surface-2 ring-1 ring-accent/30 shadow-[0_0_0_3px_rgba(190,248,72,0.06)]"
                    : "text-muted hover:text-text hover:bg-surface-2/70 hover:-translate-y-px"
                }`}
              >
                {n.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-1 h-1 rounded-full bg-accent shadow-[0_0_6px_rgba(190,248,72,0.9)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="text-[0.82rem] font-semibold px-3 py-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2/70 no-underline transition-colors"
          >
            Sign in
          </Link>
          <LinkButton href="/login?mode=signup">Start free</LinkButton>
        </div>
      </div>
    </header>
    </>
  );
}
