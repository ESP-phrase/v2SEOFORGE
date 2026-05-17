import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real results — SEOForge",
  description:
    "From low visibility to top rankings. Real feedback from operators publishing 75+ ranked articles a month.",
  alternates: { canonical: "/proof" },
  robots: { index: false, follow: true },
};

const TESTIMONIALS = [
  {
    name: "Jason M.",
    role: "SEO Consultant",
    quote: "SEOForge has completely changed how I manage SEO content. Fast, easy, and delivers results.",
  },
  {
    name: "Sarah T.",
    role: "Marketing Manager",
    quote: "I published 50+ articles in one month and saw our traffic grow by 214%. SEOForge makes it so simple.",
  },
  {
    name: "Daniel R.",
    role: "Agency Owner",
    quote: "As an agency, SEOForge saves us hours every week. Our clients love the results.",
  },
];

export default function ProofPage() {
  const cta = "/pricing?utm_content=proof_page";
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 md:px-10 py-6 md:py-10 flex flex-col">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-4">
            ★★★★★ — 1,000+ operators
          </div>
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            <span className="text-accent">Loved</span> by marketers, agencies, and creators.
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl mx-auto">
            Real feedback from people getting <span className="text-text font-bold">real results</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
          </div>
        </section>

        <section className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-card-grad border border-border rounded-2xl p-5 flex flex-col">
              <Stars />
              <blockquote className="text-text text-sm mt-3 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-accent-dim border border-accent grid place-items-center font-black text-accent text-sm shrink-0">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <div className="text-accent font-bold text-xs">{t.name}</div>
                  <div className="text-muted text-[0.65rem]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 md:mt-8 grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            { v: "1,000+", l: "Articles Published" },
            { v: "14 Days", l: "To First Ranked Page" },
            { v: "214%", l: "Avg traffic growth" },
          ].map((s) => (
            <div key={s.l} className="bg-bg-2 p-3 md:p-4 text-center">
              <div className="text-lg md:text-2xl font-extrabold text-accent tracking-tight">{s.v}</div>
              <div className="text-muted text-[0.55rem] md:text-[0.65rem] mt-0.5 uppercase tracking-wider font-semibold">{s.l}</div>
            </div>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-accent">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}
