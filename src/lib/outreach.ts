/**
 * Backlink outreach engine.
 *
 * Workflow:
 *   1. findProspects(seed, site) → SerpApi search for resource-page intents,
 *      AI-scores each result for linkability, returns prospects.
 *   2. draftOutreachEmail(prospect, article, site) → Claude writes a tight,
 *      personalised cold-outreach email that doesn't sound like a template.
 *
 * No emails are sent automatically — the dashboard lets you review/edit each
 * draft and copy-paste send from your own mailbox. (Auto-send needs a
 * warmed-up domain + custom EMAIL_FROM; we skip that complexity here.)
 */
import { createLLMClient, resolveModel } from "@/lib/llmClient";

const ENDPOINT = "https://serpapi.com/search.json";

// Resource-page intent modifiers. We run a small batch of these per seed to
// catch the pages that actually link out — "best X resources," "Y tools list,"
// etc. — instead of the actual content rankings.
const RESOURCE_INTENT_QUERIES = (seed: string): string[] => [
  `best ${seed} resources`,
  `${seed} guide list`,
  `top ${seed} blogs 2026`,
  `${seed} tools and tips`,
  `useful ${seed} resources`,
];

const MODEL_SCORE = "claude-haiku-4-5-20251001";
const MODEL_EMAIL = "claude-sonnet-4-6";

const SCORE_PRICE_INPUT_PER_M = 1.0;
const SCORE_PRICE_OUTPUT_PER_M = 5.0;
const EMAIL_PRICE_INPUT_PER_M = 3.0;
const EMAIL_PRICE_OUTPUT_PER_M = 15.0;

export type ProspectCandidate = {
  url: string;
  domain: string;
  pageTitle: string;
  snippet: string;
  searchSeed: string;
  relevanceScore: number;
  scoreReason: string;
};

