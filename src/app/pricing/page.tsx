"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";
import { startCheckoutAction } from "@/actions/billing";

type Tier = {
  name: string;
  tagline: string;
  trialFee: number;     // one-time charged today (in USD)
  priceMo: number;      // billed/mo after 14-day trial
  priceYr: number;      // billed/mo equivalent on annual cadence
  accent: boolean;
  cta: string;
  articles: string;
  sites: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Hobby",
    tagline: "For a single niche site or weekend project.",
    trialFee: 1,
    priceMo: 14.99,
    priceYr: 12,        // ~20% off, billed $144/yr
    accent: false,
    cta: "Start $1 trial",
    articles: "10 articles / mo",
    sites: "1 site",
    features: [
      "AI keyword research",
      "Claude-powered article generation",
      "Quality gates + drafts review",
      "WordPress auto-publish",
      "Activity log + cost tracking",
      "Hosted Claude — no API key needed",
    ],
  },
  {
    name: "Operator",
    tagline: "Run a portfolio of niche sites on autopilot.",
    trialFee: 1,
    priceMo: 27,
    priceYr: 21,
    accent: true,
    cta: "Start $1 trial",
    articles: "150 articles / mo",
    sites: "Up to 10 sites",
    features: [
      "Everything in Hobby",
      "Daily cron auto-publish",
      "SERP & entity research",
      "Backlink outreach workflow",
      "Internal-link graph",
      "Self-hosted page-view analytics",
      "Email support · 24h",
    ],
  },
  {
    name: "Agency",
    tagline: "Manage client sites with usage-based caps.",
    trialFee: 1,
    priceMo: 149,
    priceYr: 119,
    accent: false,
    cta: "Start $1 trial",
    articles: "1,000 articles / mo",
    sites: "Unlimited sites",
    features: [
      "Everything in Operator",
      "Google Search Console integration",
      "Per-site daily caps & schedules",
      "White-label client reports",
      "Team seats (up to 5)",
      "Priority Claude capacity",
      "Slack support · 4h",
      "Onboarding call + SEO audit",
    ],
  },
];

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "WordPress auto-publish", values: [true, true, true] },
  { label: "AI keyword research (Claude)", values: [true, true, true] },
  { label: "SERP gap analysis", values: [true, true, true] },
  { label: "Internal linking", values: [true, true, true] },
  { label: "Page-view analytics", values: [false, true, true] },
  { label: "Google Search Console", values: [false, false, true] },
  { label: "Backlink outreach AI drafts", values: [false, true, true] },
  { label: "Daily cron auto-publish", values: [false, true, true] },
  { label: "Team seats", values: ["1", "3", "up to 5"] },
  { label: "Support SLA", values: ["Community", "Email · 24h", "Slack · 4h"] },
];

