import PricingPageClient from "./PricingPageClient";

/**
 * Server entry for /pricing. Reads the A/B variant from ?v= so the rendered
 * HTML is variant-correct on the first byte (no client-side flicker, no
 * hydration mismatch, search engines see the right content per URL).
 *
 *   /pricing       → variant A: $1 hold, 14-day trial, Creator/Operator/Agency
 *   /pricing?v=b   → variant B: $4.99 charge, 3-day trial, Starter/Growth/Agency
 *
 * Everything interactive (annual toggle, form, etc.) lives in
 * PricingPageClient.
 */
export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant: "a" | "b" = v === "b" ? "b" : "a";
  return <PricingPageClient variant={variant} />;
}
