import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The pain before SEOForge",
  description:
    "Managing SEO content is messy, time-consuming, and overwhelming. SEOForge fixes the 6 things that slow you down most.",
  alternates: { canonical: "/pain" },
  robots: { index: false, follow: true },
};

const PAINS = [
  {
    title: "Too many tools",
    body: "You juggle multiple platforms for research, writing, analytics, and publishing.",
  },
  {
    title: "Scattered workflow",
    body: "Ideas, drafts, and keywords live in different places, causing confusion and delays.",
  },
  {
    title: "Hard to track results",
    body: "You can't see what's working. Tracking rankings, traffic, and ROI is a struggle.",
  },
  {
    title: "Slow content process",
    body: "Research, writing, editing, and optimization take forever — killing your momentum.",
  },
  {
    title: "Publishing friction",
    body: "Formatting, linking, scheduling, and publishing across sites eats up valuable time.",
  },
  {
    title: "No clear overview",
    body: "You lack a centralized dashboard to see your projects, content, and performance at a glance.",
  },
];

export default function PainPage() {
  const cta = "/pricing?utm_content=pain_page";
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          The pain before
          <br />
          <span className="text-accent">SEOForge.</span>
        </h1>
        <p className="text-muted text-lg mt-4 max-w-xl mx-auto">
          Managing SEO content and publishing is messy, time-consuming, and overwhelming.
        </p>
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-10 pb-10 space-y-3">
        {PAINS.map((p) => (
          <div
            key={p.title}
            className="bg-card-grad border border-border rounded-2xl p-5 md:p-6 flex items-start gap-4"
          >
            <span className="shrink-0 w-7 h-7 rounded-full bg-danger/15 border border-danger/30 grid place-items-center text-danger font-extrabold text-sm">
              ✕
            </span>
            <div>
              <div className="font-bold text-text text-base md:text-lg">{p.title}</div>
              <div className="text-muted text-sm md:text-base mt-1 leading-relaxed">{p.body}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-10 pb-12">
        <div className="bg-card-grad border border-accent-border rounded-2xl p-5 md:p-6 flex items-start gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-accent grid place-items-center text-black font-extrabold text-sm">
            ★
          </span>
          <div>
            <div className="font-bold text-text text-base md:text-lg">
              Without SEOForge: <span className="italic text-muted">more chaos, less clarity, slower growth.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center bg-card-grad border border-accent-border rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Fix all 6 in <span className="text-accent">10 minutes.</span>
          </h2>
          <p className="text-muted text-base md:text-lg mb-6">
            $1 starts your 3-day trial. Connect WordPress, queue keywords, articles publish daily.
          </p>
          <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
