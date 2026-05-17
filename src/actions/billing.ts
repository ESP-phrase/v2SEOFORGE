"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, priceIdFor, trialFeePriceIdFor, TRIAL_FEE_USD, appUrl, isStripeConfigured, type PlanId, type Cadence } from "@/lib/stripe";

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const plan = String(formData.get("plan") ?? "") as PlanId;
  const cadence = String(formData.get("cadence") ?? "monthly") as Cadence;

  if (!isStripeConfigured()) {
    redirect("/billing?error=" + encodeURIComponent("Stripe not configured. Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET."));
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(`/pricing?plan=${plan}&cadence=${cadence}`)}`);
  }
  const userId = session.user.id;
  const email = session.user.email;

  const priceId = priceIdFor(plan, cadence);
  if (!priceId) {
    redirect("/pricing?error=" + encodeURIComponent("That plan price is not configured."));
  }
  const trialFeePriceId = trialFeePriceIdFor(plan);
  if (!trialFeePriceId) {
    redirect("/pricing?error=" + encodeURIComponent("Trial fee price is not configured."));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

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
    // Reuse existing customer if present, else create one.
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const c = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { userId },
      });
      customerId = c.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    // Two-line checkout: (1) one-time trial fee charged immediately, (2) the
    // recurring subscription price on a 14-day free trial — so the next
    // charge after the trial fee lands 14 days later at the full monthly
    // rate. Stripe Checkout handles both line items in one session.
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card", "link"],
      line_items: [
        { price: trialFeePriceId, quantity: 1 },  // one-time trial fee
        { price: priceId,         quantity: 1 },  // recurring subscription
      ],
      success_url: `${appUrl()}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/pricing?status=cancel`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
    });
    checkoutUrl = checkout.url;
    checkoutId = checkoutId;
  } catch (e) {
    if (
      e && typeof e === "object" && "digest" in e &&
      typeof (e as { digest?: string }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw e;
    }
    const raw = e instanceof Error ? e.message : String(e);
    console.error("[billing] startCheckoutAction failed:", { plan, cadence, error: raw });
    const friendly =
      raw.includes("No such price") || raw.includes("Invalid API Key")
        ? "Checkout is misconfigured — our team has been notified. Please try again shortly."
        : `Checkout failed: ${raw.slice(0, 140)}`;
    redirect(`/pricing?error=${encodeURIComponent(friendly)}`);
  }

  if (!checkoutUrl || !checkoutId) {
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
  const value = TRIAL_FEE_USD[plan];
  try {
    const { sendTikTokEvent } = await import("@/lib/tiktokCapi");
    // Fire THREE TikTok events for the same Subscribe-click → Stripe-redirect
    // moment, all with distinct event_ids so TikTok counts them separately.
    // This gives ad campaigns three optimization-goal choices, each at a
    // slightly different funnel depth:
    //   AddToCart        — "interested" signal, highest volume
    //   InitiateCheckout — "decided" signal, slightly tighter
    //   AddPaymentInfo   — "ready to pay" signal, tightest mid-funnel
    // Stripe Checkout doesn't fire a true AddPaymentInfo event, so this is
    // synthesised at session-create time. Algorithmically still useful — the
    // event correlates with eventual CompletePayment.
    const tt = [
      { name: "AddToCart" as const,        eid: `atc_${checkoutId}` },
      { name: "InitiateCheckout" as const, eid: checkoutId },
      { name: "AddPaymentInfo" as const,   eid: `api_${checkoutId}` },
    ];
    for (const e of tt) {
      await sendTikTokEvent({
        eventName: e.name,
        email: email ?? undefined,
        userId,
        value,
        currency: "USD",
        contentName: `${plan} plan`,
        contentId: checkoutId,
        eventId: e.eid,
      });
    }
  } catch {
    /* never block checkout on tracking */
  }
  try {
    const { sendRedditEvent } = await import("@/lib/redditCapi");
    await sendRedditEvent({
      eventName: "AddToCart",
      email: email ?? undefined,
      userId,
      value,
      currency: "USD",
      itemCount: 1,
      conversionId: checkoutId,
    });
  } catch {
    /* never block checkout on tracking */
  }

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
