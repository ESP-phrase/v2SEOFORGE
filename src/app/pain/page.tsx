import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The pain before SEOForge",
  description:
    "Managing SEO content is messy. SEOForge fixes the 6 things that slow you down most.",
  alternates: { canonical: "/pain" },
  robots: { index: false, follow: true },
};

const PAINS = [
  { t: "Too many tools", b: "Juggling platforms for research, writing, analytics, publishing." },
  { t: "Scattered workflow", b: "Ideas, drafts, keywords live in different places." },
  { t: "Hard to track results", b: "Can't see what's working. Rankings + ROI are a struggle." },
  { t: "Slow content process", b: "Research, writing, editing, optimization take forever." },
  { t: "Publishing friction", b: "Formatting, linking, scheduling eats up valuable time." },
  { t: "No clear overview", b: "No centralized dashboard for projects, content, performance." },
];

export default function PainPage() {
  const cta = "/pricing?utm_content=pain_page";
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 md:px-10 py-6 md:py-10 flex flex-col">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-danger/15 text-danger border border-danger/30 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-4">
            6 things that kill SEO momentum
          </div>
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            The pain before{" "}
            <span className="text-accent">SEOForge.</span>
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl mx-auto">
            Managing SEO content is messy, time-consuming, and overwhelming.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <LinkButton href={cta} size="lg">Fix it all for $1 →</LinkButton>
          </div>
        </section>

        <section className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAINS.map((p) => (
            <div
              key={p.t}
              className="bg-card-grad border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-danger/15 border border-danger/30 grid place-items-center text-danger font-extrabold text-xs">
                ✕
              </span>
              <div>
                <div className="font-bold text-text text-sm leading-tight">{p.t}</div>
                <div className="text-muted text-xs mt-1 leading-snug">{p.b}</div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
