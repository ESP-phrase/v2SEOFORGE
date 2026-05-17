import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "75 SEO articles, autopublished — start for $1",
  description:
    "Auto-publish 75 SEO-optimized articles to your WordPress site every month. 3-day trial for $1, cancel anytime.",
  alternates: { canonical: "/start" },
  robots: { index: false, follow: true },
};

// Cold-traffic landing for TikTok ads. Compressed to a single viewport
// (hero + tight social-proof band + footer) so the CTA stays visible
// without scrolling — TikTok-clickers bounce on long pages.
export default function StartPage() {
  const cta = "/pricing?utm_content=start_page";
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 md:px-10 py-6 md:py-10 flex flex-col">
        {/* Hero — fits above the fold on every viewport */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-4">
            $1 starts your 3-day trial
          </div>
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            75 SEO articles, written +
            <br className="hidden sm:inline" />{" "}
            <span className="text-accent">published while you sleep.</span>
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl mx-auto">
            Queue a keyword. Claude writes a 1,500-word article and auto-publishes it to your WordPress site — in under 10 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[0.75rem] text-muted">
            <span className="inline-flex items-center gap-1.5"><Check /> 3-day trial</span>
            <span className="inline-flex items-center gap-1.5"><Check /> Cancel anytime</span>
            <span className="inline-flex items-center gap-1.5"><Check /> First article in 10 min</span>
          </div>
        </section>

        {/* Tight proof band — 3 stats inline, no full sections */}
        <section className="mt-8 md:mt-10">
          <div className="grid grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {[
              { v: "75", l: "Articles / mo" },
              { v: "10 min", l: "First article" },
              { v: "14 days", l: "To rank" },
              { v: "<$0.50", l: "Per article" },
            ].map((m) => (
              <div key={m.l} className="bg-bg-2 p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-extrabold text-accent tracking-tight">
                  {m.v}
                </div>
                <div className="text-muted text-[0.55rem] md:text-[0.65rem] mt-0.5 uppercase tracking-wider font-semibold">
                  {m.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-step compressed: horizontal on desktop, stacked on mobile */}
        <section className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { n: "1", t: "Connect WordPress", b: "Site URL + Application Password. 60 seconds." },
            { n: "2", t: "Queue keywords", b: "Or let Claude research them for you." },
            { n: "3", t: "Articles publish daily", b: "Cron pushes live. You sleep — they rank." },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-card-grad border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-black font-black grid place-items-center text-sm">
                {s.n}
              </span>
              <div>
                <div className="font-bold text-text text-sm leading-tight">{s.t}</div>
                <div className="text-muted text-xs mt-1 leading-snug">{s.b}</div>
              </div>
            </div>
          ))}
        </section>
      </main>

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
