import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@anthropic-ai/sdk"],
  async rewrites() {
    return [
      // First-party Clarity proxy. The Clarity script is served from our own
      // origin which bypasses most ad blockers (~30% more sessions captured).
      // Visitors hit https://www.seoforge.org/_clarity/* and we forward the
      // request to Microsoft's CDN transparently.
      {
        source: "/_clarity/:path*",
        destination: "https://www.clarity.ms/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        // Allow ad-platform event-builder tools (TikTok, Reddit, Microsoft,
        // Google Tag Assistant, Meta) to iframe-embed the site so their
        // codeless event setup tools work. Without this, X-Frame-Options
        // blocks the embed and event builders display a blank screen.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors",
              "'self'",
              "https://*.tiktok.com",
              "https://ads.tiktok.com",
              "https://business.tiktok.com",
              "https://*.reddit.com",
              "https://ads.reddit.com",
              "https://*.microsoft.com",
              "https://ads.microsoft.com",
              "https://clarity.microsoft.com",
              "https://*.google.com",
              "https://tagassistant.google.com",
              "https://*.facebook.com",
            ].join(" "),
          },
          // X-Frame-Options is being deprecated in favor of CSP frame-ancestors,
          // but older crawlers still check it. Allow same-origin and let CSP
          // handle the rest.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