const FAQ = [
  {
    q: "Do I bring my own AI keys, or is it included?",
    a: "Hobby uses your own Anthropic API key (transparent costs, ~$0.30–$0.80 per article). Operator and Agency include managed Claude capacity with priority access — no API key needed.",
  },
  {
    q: "What counts as an “article”?",
    a: "One generated, fact-checked, internally-linked article of 1,000+ words, published to WordPress. Drafts that fail quality gates and aren't published don't count.",
  },
  {
    q: "Can I exceed my monthly cap?",
    a: "Yes — overage is $0.20/article on Operator and $0.10/article on Agency. We notify at 80% so nothing catches you by surprise.",
  },
  {
    q: "Is the content actually good, or is it generic AI slop?",
    a: "Every article is built from real SERP analysis, runs through quality gates (word count, headings, FAQ, schema, internal links), and uses Claude Sonnet 4.6 — not a cheap model. Generic AI tools produce 600-word fluff; SEOForge produces 1,500-word articles with TL;DR boxes, callouts, comparison tables, and pull-quotes.",
  },
  {
    q: "Can I self-host?",
    a: "Yes — the entire codebase is open. Self-hosting is free forever; you just pay your own Vercel + Neon + Anthropic bills. Hosted plans save you the setup and add managed cron + email.",
  },
  {
    q: "Will Google penalize AI content?",
    a: "Google penalizes low-quality content, not AI per se. SEOForge generates content that meets E-E-A-T signals (author bios, schema, citations, originality from SERP gaps). We recommend 1–3 articles/day on new domains to stay safe.",
  },
  {
    q: "Cancel anytime?",
    a: "Yes. No contracts. Cancel from the dashboard, keep access through the end of the billing period, then your articles stay on your WordPress site forever — they're yours.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Pay for <span className="text-accent">results, not seats.</span>
          </h1>
          <p className="text-muted text-base mt-3">
            Pick your plan. 14-day paid trial · Cancel anytime.
          </p>
          <Suspense fallback={null}>
            <PricingErrorBanner />
          </Suspense>
        </div>

        {/* Billing toggle — true switch with sliding knob */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`text-sm font-bold transition-colors ${
              !annual ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full bg-surface-2 border border-border transition-colors"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-accent shadow-glow transition-all ${
                annual ? "left-[30px]" : "left-0.5"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`text-sm font-bold transition-colors flex items-center gap-2 ${
              annual ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Annual
            <span className="bg-accent text-black text-[0.6rem] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Save 20%
            </span>
          </button>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {TIERS.map((t) => {
            const price = annual ? t.priceYr : t.priceMo;
            const strike = annual ? t.priceMo : null;
            return (
              <div
                key={t.name}
                className={`relative rounded-2xl p-7 border ${
                  t.accent
                    ? "border-accent bg-card-grad shadow-glow"
                    : "border-border bg-card-grad"
                }`}
              >
                {t.accent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.65rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </div>
                ) : null}
                <div className="text-xs text-muted font-bold uppercase tracking-wider">
                  {t.name}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold tracking-tight text-accent">
                    ${t.trialFee}
                  </span>
                  <span className="text-muted text-sm">Today</span>
                </div>
                <div className="text-muted text-xs mt-1.5">
                  then{" "}
                  <span className="text-text font-bold">
                    ${Number.isInteger(price) ? price : price.toFixed(2)}/mo
                  </span>{" "}
                  {strike ? (
                    <span className="text-muted-2 line-through">
                      ${Number.isInteger(strike) ? strike : strike.toFixed(2)}/mo
                    </span>
                  ) : null}
                </div>
                <p className="text-muted text-sm mt-4 mb-5">{t.tagline}</p>

                <div className="bg-accent-dim border border-accent-border rounded-xl p-3 mb-5">
                  <div className="text-accent text-base font-extrabold">{t.articles}</div>
                  <div className="text-muted text-xs mt-0.5">{t.sites}</div>
                </div>

                <ul className="space-y-2 text-sm mb-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check />
                      <span className="text-text/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <form
                  action={startCheckoutAction}
                  onSubmit={() => {
                    console.log(`[pricing] Start trial click plan=${t.name.toLowerCase()} cadence=${annual ? "annual" : "monthly"}`);
                    // Browser-pixel mid-funnel events. Value reports the
                    // immediate cash collected (trial fee) so attribution
                    // matches what Stripe actually charges today.
                    const value = t.trialFee;
                    try {
                      const w = window as unknown as { ttq?: { track?: (e: string, p: Record<string, unknown>) => void } };
                      const props = {
                        value,
                        currency: "USD",
                        content_name: `${t.name} plan`,
                        content_id: t.name.toLowerCase(),
                        content_type: "product",
                      };
                      w.ttq?.track?.("AddToCart", props);
                      w.ttq?.track?.("InitiateCheckout", props);
                      w.ttq?.track?.("AddPaymentInfo", props);
                    } catch { /* ignore */ }
                    try {
                      const w = window as unknown as { rdt?: (e: string, a: string, p: Record<string, unknown>) => void };
                      w.rdt?.("track", "AddToCart", { value, currency: "USD", itemCount: 1 });
                    } catch { /* ignore */ }
                  }}
                >
                  <input type="hidden" name="plan" value={t.name.toLowerCase()} />
                  <input type="hidden" name="cadence" value={annual ? "annual" : "monthly"} />
                  <button
                    type="submit"
                    className={`w-full px-4 py-3 text-sm font-extrabold rounded-xl transition-all ${
                      t.accent
                        ? "bg-accent text-black hover:bg-accent/90 shadow-glow"
                        : "bg-surface-2 text-text border border-border hover:bg-surface-3"
                    }`}
                  >
                    {t.cta}
                  </button>
                </form>
                <div className="mt-3 text-center text-muted-2 text-xs">
                  Cancel anytime during trial
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-24">
          {[
            {
              icon: <ShieldIcon />,
              title: "14-day paid trial",
              body: "No credit card during trial",
            },
            {
              icon: <LockIcon />,
              title: "Secure & private",
              body: "Your data is never shared",
            },
            {
              icon: <RefreshIcon />,
              title: "Cancel anytime",
              body: "No questions asked",
            },
          ].map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-dim border border-accent-border grid place-items-center text-accent shrink-0">
                {t.icon}
              </div>
              <div>
                <div className="text-text text-sm font-bold">{t.title}</div>
                <div className="text-muted text-xs">{t.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison matrix */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight">
            Compare features
          </h2>
          <p className="text-muted text-center mb-8">
            Everything you get on each plan, side by side.
          </p>
          <div className="bg-card-grad border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/30">
                  <th className="text-left py-4 px-5 text-muted text-xs uppercase tracking-wider font-bold">
                    Feature
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.name}
                      className={`text-center py-4 px-3 text-sm font-extrabold ${
                        t.accent ? "text-accent" : "text-text"
                      }`}
                    >
                      <div className="inline-flex flex-col items-center gap-1">
                        {t.name}
                        {t.accent ? (
                          <span className="bg-accent text-black text-[0.55rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                            Most popular
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-surface-2/20" : ""}>
                    <td className="py-3.5 px-5 text-text">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-3.5 px-3 text-center">
                        {v === true ? (
                          <span className="text-accent font-bold text-lg">✓</span>
                        ) : v === false ? (
                          <span className="text-muted-2">—</span>
                        ) : (
                          <span className="text-text text-xs font-semibold">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stat row */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <DocIcon />,
                stat: "1,000+",
                label: "articles published",
                blurb: "across hobby, blog, and agency portfolios",
              },
              {
                icon: <DollarIcon />,
                stat: "<$0.50",
                label: "cost per article",
                blurb: "with our default Claude Sonnet 4.6 setup",
              },
              {
                icon: <CalendarIcon />,
                stat: "14 days",
                label: "to first ranked page",
                blurb: "median for new sites with steady publishing",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card-grad border border-border rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-dim border border-accent-border grid place-items-center text-accent shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-accent leading-none">{s.stat}</div>
                  <div className="text-text font-bold mt-1.5">{s.label}</div>
                  <div className="text-muted text-xs mt-1">{s.blurb}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ schema for Google rich result */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted text-center mb-8">
            Still on the fence? These usually help.
          </p>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group bg-card-grad border border-border rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-semibold text-text">
                  <span>{item.q}</span>
                  <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-muted text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Stop writing. <span className="text-accent">Start ranking.</span>
          </h2>
          <p className="text-muted text-lg mb-6">
            Spin up your first site, queue a handful of keywords,
            <br className="hidden md:inline" />
            and have your first article live on WordPress in under 10 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/login?mode=signup" variant="primary">
              Start free →
            </LinkButton>
            <Link
              href="/features"
              className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-text no-underline border border-border rounded-xl bg-surface-2/40 hover:bg-surface-2"
            >
              See how it works
            </Link>
          </div>
          <p className="text-muted-2 text-xs mt-6">
            No credit card on Hobby. 14-day free trial on paid plans. Cancel anytime.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

function PricingErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mt-4 mx-auto max-w-xl bg-[rgba(248,113,113,0.10)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-4 py-3 text-sm text-left"
    >
      {error}
    </div>
  );
}

function Check() {
  return (
    <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-accent-dim mt-0.5 shrink-0" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <polyline points="21 3 21 8 16 8" />
      <polyline points="3 21 3 16 8 16" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
