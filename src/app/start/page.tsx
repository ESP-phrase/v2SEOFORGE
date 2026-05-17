import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";
import { DashboardMockup } from "@/components/landing/DashboardMockup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "75 SEO articles, autopublished — start for $1",
  description:
    "Auto-publish 75 SEO-optimized articles to your WordPress site every month. 3-day trial for $1, cancel anytime.",
  alternates: { canonical: "/start" },
  robots: { index: false, follow: true }, // ad landing page, not for SEO
};

// Cold-traffic landing for TikTok ads. Shorter than /, removes the dense
// feature band that was bouncing curiosity clickers. Single CTA pointing
// at /pricing, with the $1 entry price hammered above the fold.
export default function StartPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      {/* Hero — hammer the $1 entry price */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wider font-bold mb-5">
            $1 starts your 3-day trial
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            75 SEO articles, written +
            <br />
            <span className="text-accent">published while you sleep.</span>
          </h1>
          <p className="text-muted text-lg md:text-xl mt-5 max-w-2xl mx-auto">
            Queue a keyword. Claude writes a 1,500-word SERP-optimized article and auto-publishes it to your WordPress site — in under 10 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <LinkButton href="/pricing?utm_content=start_page" size="lg">
              Start for $1 →
            </LinkButton>
            <Link
              href="#how"
              className="px-5 py-3.5 text-base font-semibold text-muted hover:text-text no-underline border border-border rounded-xl bg-surface-2/40 hover:bg-surface-2"
            >
              See how it works
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-5 text-[0.8rem] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Check /> 3-day trial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check /> Cancel anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check /> First article in 10 min
            </span>
          </div>
        </div>
      </section>

      {/* Product visual */}
      <section id="how" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-16 hidden md:block">
        <Link href="/pricing?utm_content=start_page" className="block no-underline cursor-pointer">
          <DashboardMockup />
        </Link>
      </section>

      {/* 3-step explanation — for the curiosity tappers */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              n: "1",
              title: "Connect your WordPress site",
              body: "Plug in your site URL and an Application Password. AES-256 encrypted. Takes 60 seconds.",
            },
            {
              n: "2",
              title: "Queue your keywords",
              body: "Type a topic or let Claude research them for you. Each gets SERP-gap analysis before writing.",
            },
            {
              n: "3",
              title: "Articles publish daily",
              body: "Cron generates, runs quality gates, pushes live to WordPress. You sleep — they rank.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-card-grad border border-border rounded-2xl p-6"
            >
              <div className="text-accent text-4xl font-extrabold leading-none mb-3">
                {s.n}
              </div>
              <div className="font-bold text-text mb-1">{s.title}</div>
              <div className="text-muted text-sm leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "<$0.50", l: "Cost per article" },
            { v: "1,500+", l: "Avg word count" },
            { v: "10 min", l: "First article live" },
            { v: "14 days", l: "Median time to rank" },
          ].map((m) => (
            <div key={m.l} className="bg-bg-2 p-6 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight">
                {m.v}
              </div>
              <div className="text-muted text-xs mt-1.5 uppercase tracking-wider font-semibold">
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center bg-card-grad border border-accent-border rounded-2xl p-8 md:p-12 shadow-glow">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            $1 today. <span className="text-accent">75 articles a month.</span>
          </h2>
          <p className="text-muted text-base md:text-lg mb-6">
            Cancel before day 3 and you're never billed beyond the $1. After that,
            the plan you pick auto-renews until you stop it.
          </p>
          <LinkButton href="/pricing?utm_content=start_page" size="lg">
            Start for $1 →
          </LinkButton>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Check() {
  return (
    <span className="inline-grid place-items-center w-3.5 h-3.5 rounded-full bg-accent-dim" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </span>
  );
}