type SerpRaw = {
  organic_results?: Array<{
    position?: number;
    title?: string;
    link?: string;
    snippet?: string;
  }>;
};

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchSerpFor(query: string): Promise<SerpRaw> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY missing — required for prospect finding.");
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: apiKey,
    num: "10",
    hl: "en",
    gl: "us",
  });
  const resp = await fetch(`${ENDPOINT}?${params}`, { cache: "no-store" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SerpApi failed (${resp.status}): ${text.slice(0, 200)}`);
  }
  return (await resp.json()) as SerpRaw;
}

/**
 * Find resource-page prospects for a seed (the topic your article covers).
 * Returns up to ~30 distinct URLs across the resource-intent query batch.
 */
export async function findProspects(seed: string): Promise<{
  raw: Array<{ url: string; domain: string; pageTitle: string; snippet: string; searchSeed: string }>;
  searchCount: number;
}> {
  const queries = RESOURCE_INTENT_QUERIES(seed);
  const seen = new Set<string>();
  const out: Array<{
    url: string;
    domain: string;
    pageTitle: string;
    snippet: string;
    searchSeed: string;
  }> = [];

  for (const q of queries) {
    let raw: SerpRaw;
    try {
      raw = await fetchSerpFor(q);
    } catch {
      continue;
    }
    for (const r of raw.organic_results ?? []) {
      const url = r.link ?? "";
      if (!url) continue;
      const d = domainOf(url);
      if (!d || seen.has(url)) continue;
      seen.add(url);
      out.push({
        url,
        domain: d,
        pageTitle: r.title ?? "",
        snippet: r.snippet ?? "",
        searchSeed: q,
      });
    }
  }

  return { raw: out, searchCount: queries.length };
}

/**
 * Use Claude Haiku to score a batch of prospects 0–100 for outreach
 * linkability. Returns the candidates with relevanceScore + scoreReason set.
 */
export async function scoreProspects(
  raw: Array<{
    url: string;
    domain: string;
    pageTitle: string;
    snippet: string;
    searchSeed: string;
  }>,
  site: { niche?: string | null; audience?: string | null },
): Promise<{ candidates: ProspectCandidate[]; costUsd: number }> {
  if (raw.length === 0) return { candidates: [], costUsd: 0 };

  const client = createLLMClient();

  const SCORE_TOOL = {
    name: "rank_prospects",
    description: "Rank each prospect 0-100 for backlink outreach.",
    input_schema: {
      type: "object" as const,
      properties: {
        scored: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              score: { type: "number", description: "0-100 outreach linkability" },
              reason: { type: "string", description: "1 short sentence" },
            },
            required: ["url", "score", "reason"],
          },
        },
      },
      required: ["scored"],
    },
  };

  const prompt = `You're a backlink-outreach analyst. Score each of these search-result pages 0-100 for how likely they are to add a link to a high-quality article in this niche.

Niche: ${site.niche || "general"}
Target audience: ${site.audience || "general"}

Score high if:
- The page is a curated list or resource roundup that updates over time
- The domain looks like an independent blog or niche site (NOT a giant publisher like Forbes, Wikipedia, Reddit, YouTube)
- The page already lists similar articles to ours
- The snippet suggests they accept submissions or update regularly

Score low if:
- The page is a transactional product page, login page, paywall, social media, news article, or YouTube/Reddit thread
- The domain is a top-100 site that won't respond to outreach
- The snippet has nothing to do with our niche

Output JSON via the rank_prospects tool.

Prospects:
${raw
  .map(
    (p, i) =>
      `${i + 1}. ${p.url}\n   title: ${p.pageTitle}\n   snippet: ${p.snippet.slice(0, 200)}`,
  )
  .join("\n\n")}`;

  const resp = await client.messages.create({
    model: resolveModel(MODEL_SCORE),
    max_tokens: 2500,
    tools: [SCORE_TOOL],
    tool_choice: { type: "tool", name: "rank_prospects" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = resp.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return { candidates: raw.map((r) => ({ ...r, relevanceScore: 50, scoreReason: "" })), costUsd: 0 };
  }
  const scored = (toolUse.input as { scored: { url: string; score: number; reason: string }[] }).scored;
  const map = new Map(scored.map((s) => [s.url, s]));

  const candidates: ProspectCandidate[] = raw.map((p) => {
    const s = map.get(p.url);
    return {
      ...p,
      relevanceScore: s ? Math.max(0, Math.min(100, Math.round(s.score))) : 50,
      scoreReason: s?.reason ?? "",
    };
  });

  const usage = resp.usage;
  const inTok = usage?.input_tokens ?? 0;
  const outTok = usage?.output_tokens ?? 0;
  const costUsd =
    (inTok / 1_000_000) * SCORE_PRICE_INPUT_PER_M +
    (outTok / 1_000_000) * SCORE_PRICE_OUTPUT_PER_M;

  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return { candidates, costUsd };
}

/**
 * Claude Sonnet drafts a personalised outreach email for a specific prospect
 * pitching a specific article. Returns the subject + body — user reviews and
 * copy-pastes into Gmail (or whatever) to send.
 */
export async function draftOutreachEmail({
  prospect,
  article,
  site,
}: {
  prospect: { pageTitle: string; url: string; snippet: string; domain: string };
  article: { title: string; url: string; metaDescription: string };
  site: { name: string; niche?: string | null; expertVoice?: string | null };
}): Promise<{ subject: string; body: string; costUsd: number }> {
  const client = createLLMClient();

  const EMAIL_TOOL = {
    name: "write_email",
    description: "Write the outreach email subject and body.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: { type: "string", description: "<= 60 chars, specific, no clickbait, no all-caps" },
        body: {
          type: "string",
          description:
            "Plain-text body. ~100-150 words. Conversational tone. Opens with a specific reference to their page (not 'I love your blog'). Pitches the article in 1 sentence with WHY it would fit. Ends with a soft ask. Sign-off with [Your Name] placeholder.",
        },
      },
      required: ["subject", "body"],
    },
  };

  const prompt = `Draft a cold outreach email to the owner of this page, pitching one of our articles for inclusion.

Their page:
- URL: ${prospect.url}
- Domain: ${prospect.domain}
- Title: ${prospect.pageTitle}
- Snippet: ${prospect.snippet}

Our article we want them to link to:
- Title: ${article.title}
- URL: ${article.url}
- Description: ${article.metaDescription}

Our site context:
- Site name: ${site.name}
- Niche: ${site.niche || "n/a"}
${site.expertVoice ? `- Voice: ${site.expertVoice}` : ""}

Rules:
- Do NOT use the words "leverage," "synergy," "circle back," or "just wanted to reach out."
- Open by referencing something SPECIFIC about their page (title/snippet) — not "love your blog."
- Pitch in 1 sentence, including why it adds value to their readers.
- Ask softly: "would you consider..." NOT "please add."
- 100-150 words max in the body.
- Subject line should be specific, not "Quick question" or "Resource for your post."
- Sign off "Best, [Your Name]" (placeholder).
- Call the write_email tool with the result.`;

  const resp = await client.messages.create({
    model: resolveModel(MODEL_EMAIL),
    max_tokens: 1500,
    tools: [EMAIL_TOOL],
    tool_choice: { type: "tool", name: "write_email" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = resp.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use email draft.");
  }
  const { subject, body } = toolUse.input as { subject: string; body: string };

  const usage = resp.usage;
  const inTok = usage?.input_tokens ?? 0;
  const outTok = usage?.output_tokens ?? 0;
  const costUsd =
    (inTok / 1_000_000) * EMAIL_PRICE_INPUT_PER_M +
    (outTok / 1_000_000) * EMAIL_PRICE_OUTPUT_PER_M;

  return { subject, body, costUsd };
}
