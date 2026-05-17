import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real results — SEOForge",
  description:
    "From low visibility to top rankings. Real feedback from operators publishing 75+ ranked articles a month, 14 days to first ranked page.",
  alternates: { canonical: "/proof" },
  robots: { index: false, follow: true },
};

const TESTIMONIALS = [
  {
    name: "Jason M.",
    role: "SEO Consultant",
    quote:
      "SEOForge has completely changed how I manage SEO content. It's fast, easy, and delivers results.",
  },
  {
    name: "Sarah T.",
    role: "Marketing Manager",
    quote:
      "I published 50+ articles in one month and saw our traffic grow by 214%. SEOForge makes it so simple.",
  },
  {
    name: "Daniel R.",
    role: "Agency Owner",
    quote:
      "As an agency, SEOForge saves us hours every week. Our clients love the results.",
  },
];

export default function ProofPage() {
  const cta = "/pricing?utm_content=proof_page";
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
          <span className="text-accent">Loved</span> by marketers, agencies, and creators.
        </h1>
        <p className="text-muted text-lg mt-4 max-w-xl mx-auto">
          Real feedback from people getting <span className="text-text font-bold">real results</span>.
        </p>
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-10 pb-12 space-y-4">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            className="bg-card-grad border border-border rounded-2xl p-6 md:p-7 flex items-start gap-5"
          >
            <div className="w-14 h-14 rounded-full bg-accent-dim border-2 border-accent grid place-items-center font-black text-accent text-xl shrink-0">
              {t.name.charAt(0)}
            </div>
            <div className="flex-1">
              <Stars />
              <blockquote className="text-text text-base md:text-lg mt-3 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-3">
                <div className="text-accent font-bold text-sm">{t.name}</div>
                <div className="text-muted text-xs">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Before / After */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            See the difference <span className="text-accent">SEOForge</span> makes.
          </h2>
          <p className="text-muted text-base mt-2">From low visibility to top rankings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] gap-4 items-center">
          <BeforeAfterCard label="Before" tone="bad" stats={[
            { l: "Organic Traffic", v: "210 /month", trend: "down" },
            { l: "Keywords Ranked", v: "23" },
            { l: "Backlinks", v: "56", trend: "down" },
            { l: "Content Published", v: "3 /month" },
          ]} />
          <div className="text-accent text-4xl text-center hidden md:block">→</div>
          <BeforeAfterCard label="After" tone="good" stats={[
            { l: "Organic Traffic", v: "5,230 /month", trend: "up" },
            { l: "Keywords Ranked", v: "512" },
            { l: "Backlinks", v: "1,842", trend: "up" },
            { l: "Content Published", v: "48 /month" },
          ]} />
        </div>
        <p className="text-center text-muted text-sm mt-6">
          Better content. Better rankings. <span className="text-accent font-bold">Better growth.</span>
        </p>
      </section>

      {/* Trust stats */}
      <section className="max-w-[900px] mx-auto px-6 md:px-10 pb-12">
        <div className="grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "1,000+", l: "Articles Published" },
            { v: "14 Days", l: "To First Ranked Page" },
            { v: "<$0.50", l: "Cost Per Article" },
          ].map((s) => (
            <div key={s.l} className="bg-bg-2 p-6 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight">{s.v}</div>
              <div className="text-muted text-[0.65rem] mt-1 uppercase tracking-wider font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center bg-card-grad border border-accent-border rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Join 1,000+ <span className="text-accent">operators ranking faster.</span>
          </h2>
          <p className="text-muted text-base md:text-lg mb-6">
            $1 today · 3-day trial · cancel anytime.
          </p>
          <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-accent">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function BeforeAfterCard({ label, tone, stats }: {
  label: string;
  tone: "good" | "bad";
  stats: { l: string; v: string; trend?: "up" | "down" }[];
}) {
  const accent = tone === "good" ? "border-accent text-accent" : "border-danger text-danger";
  return (
    <div className="bg-card-grad border border-border rounded-2xl p-5">
      <div className={`inline-block px-3 py-1 rounded-md border ${accent} text-[0.65rem] font-extrabold uppercase tracking-wider mb-4`}>
        {label}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.l} className="bg-surface border border-border rounded-lg p-3">
            <div className="text-muted text-[0.65rem] uppercase tracking-wider font-semibold">{s.l}</div>
            <div className={`text-lg font-extrabold mt-1 ${s.trend === "up" ? "text-accent" : s.trend === "down" ? "text-danger" : "text-text"}`}>
              {s.v}
              {s.trend === "up" ? " ↑" : s.trend === "down" ? " ↓" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
