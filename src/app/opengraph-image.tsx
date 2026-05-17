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
          {/* Logo tile — black bg with lime S */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(190,248,72,0.55)",
            }}
          >
            <svg width="72" height="72" viewBox="0 0 64 64">
              <path
                d="M44 18 a10 10 0 0 0 -10 -10 h-8 a10 10 0 0 0 0 20 h8 a10 10 0 0 1 0 20 h-8 a10 10 0 0 1 -10 -10"
                stroke="#bef848"
                strokeWidth={9}
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
