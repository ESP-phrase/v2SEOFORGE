/**
 * Vertical 9:16 ad creative — pricing-focused variant.
 * Best for: Reels / TikTok / YouTube Shorts where you want the offer + price
 * front-and-center.
 *
 * Fetch as PNG: https://www.seoforge.org/api/og/vertical-pricing
 * 1080 × 1920.
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
          padding: 72,
          paddingTop: 100,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(190,248,72,0.22) 0%, rgba(190,248,72,0) 50%)",
          fontFamily: "system-ui",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 60 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundImage: "linear-gradient(180deg,#caff5e 0%,#a3dc34 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(190,248,72,0.4)",
            }}
          >
            <div style={{ display: "flex", transform: "rotate(8deg)" }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <path
                  d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27 Z"
                  fill="#0f1b00"
                />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, letterSpacing: -3 }}>
            <span style={{ color: "#ffffff" }}>SEO</span>
            <span style={{ color: "#bef848" }}>Forge</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 120,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -6,
            lineHeight: 0.95,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex" }}>Scale SEO</div>
          <div style={{ display: "flex", color: "#bef848" }}>On Autopilot.</div>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#9ca3af",
            lineHeight: 1.35,
            marginBottom: 60,
          }}
        >
          Generate, optimize, and publish SEO content at scale — while AI handles the heavy lifting.
        </div>

        {/* Stat row */}
        <div style={{ display: "flex", gap: 18, marginBottom: 60 }}>
          {[
            { num: "<$0.50", lbl: "Cost / article" },
            { num: "10 min", lbl: "First article live" },
            { num: "14 days", lbl: "Money back" },
          ].map((s) => (
            <div
              key={s.lbl}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "28px 22px",
                borderRadius: 22,
                backgroundColor: "#111111",
                border: "2px solid #1f1f1f",
              }}
            >
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#bef848", letterSpacing: -2 }}>
                {s.num}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#888", marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing tiles */}
        <div style={{ display: "flex", gap: 18, marginBottom: 60 }}>
          {[
            { name: "Hobby", price: "$0", desc: "10 articles", featured: false },
            { name: "Operator", price: "$29", desc: "150 articles", featured: true },
            { name: "Agency", price: "$149", desc: "1,000 articles", featured: false },
          ].map((t) => (
            <div
              key={t.name}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "30px 22px",
                borderRadius: 24,
                backgroundColor: t.featured ? "rgba(190,248,72,0.12)" : "#111111",
                border: t.featured ? "2px solid #bef848" : "2px solid #1f1f1f",
                position: "relative",
              }}
            >
              {t.featured ? (
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    top: -16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#bef848",
                    color: "#0a0a0a",
                    fontSize: 16,
                    fontWeight: 900,
                    padding: "6px 12px",
                    borderRadius: 8,
                    letterSpacing: 1,
                  }}
                >
                  POPULAR
                </div>
              ) : null}
              <div style={{ display: "flex", fontSize: 22, color: "#9ca3af", fontWeight: 700, marginBottom: 8 }}>
                {t.name}
              </div>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#ffffff", letterSpacing: -2 }}>
                {t.price}
                <span style={{ fontSize: 22, color: "#666", fontWeight: 600, marginLeft: 4, marginTop: 28 }}>/mo</span>
              </div>
              <div style={{ display: "flex", fontSize: 20, color: "#9ca3af", marginTop: 8 }}>
                {t.desc}
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
            borderRadius: 26,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: -1,
            marginBottom: 36,
          }}
        >
          Start Free  →
        </div>

        {/* Footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 24,
            color: "#9ca3af",
            marginBottom: 18,
          }}
        >
          14-day trial · No credit card · Cancel anytime
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 800,
            color: "#bef848",
            marginTop: "auto",
          }}
        >
          seoforge.org
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
