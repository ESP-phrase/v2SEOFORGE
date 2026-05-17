import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Everything in one workspace — SEOForge",
  description:
    "Research, create, publish, and track in one place. A clean, powerful environment for focused SEO content creation.",
  alternates: { canonical: "/workspace" },
  robots: { index: false, follow: true },
};

const FEATURES = [
  { icon: <SearchIcon />, t: "Research smarter", b: "Find winning keywords and analyze SERPs in seconds." },
  { icon: <PencilIcon />, t: "Create faster", b: "Write, optimize, and score content with AI." },
  { icon: <SendIcon />, t: "Publish confidently", b: "Publish across sites with ease." },
  { icon: <BarsIcon />, t: "Track results", b: "Monitor rankings, traffic, and ROI in real time." },
];

export default function WorkspacePage() {
  const cta = "/pricing?utm_content=workspace_page";
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 md:px-10 py-6 md:py-10 flex flex-col">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-4">
            One workspace · zero context switching
          </div>
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Everything you need,
            <br className="hidden sm:inline" />{" "}
            <span className="text-accent">all in one workspace.</span>
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl mx-auto">
            Research, create, publish, and track — without juggling 6 tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <LinkButton href={cta} size="lg">Start for $1 →</LinkButton>
          </div>
        </section>

        <section className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="bg-card-grad border border-border rounded-xl p-4 flex flex-col items-start gap-3"
            >
              <span className="w-10 h-10 rounded-lg bg-accent-dim border border-accent-border grid place-items-center text-accent shrink-0">
                {f.icon}
              </span>
              <div>
                <div className="font-bold text-text text-sm leading-tight">{f.t}</div>
                <div className="text-muted text-xs mt-1 leading-snug">{f.b}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 md:mt-8 bg-card-grad border border-accent-border rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="shrink-0 w-7 h-7 rounded-full bg-accent grid place-items-center text-black font-extrabold text-sm">⚡</span>
          <div className="text-text text-sm md:text-base font-semibold">
            Built to simplify your workflow and help you{" "}
            <span className="text-accent">publish content that ranks.</span>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function BarsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="20" x2="6" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  );
}
