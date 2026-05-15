/**
 * Vertical 9:16 ad creative for Reels / TikTok / YouTube Shorts / Stories.
 * Fetch as PNG: https://www.seoforge.org/api/og/vertical
 *
 * 1080 × 1920 — standard 9:16 export size.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          paddingTop: 120,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(190,248,72,0.25) 0%, rgba(190,248,72,0) 55%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 100 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 26,
              backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 80px rgba(190,248,72,0.45)",
            }}
          >
            <div style={{ display: "flex", transform: "rotate(8deg)" }}>
              <svg width="74" height="74" viewBox="0 0 74 74">
                <path
                  d="M37 0 L43 31 L74 37 L43 43 L37 74 L31 43 L0 37 L31 31 Z"
                  fill="#0f1b00"
                />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 900, letterSpacing: -3 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 4,
            color: "#bef848",
            marginBottom: 32,
          }}
        >
          AI-POWERED SEO AUTOMATION
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 140,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -7,
            lineHeight: 0.95,
            marginBottom: 50,
          }}
        >
          <div style={{ display: "flex" }}>SCALE SEO</div>
          <div style={{ display: "flex", color: "#bef848" }}>ON AUTOPILOT.</div>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: "#9ca3af",
            lineHeight: 1.3,
            marginBottom: 80,
          }}
        >
          Generate, optimize, and publish AI content across unlimited sites — from one dashboard.
        </div>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 30, marginBottom: 80 }}>
          {[
            { num: "$0.30", lbl: "Cost per article" },
            { num: "150", lbl: "Articles / mo" },
            { num: "1,500+", lbl: "Word count" },
          ].map((s) => (
            <div
              key={s.lbl}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "32px 28px",
                borderRadius: 24,
                backgroundColor: "#111111",
                border: "2px solid #222222",
              }}
            >
              <div style={{ display: "flex", fontSize: 64, fontWeight: 900, color: "#bef848", letterSpacing: -2 }}>
                {s.num}
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#888", marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 60px",
            backgroundColor: "#bef848",
            color: "#0f1b00",
            borderRadius: 28,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: -1,
            marginBottom: 60,
          }}
        >
          Start Free  →
        </div>

        {/* Footer chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: "auto" }}>
          {["No credit card", "Cancel anytime", "Free Hobby plan"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 26,
                color: "#9ca3af",
              }}
            >
              <span style={{ display: "flex", color: "#22c55e" }}>✓</span>
              {chip}
            </div>
          ))}
        </div>

        {/* URL footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "#bef848",
            marginTop: 40,
          }}
        >
          seoforge.org
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
