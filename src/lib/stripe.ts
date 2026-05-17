/**
 * Stripe billing helpers. One subscription per User. Three plans, all paid
 * with a $5/$9 14-day paid trial that converts to the monthly price:
 *   hobby    — $5 trial → $14.99/mo, 10 articles/mo
 *   operator — $5 trial → $29/mo,    150 articles/mo
 *   agency   — $9 trial → $149/mo,   1000 articles/mo
 *
 * Plan/credit state lives on the User row and is rewritten by the webhook
 * on checkout.session.completed and customer.subscription.updated. Users
 * on a trial are credited the full plan's articles — we let them USE the
 * tool during trial, that's the whole point.
 */
import Stripe from "stripe";

/**
 * Sanitize a Stripe key env var. Strips a leading U+FEFF (BOM) and any
 * surrounding whitespace/newlines — PowerShell pipes and some text editors
 * smuggle BOM bytes into env var values, which then break HTTP header
 * validation ("Cannot convert argument to a ByteString …value of 65279").
 */
function cleanKey(raw: string | undefined): string {
  return (raw ?? "").replace(/^﻿/, "").trim();
}

// Lazy singleton — Stripe constructor throws when key is empty, which breaks
// Next's "collect page data" build step on Vercel where STRIPE_SECRET_KEY is
// optional. Calling `stripe.xxx()` from a request lazily constructs.
let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    if (!_stripe) {
      const key = cleanKey(process.env.STRIPE_SECRET_KEY);
      if (!key) throw new Error("STRIPE_SECRET_KEY not set");
      _stripe = new Stripe(key, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: "2024-12-18.acacia" as any,
        // Use the fetch-based HTTP client (native fetch on Node 18+, the
        // recommended setup for serverless). The default https-module client
        // reuses a connection pool that goes stale across cold starts on
        // Vercel, producing intermittent "An error occurred with our
        // connection to Stripe. Request was retried N times" failures even
        // when the live API is healthy.
        httpClient: Stripe.createFetchHttpClient(),
        // 5 retries with exponential backoff = ~7s budget before we surface
        // an error to the user.
        maxNetworkRetries: 5,
        // Per-call timeout: default 80s is way too long inside a serverless
        // function that can be torn down at 60s. Cap at 20s so a hung Stripe
        // call surfaces fast and the SDK can retry within the function budget.
        timeout: 20000,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_stripe as any)[prop];
  },
});

export type PlanId = "hobby" | "operator" | "agency";
export type Cadence = "monthly" | "annual";

export const PLAN_CREDITS: Record<PlanId, number> = {
  hobby: 10,
  operator: 150,
  agency: 1000,
};

/**
 * Map (plan, cadence) → recurring Stripe Price ID (the one that charges
 * monthly/annual after the trial ends).
 */
export function priceIdFor(plan: PlanId, cadence: Cadence): string | null {
  const map: Record<string, string | undefined> = {
    hobby_monthly:    process.env.STRIPE_PRICE_HOBBY_MONTHLY,
    hobby_annual:     process.env.STRIPE_PRICE_HOBBY_ANNUAL,
    operator_monthly: process.env.STRIPE_PRICE_OPERATOR_MONTHLY,
    operator_annual:  process.env.STRIPE_PRICE_OPERATOR_ANNUAL,
    agency_monthly:   process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    agency_annual:    process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  };
  return map[`${plan}_${cadence}`] ?? null;
}

/**
 * One-time "trial fee" price ID per plan. Charged upfront at checkout
 * before the 14-day trial begins. $5 for Hobby/Operator, $9 for Agency.
 */
export function trialFeePriceIdFor(plan: PlanId): string | null {
  const map: Record<PlanId, string | undefined> = {
    hobby:    process.env.STRIPE_PRICE_HOBBY_TRIAL,
    operator: process.env.STRIPE_PRICE_OPERATOR_TRIAL,
    agency:   process.env.STRIPE_PRICE_AGENCY_TRIAL,
  };
  return map[plan] ?? null;
}

