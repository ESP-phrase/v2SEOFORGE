/**
 * Reddit Conversions API (server-side event tracking).
 *
 * Docs: https://ads-api.reddit.com/docs/v2/api-reference/conversions
 *
 * Why server-side in addition to the browser pixel:
 *   - Ad blockers / iOS Safari often strip the browser pixel
 *   - Server-side hits land 100% of the time
 *   - Reddit deduplicates by event_id when both fire — best accuracy
 *
 * Required env:
 *   REDDIT_CAPI_TOKEN     — bearer token from Reddit Ads → Conversions → API
 *   REDDIT_PIXEL_ID       — your pixel ID (default to hardcoded fallback)
 */
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

const REDDIT_API = "https://ads-api.reddit.com/api/v2.0/conversions/events";
const DEFAULT_PIXEL_ID = "a2_j0e7x22zvu9e";

export type RedditEventName =
  | "PageVisit"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "AddToWishlist"
  | "Lead"           // free signup
  | "SignUp"         // any account creation
  | "Purchase"       // paid subscription
  | "Custom";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

/**
 * Send a conversion event to Reddit. Silently no-ops if REDDIT_CAPI_TOKEN
 * isn't set so dev environments don't error.
 *
 * Pass the email + userId of the user the event is about. We hash them
 * before sending. IP/user-agent/click-id are pulled from the current
 * request automatically.
 */
export async function sendRedditEvent(opts: {
  eventName: RedditEventName;
  email?: string | null;
  userId?: string | null;
  customEventName?: string;
  value?: number;       // for Purchase
  currency?: string;    // ISO 4217, e.g. "USD"
  eventId?: string;     // for deduplication with browser pixel
}): Promise<void> {
  const token = process.env.REDDIT_CAPI_TOKEN;
  const pixelId = process.env.REDDIT_PIXEL_ID || DEFAULT_PIXEL_ID;

  if (!token) {
    console.log(`[reddit-capi] skipped (no REDDIT_CAPI_TOKEN) · ${opts.eventName}`);
    return;
  }

  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const clickId = cookieStore.get("sf_rdt_cid")?.value;
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      undefined;
    const userAgent = headerStore.get("user-agent") ?? undefined;

    const user: Record<string, string> = {};
    if (ip) user.ip_address = ip;
    if (userAgent) user.user_agent = userAgent;
    if (opts.email) user.email = sha256(opts.email);
    if (opts.userId) user.external_id = sha256(opts.userId);

    const event: Record<string, unknown> = {
      event_at: new Date().toISOString(),
      event_type: {
        tracking_type: opts.eventName,
        ...(opts.eventName === "Custom" && opts.customEventName
          ? { custom_event_name: opts.customEventName }
          : {}),
      },
      event_metadata: {},
    };
    if (opts.value != null && opts.currency) {
      (event.event_metadata as Record<string, unknown>).value_decimal = opts.value;
      (event.event_metadata as Record<string, unknown>).currency = opts.currency;
    }
    if (opts.eventId) event.event_id = opts.eventId;
    if (clickId) event.click_id = clickId;
    if (Object.keys(user).length > 0) event.user = user;

    const body = { events: [event] };

    const res = await fetch(`${REDDIT_API}/${pixelId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn(
        `[reddit-capi] ✗ ${opts.eventName} failed: ${res.status} ${txt.slice(0, 200)}`,
      );
    } else {
      console.log(`[reddit-capi] ✓ ${opts.eventName} sent`);
    }
  } catch (e) {
    console.warn(
      `[reddit-capi] ✗ ${opts.eventName} threw: ${e instanceof Error ? e.message : e}`,
    );
  }
}
