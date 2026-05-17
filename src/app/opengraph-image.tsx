import { ImageResponse } from "next/og";

// Default Open Graph image for the whole site. 1200x630 — what shows in
// social card previews (Twitter, LinkedIn, Slack, iMessage, etc.).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SEOForge — AI SEO content on autopilot";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(190,248,72,0.18) 0%, rgba(190,248,72,0) 50%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 56,
          }}
        >
          {/* Logo — app-icon style: black rounded square with lime hexagon + S */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: "radial-gradient(60% 60% at 50% 50%, #1a1a1a 0%, #000 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(190,248,72,0.45)",
            }}
          >
            <svg width="96" height="96" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="og-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4ff7a" />
                  <stop offset="50%" stopColor="#b3f048" />
                  <stop offset="100%" stopColor="#7bbf3a" />
                </linearGradient>
              </defs>
              <polygon
                points="32,8 53,20 53,44 32,56 11,44 11,20"
                fill="none"
                stroke="url(#og-grad)"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              <path
                d="M43 22 a7 7 0 0 0 -7 -7 h-5 a7 7 0 0 0 0 14 h5 a7 7 0 0 1 0 14 h-5 a7 7 0 0 1 -7 -7"
                stroke="url(#og-grad)"
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, letterSpacing: -2 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -3,
            lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          Scale SEO on autopilot.
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9ca3af",
            lineHeight: 1.4,
            maxWidth: 900,
            marginBottom: 56,
          }}
        >
          Generate, optimize, and publish AI articles to WordPress and native blogs.
          Topic clusters, schema, internal linking.
        </div>

        {/* Bottom row — feature chips */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {["$0.30 / article", "Free Hobby plan", "WordPress + Native", "Cancel anytime"].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0a0a0a",
                  backgroundColor: "#bef848",
                  borderRadius: 10,
                  padding: "10px 18px",
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
