"use client";

import { useState } from "react";

/**
 * Tap-to-copy ad copy library. Each row has a Copy button; on click the
 * text lands in the clipboard and the button briefly flips to "Copied!"
 * so you can confirm before pasting into TikTok Ads Manager.
 */
const SECTIONS: { title: string; lines: string[] }[] = [
  {
    title: "Ad text — time-avoidance hooks",
    lines: [
      "Sleep. Wake up. 3 new articles ranked.",
      "Bedtime: 0 articles. Morning: 3 articles ranked.",
      "Type 1 keyword. Wake up to a ranked post.",
      "I haven't written a blog post in 6 months. My traffic doubled.",
      "5 minutes today = 75 articles a month.",
      "Set it Friday. Articles publish all weekend.",
      "My blog publishes itself while I sleep.",
      "Stop writing. Sleep more. Rank more.",
    ],
  },
  {
    title: "Ad text — feature / value hooks",
    lines: [
      "75 ranked articles to your WordPress site, on autopilot, every month.",
      "Stop writing. AI publishes 75 ranked articles a month.",
      "Your niche site on autopilot. 75 ranked articles a month.",
      "Rank #1 without writing a word.",
      "Your WordPress site, autopublished daily.",
      "Skip the writing. Keep the rankings.",
      "75 SEO articles to your site every month.",
      "$1 today gets you 75 articles a month.",
    ],
  },
  {
    title: "Destination URLs — sales landings (match ad angle to landing)",
    lines: [
      "https://www.seoforge.org/start?utm_source=tiktok&utm_content=cold",
      "https://www.seoforge.org/proof?utm_source=tiktok&utm_content=social_proof",
      "https://www.seoforge.org/pain?utm_source=tiktok&utm_content=pain_aware",
      "https://www.seoforge.org/workspace?utm_source=tiktok&utm_content=demo",
      "https://www.seoforge.org/pricing?utm_source=tiktok&utm_content=direct",
    ],
  },
  {
    title: "Destination URLs — per ad-set tracking",
    lines: [
      "https://www.seoforge.org/pricing?utm_source=tiktok&utm_content=adset_1",
      "https://www.seoforge.org/pricing?utm_source=tiktok&utm_content=niche_affiliate",
      "https://www.seoforge.org/pricing?utm_source=tiktok&utm_content=side_hustle",
    ],
  },
  {
    title: "Short hooks (for quick A/B tweaks)",
    lines: [
      "Stop writing. Start ranking.",
      "WordPress, on autopilot.",
      "75 articles / month.",
      "Cancel anytime.",
    ],
  },
];

export function CopyList() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Ad copy</h1>
          <p className="text-muted text-sm mt-1">
            Tap any row to copy. Paste into TikTok Ads Manager.
          </p>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-[0.7rem] uppercase tracking-wider font-bold text-muted-2 mb-3">
              {s.title}
            </h2>
            <ul className="space-y-2">
              {s.lines.map((line) => (
                <Row key={line} text={line} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Row({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers — select+execCommand
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* give up gracefully */
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleCopy}
        className="group w-full text-left flex items-center gap-3 bg-card-grad border border-border hover:border-accent-border rounded-xl px-4 py-3 transition-colors"
      >
        <span className="flex-1 text-text text-sm break-words font-mono">{text}</span>
        <span
          className={`shrink-0 text-[0.7rem] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${
            copied
              ? "bg-accent text-black"
              : "bg-surface-2 text-muted group-hover:bg-accent group-hover:text-black"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </span>
      </button>
    </li>
  );
}
