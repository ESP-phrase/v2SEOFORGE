"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, stripeFetch, priceIdFor, priceIdForVariant, trialFeePriceIdFor, trialFeePriceIdForVariant, trialConfig, TRIAL_FEE_USD, appUrl, isStripeConfigured, type PlanId, type Cadence, type Variant } from "@/lib/stripe";

function maskEmail(e?: string | null): string {
  if (!e) return "(none)";
  const [u, d] = e.split("@");
  if (!d) return e;
  return `${u.slice(0, 2)}***@${d}`;
}

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const plan = String(formData.get("plan") ?? "") as PlanId;
  const cadence = String(formData.get("cadence") ?? "monthly") as Cadence;
  const variant: Variant = formData.get("variant") === "b" ? "b" : "a";
  console.log(`[checkout ${reqId}] start plan=${plan} cadence=${cadence} variant=${variant}`);

  if (!isStripeConfigured()) {
    console.error(`[checkout ${reqId}] aborted: Stripe not configured`);
    redirect("/billing?error=" + encodeURIComponent("Stripe not configured. Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET."));
  }
  const session = await auth();
  if (!session?.user?.id) {
    console.log(`[checkout ${reqId}] no session, redirecting to /login`);
    redirect(`/login?next=${encodeURIComponent(`/pricing?plan=${plan}&cadence=${cadence}`)}`);
  }
  const userId = session.user.id;
  const email = session.user.email;
  console.log(`[checkout ${reqId}] authed user=${userId} email=${maskEmail(email)}`);

  const priceId = priceIdForVariant(plan, cadence, variant);
  if (!priceId) {
    console.error(`[checkout ${reqId}] no priceId for plan=${plan} cadence=${cadence} variant=${variant}`);
    redirect(`/pricing${variant === "b" ? "?v=b&" : "?"}error=${encodeURIComponent("That plan price is not configured.")}`);
  }
  const trialFeePriceId = trialFeePriceIdForVariant(plan, variant);
  if (!trialFeePriceId) {
    console.error(`[checkout ${reqId}] no trial fee priceId for plan=${plan} variant=${variant}`);
    redirect(`/pricing${variant === "b" ? "?v=b&" : "?"}error=${encodeURIComponent("Trial fee price is not configured.")}`);
  }
  const tCfg = trialConfig(variant);
  console.log(`[checkout ${reqId}] resolved prices trial=${trialFeePriceId} recurring=${priceId} trialDays=${tCfg.trialDays}`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`[checkout ${reqId}] user not found in DB (session stale?)`);
    redirect("/login");
  }

  // All Stripe API calls below are wrapped in a single try/catch so any
  // configuration failure (missing/invalid price IDs, key mismatch between
  // test and live mode, expired key, network blip) lands the user back on
  // /pricing with a real error message instead of Next.js's generic
  // "Application error: a server-side exception has occurred" page. The
  // underlying cause is logged to Vercel server logs for debugging.
  // redirect() throws NEXT_REDIRECT internally — it must be allowed to
  // propagate, hence the explicit re-throw on that digest.
  let checkoutUrl: string | null = null;
  let checkoutId: string | null = null;
  try {
    // Reuse existing customer if present, else create one. Using stripeFetch
    // (raw fetch with manual retry + logs) instead of the SDK because the
    // SDK's connection pool has been unreliable on Vercel cold starts,
    // surfacing as opaque "An error occurred with our connection to Stripe.
    // Request was retried N times" failures. stripeFetch logs each attempt
    // so the exact failure mode lands in Vercel function logs.
    const createLiveCustomer = async (): Promise<string> => {
      const tc = Date.now();
      const c = await stripeFetch<{ id: string }>(
        "/v1/customers",
        { email: email ?? undefined, "metadata[userId]": userId },
        { reqId },
      );
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: c.id } });
      console.log(`[checkout ${reqId}] customer created id=${c.id} in ${Date.now() - tc}ms`);
      return c.id;
    };

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      console.log(`[checkout ${reqId}] creating Stripe customer…`);
      customerId = await createLiveCustomer();
    } else {
      console.log(`[checkout ${reqId}] reusing customer id=${customerId}`);
    }

    const sessionPayload = (cust: string) => ({
      mode: "subscription",
      customer: cust,
      payment_method_types: ["card", "link"],
      line_items: [
        { price: trialFeePriceId, quantity: 1 },
        { price: priceId,         quantity: 1 },
      ],
      success_url: `${appUrl()}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/pricing${variant === "b" ? "?v=b&" : "?"}status=cancel`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: tCfg.trialDays,
        metadata: { userId, plan, variant },
      },
      metadata: { userId, plan, variant },
    });

    // Two-line checkout: (1) one-time trial fee charged immediately, (2) the
    // recurring subscription price on a 14-day free trial — so the next
    // charge after the trial fee lands 14 days later at the full monthly
    // rate. Stripe Checkout handles both line items in one session.
    //
    // Self-healing: if Stripe returns "No such customer" the saved ID is
    // stale (e.g., it was created in test mode before we switched to a live
    // key). Recreate the customer in the current mode, update the User row,
    // and retry the session creation once before giving up.
    console.log(`[checkout ${reqId}] creating Stripe checkout session…`);
    const ts = Date.now();
    let checkout: { id: string; url: string | null };
    try {
      checkout = await stripeFetch<{ id: string; url: string | null }>(
        "/v1/checkout/sessions",
        sessionPayload(customerId),
        { reqId },
      );
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (m.includes("No such customer")) {
        console.warn(`[checkout ${reqId}] stale customer ${customerId} (different Stripe mode); recreating live customer + retrying`);
        customerId = await createLiveCustomer();
        checkout = await stripeFetch<{ id: string; url: string | null }>(
          "/v1/checkout/sessions",
          sessionPayload(customerId),
          { reqId },
        );
      } else {
        throw e;
      }
    }
    checkoutUrl = checkout.url;
    checkoutId = checkout.id;
    console.log(`[checkout ${reqId}] session created id=${checkoutId} in ${Date.now() - ts}ms`);
  } catch (e) {
    if (
      e && typeof e === "object" && "digest" in e &&
      typeof (e as { digest?: string }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw e;
    }
    const raw = e instanceof Error ? e.message : String(e);
    console.error(`[checkout ${reqId}] FAILED after ${Date.now() - t0}ms: ${raw}`);
    const friendly =
      raw.includes("No such price") || raw.includes("Invalid API Key")
        ? "Checkout is misconfigured — our team has been notified. Please try again shortly."
        : `Checkout failed: ${raw.slice(0, 140)}`;
    redirect(`/pricing?error=${encodeURIComponent(friendly)}`);
  }

  if (!checkoutUrl || !checkoutId) {
    console.error(`[checkout ${reqId}] session has no url/id (url=${!!checkoutUrl} id=${!!checkoutId})`);
    redirect("/pricing?error=" + encodeURIComponent("Stripe session could not be created."));
  }

  // Mid-funnel ad signal: user picked a plan and is heading to Stripe.
  // Fires server-side so iOS/ad-block can't strip it. The browser pixel
  // fires the same event on click — TikTok dedupes via event_id, Reddit
  // dedupes via conversion_id (Stripe checkout session ID).
  //
  // Value attribution: report the immediate cash collected (the trial
  // fee), not the eventual recurring price. Better matches what TikTok/
  // Reddit can attribute to the click — the bigger amount lands 14 days
  // later when the trial converts (separate CompletePayment fire).
  // Fire all server-side pixel events in parallel so the redirect to Stripe
  // isn't gated on 4 sequential outbound calls. Each call has its own retry
  // path inside its helper; Promise.allSettled means a single failing pixel
  // doesn't take the others down. We still await — Vercel kills the function
  // the moment redirect() throws, so any unawaited work is lost.
  // Variant B's trial fee is shared $4.99; variant A uses per-plan amounts
  // from TRIAL_FEE_USD. Report what was actually charged today.
  const value = tCfg.sharedTrialFee ?? TRIAL_FEE_USD[plan];
  try {
    const [{ sendTikTokEvent }, { sendRedditEvent }] = await Promise.all([
      import("@/lib/tiktokCapi"),
      import("@/lib/redditCapi"),
    ]);
    await Promise.allSettled([
      sendTikTokEvent({
        eventName: "AddToCart",
        email: email ?? undefined,
        userId, value, currency: "USD",
        contentName: `${plan} plan`, contentId: checkoutId,
        eventId: `atc_${checkoutId}`,
      }),
      sendTikTokEvent({
        eventName: "InitiateCheckout",
        email: email ?? undefined,
        userId, value, currency: "USD",
        contentName: `${plan} plan`, contentId: checkoutId,
        eventId: checkoutId,
      }),
      sendTikTokEvent({
        eventName: "AddPaymentInfo",
        email: email ?? undefined,
        userId, value, currency: "USD",
        contentName: `${plan} plan`, contentId: checkoutId,
        eventId: `api_${checkoutId}`,
      }),
      sendRedditEvent({
        eventName: "AddToCart",
        email: email ?? undefined,
        userId, value, currency: "USD",
        itemCount: 1, conversionId: checkoutId,
      }),
    ]);
  } catch (e) {
    /* never block checkout on tracking */
    console.warn(`[checkout ${reqId}] pixel events partially failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  console.log(`[checkout ${reqId}] redirecting to Stripe (${Date.now() - t0}ms total) → ${checkoutUrl.slice(0, 60)}…`);
  redirect(checkoutUrl);
}

export async function openBillingPortalAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) redirect("/pricing");

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/billing`,
  });
  redirect(portal.url);
}