/** Reverse lookup: which plan does a Stripe price ID correspond to? */
export function planFromPriceId(priceId: string): PlanId | null {
  if (
    priceId === process.env.STRIPE_PRICE_HOBBY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_HOBBY_ANNUAL
  )
    return "hobby";
  if (
    priceId === process.env.STRIPE_PRICE_OPERATOR_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_OPERATOR_ANNUAL
  )
    return "operator";
  if (
    priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_AGENCY_ANNUAL
  )
    return "agency";
  return null;
}

/** Per-plan trial fee in dollars — used for ad pixel value attribution.
 *  TEST MODE: temporarily set to $1 across the board. Revert to 5/5/9. */
export const TRIAL_FEE_USD: Record<PlanId, number> = {
  hobby: 1,
  operator: 1,
  agency: 1,
};

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Raw-fetch Stripe REST call. Used for the checkout-creation hot path where
 * the SDK's connection management has been unreliable on Vercel cold starts.
 *
 * - Encodes payload as application/x-www-form-urlencoded with the bracket
 *   notation Stripe expects for nested arrays/objects.
 * - Manual retry with exponential backoff. Each attempt logs its outcome so
 *   we can see in Vercel function logs exactly where the failure is.
 * - Throws the final error if all attempts fail; caller decides UX.
 */
type StripeFormValue = string | number | boolean | null | undefined | StripeFormValue[] | { [k: string]: StripeFormValue };

function encodeForm(payload: Record<string, StripeFormValue>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        const subKey = `${key}[${i}]`;
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          out.push(...encodeForm(item as Record<string, StripeFormValue>, subKey));
        } else {
          out.push(`${encodeURIComponent(subKey)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof v === "object") {
      out.push(...encodeForm(v as Record<string, StripeFormValue>, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

export async function stripeFetch<T = unknown>(
  path: string,
  payload: Record<string, StripeFormValue>,
  opts: { reqId?: string; maxAttempts?: number; timeoutMs?: number } = {},
): Promise<T> {
  const key = cleanKey(process.env.STRIPE_SECRET_KEY);
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const reqId = opts.reqId ?? "—";
  const maxAttempts = opts.maxAttempts ?? 5;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const body = encodeForm(payload).join("&");
  const url = `https://api.stripe.com${path}`;

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const t0 = Date.now();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2024-12-18.acacia",
        },
        body,
        signal: ac.signal,
        // Don't keep TCP connections alive — Vercel cold starts re-use stale
        // pools otherwise. Each call gets a fresh connection.
        keepalive: false,
      });
      clearTimeout(timer);
      const txt = await res.text();
      if (!res.ok) {
        let msg = `Stripe ${res.status}`;
        try {
          const j = JSON.parse(txt);
          msg = j?.error?.message ? `Stripe ${res.status}: ${j.error.message}` : msg;
        } catch { /* fall through */ }
        console.error(`[stripeFetch ${reqId}] ${path} attempt ${attempt}/${maxAttempts} HTTP ${res.status} in ${Date.now() - t0}ms: ${msg}`);
        // 4xx is a client error; retrying won't help. Throw immediately.
        if (res.status >= 400 && res.status < 500) {
          throw new Error(msg);
        }
        lastErr = new Error(msg);
      } else {
        console.log(`[stripeFetch ${reqId}] ${path} attempt ${attempt} OK in ${Date.now() - t0}ms`);
        return JSON.parse(txt) as T;
      }
    } catch (e) {
      clearTimeout(timer);
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[stripeFetch ${reqId}] ${path} attempt ${attempt}/${maxAttempts} threw in ${Date.now() - t0}ms: ${msg}`);
      lastErr = e;
      // Client errors thrown above shouldn't retry — re-throw
      if (e instanceof Error && e.message.startsWith("Stripe 4")) throw e;
    }
    // Exponential backoff before next attempt: 200, 400, 800, 1600ms
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 200 * 2 ** (attempt - 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
