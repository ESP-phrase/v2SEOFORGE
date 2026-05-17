import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const metadata = {
  title: "Page not found — SEOForge",
  description: "The page you're looking for doesn't exist. Here are some places you might be headed.",
  robots: { index: false, follow: true },
};

// Branded 404. Replaces the soft-404 chain (middleware → /login) for unknown
// routes so search engines see a real 404 and visitors get a clear path back
// to the most-visited destinations. The middleware whitelists authed-only
// prefixes so this page is reachable for any genuinely-unknown URL.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="text-center">
          <div className="text-accent text-[0.7rem] uppercase tracking-wider font-bold mb-3">
            404 — Page not found
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Looks like that page
            <br />
            <span className="text-accent">doesn't exist.</span>
          </h1>
          <p className="text-muted text-lg mt-5 max-w-md mx-auto">
            The link may be broken, the page may have moved, or you may have typed
            the URL in wrong. Try one of these instead:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <LinkButton href="/" size="lg">
              ← Back to homepage
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="lg">
              See pricing
            </LinkButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-16 max-w-2xl mx-auto">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group bg-card-grad border border-border rounded-xl p-4 no-underline hover:border-accent-border transition-colors"
            >
              <div className="text-accent text-[0.6rem] uppercase tracking-wider font-bold mb-1">
                {d.section}
              </div>
              <div className="text-text font-bold text-sm group-hover:text-accent transition-colors">
                {d.title} →
              </div>
              <div className="text-muted text-xs mt-1 leading-snug">{d.body}</div>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

const DESTINATIONS = [
  {
    section: "Get started",
    href: "/login?mode=signup",
    title: "Create an account",
    body: "Just email and password. Takes 30 seconds.",
  },
  {
    section: "Product",
    href: "/features",
    title: "Features",
    body: "Everything you can do with SEOForge.",
  },
  {
    section: "Product",
    href: "/pricing",
    title: "Pricing",
    body: "Plans from $29 to $199/mo. 14-day trial.",
  },
  {
    section: "Learn",
    href: "/blog",
    title: "Blog",
    body: "SEO playbooks, case studies, and product updates.",
  },
  {
    section: "Learn",
    href: "/docs",
    title: "Docs",
    body: "How to connect WordPress and queue keywords.",
  },
  {
    section: "Company",
    href: "/changelog",
    title: "Changelog",
    body: "What we shipped this week.",
  },
];
