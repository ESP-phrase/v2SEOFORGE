/**
 * Unified LLM client factory.
 *
 * Default: hit Anthropic directly (ANTHROPIC_API_KEY).
 * When LLM_PROVIDER=openrouter: route the SAME Anthropic SDK at OpenRouter's
 * Anthropic-compatible endpoint. Model IDs get the "anthropic/" prefix so
 * OpenRouter routes them to Claude — but you can override to any model by
 * passing a slug like "openai/gpt-4o" or "google/gemini-pro" at call sites.
 *
 * Why route through OpenRouter:
 * - Single key, every major model (Claude, GPT, Gemini, Llama, Mistral, etc.)
 * - Automatic failover if Anthropic is degraded
 * - Cheaper Sonnet/Haiku tiers via aggregator pricing
 *
 * The Anthropic SDK speaks OpenRouter's `/api/v1/messages` natively — tool_use,
 * system caching, and streaming all work without code changes.
 */
import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "@/lib/envFallback";

// The Anthropic SDK appends "/v1/messages" to baseURL, so we point at /api
// (not /api/v1) — final URL becomes https://openrouter.ai/api/v1/messages.
const OPENROUTER_BASE_URL = "https://openrouter.ai/api";

function isOpenRouter(): boolean {
  return getEnv("LLM_PROVIDER").toLowerCase() === "openrouter";
}

/**
 * Returns a configured Anthropic SDK client pointed at the right backend.
 * Throws if no credentials are available.
 */
export function createLLMClient(): Anthropic {
  if (isOpenRouter()) {
    const key = getEnv("OPENROUTER_API_KEY");
    if (!key) throw new Error("OPENROUTER_API_KEY env var is required when LLM_PROVIDER=openrouter.");
    return new Anthropic({
      apiKey: key,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": getEnv("NEXT_PUBLIC_APP_URL") || "https://www.seoforge.org",
        "X-Title": "SEOForge",
      },
    });
  }
  const key = getEnv("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY env var is required.");
  return new Anthropic({ apiKey: key });
}

/**
 * OpenRouter expects model IDs as "provider/model" with dotted versions
 * (e.g. "anthropic/claude-sonnet-4.6"), while Anthropic's native API uses
 * dashed IDs with date suffixes (e.g. "claude-sonnet-4-6",
 * "claude-haiku-4-5-20251001"). Map between them transparently so call
 * sites can stay written against the bare native ID.
 *
 * Rules for converting Anthropic → OpenRouter:
 *   1. Strip trailing date suffix (-YYYYMMDD)
 *   2. Convert the final "X-Y" version pair to "X.Y"
 *   3. Prefix with "anthropic/"
 */
const ANTHROPIC_TO_OPENROUTER: Record<string, string> = {
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  "claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
  "claude-haiku-4-5-20251001": "anthropic/claude-haiku-4.5",
  "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
};

export function resolveModel(modelId: string): string {
  if (!isOpenRouter()) return modelId;
  if (modelId.includes("/")) return modelId;
  return ANTHROPIC_TO_OPENROUTER[modelId] ?? `anthropic/${modelId}`;
}
