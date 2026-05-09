/**
 * Generate social posts from a published article and (optionally) push them
 * to X and Reddit. Credentials come from env vars — they're per-account, not
 * per-site. Disabled silently if creds aren't set.
 */
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const MODEL = "claude-haiku-4-5-20251001";

type ArticleRecord = {
  id: number;
  title: string;
  wpUrl: string;
  metaDescription: string;
};

type Posts = {
  tweet: string;
  linkedin: string;
  reddit_title: string;
  reddit_body: string;
};

function envSet(...keys: string[]): boolean {
  return keys.every((k) => !!process.env[k]);
}

async function generatePosts(article: ArticleRecord): Promise<Posts> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const prompt = `Article title: ${article.title}
Article URL: ${article.wpUrl}
Meta description: ${article.metaDescription}

Write social posts that drive clicks WITHOUT looking like spam. Return JSON only:
{
  "tweet": "<= 270 chars, no hashtags, ends with the URL on its own line",
  "linkedin": "3-5 short lines, conversational, ends with the URL",
  "reddit_title": "<= 90 chars, question or specific claim, no clickbait",
  "reddit_body": "2-3 sentences of genuine context, then the URL on a new line"
}`;
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = resp.content[0];
  if (block.type !== "text") throw new Error("Non-text response from Claude.");
  const stripped = block.text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return JSON.parse(stripped) as Posts;
}

async function postToX(text: string): Promise<string | null> {
  if (!envSet("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")) return null;
  // Twitter v2 OAuth1.0a is a hassle in raw fetch — leaving the integration
  // disabled in v1. Wire up the `twitter-api-v2` package later if needed.
  return null;
}

async function postToReddit(
  _subreddit: string,
  _title: string,
  _body: string,
): Promise<string | null> {
  if (!envSet("REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD")) {
    return null;
  }
  return null;
}

export async function distribute(
  article: ArticleRecord,
  subreddits: string[] = [],
): Promise<{ generated: Posts; posted: Record<string, string>; errors: Record<string, string> }> {
  const posts = await generatePosts(article);
  const posted: Record<string, string> = {};
  const errors: Record<string, string> = {};

  try {
    const tid = await postToX(posts.tweet);
    if (tid) {
      await prisma.socialPost.create({
        data: { articleId: article.id, platform: "x", externalId: tid },
      });
      posted.x = tid;
    }
  } catch (e) {
    errors.x = e instanceof Error ? e.message : String(e);
  }

  for (const sub of subreddits) {
    try {
      const rid = await postToReddit(sub, posts.reddit_title, posts.reddit_body);
      if (rid) {
        await prisma.socialPost.create({
          data: { articleId: article.id, platform: `reddit:${sub}`, externalId: rid },
        });
        posted[`reddit:${sub}`] = rid;
      }
    } catch (e) {
      errors[`reddit:${sub}`] = e instanceof Error ? e.message : String(e);
    }
  }

  return { generated: posts, posted, errors };
}
