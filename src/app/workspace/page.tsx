import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";
import { DashboardMockup } from "@/components/landing/DashboardMockup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Everything you need, all in one workspace — SEOForge",
  description:
    "A clean, powerful environment built for focused SEO content creation and better rankings. Research, create, publish, and track in one place.",
  alternates: { canonical: "/workspace" },
  robots: { index: false, follow: true },
};

const FEATURES = [
  {
    icon: <SearchIcon />,
    title: "Research smarter",
    body: "Find winning keywords and analyze SERPs in seconds.",
  },
  {
    icon: <PencilIcon />,
    title: "Create faster",
    body: "Write, optimize, and score content with AI.",
  },
  {
    icon: <SendIcon />,
    title: "Publish confidently",
    body: "Publish across sites with ease.",
  },
  {
    icon: <BarsIcon />,
    title: "Track results",
    body: "Monitor rankings, traffic, and ROI in real time.",
  },
];

export default function WorkspacePage() {
  const cta = "/pricing?utm_content=workspace_page";
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      <section className="max-w-[1300px] mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Everything you need,
              <br />
              <span className="text-accent">all in one workspace.</span>
            </h1>
            <p className="text-muted text-base md:text-lg mt-5 max-w-md">
              A clean, powerful environment built for focused SEO content creation and better rankings.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
              <Link
                href="#features"
                className="px-5 py-3.5 text-base font-semibold text-muted hover:text-text no-underline border border-border rounded-xl bg-surface-2/40 hover:bg-surface-2"
              >
                See features
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 hidden md:block">
            <Link href={cta} className="block no-underline cursor-pointer">
              <DashboardMockup />
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card-grad border border-border rounded-2xl p-6 flex items-start gap-4"
            >
              <span className="w-12 h-12 rounded-xl bg-accent-dim border border-accent-border grid place-items-center text-accent shrink-0">
                {f.icon}
              </span>
              <div>
                <div className="font-bold text-text text-lg">{f.title}</div>
                <div className="text-muted text-sm mt-1 leading-relaxed">{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-10 pb-12">
        <div className="bg-card-grad border border-accent-border rounded-2xl p-5 md:p-6 flex items-start gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-accent grid place-items-center text-black font-extrabold text-sm">
            ⚡
          </span>
          <div className="font-bold text-text text-base md:text-lg">
            Built to simplify your workflow and help you <span className="text-accent">publish content that ranks.</span>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-24">
        <div className="text-center bg-card-grad border border-accent-border rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Stop juggling 6 tools. <span className="text-accent">Use 1.</span>
          </h2>
          <p className="text-muted text-base md:text-lg mb-6">
            $1 starts your 3-day trial. Cancel anytime.
          </p>
          <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function BarsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  );
}
