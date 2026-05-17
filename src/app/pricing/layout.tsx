import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — From $29 to $199/mo",
  description:
    "Three plans for SEO operators, niche site builders, and agencies. $29/mo Creator (75 articles), $79/mo Operator (250 articles), $199/mo Agency (1,000 articles). 14-day trial, $1 verification hold. Cancel anytime.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — SEOForge",
    description:
      "$29 Creator · $79 Operator · $199 Agency. 14-day trial, $1 verification hold, cancel anytime.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
