"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Mobile-only sticky CTA bar. Clarity recordings showed long, multi-page
 * marketing sessions (20+ min) ending without conversion — the user finished
 * deep on a page and the next-step CTA was off-screen. This pins one to the
 * viewport once the user has shown intent (scrolled past the hero).
 *
 * Hidden on /login and authed app pages (those don't render the marketing
 * layout anyway, but we belt-and-suspenders the path check).
 */
export function StickyMobileCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/login")) return null;

  return (
    <div
      className={`md:hidden fixed left-3 right-3 bottom-3 z-50 transition-all duration-200 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-hidden={!show}
    >
      <div className="bg-bg/95 backdrop-blur-md border border-accent-border rounded-2xl shadow-glow flex items-center gap-3 p-2.5">
        <div className="flex-1 pl-2 min-w-0">
          <div className="text-text text-sm font-bold leading-tight truncate">
            Start free in 60 sec
          </div>
          <div className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold">
            No credit card
          </div>
        </div>
        <Link
          href="/login?mode=signup"
          className="shrink-0 px-4 py-2.5 bg-accent text-black rounded-xl text-sm font-extrabold no-underline active:scale-[0.98]"
        >
          Start →
        </Link>
      </div>
    </div>
  );
}
