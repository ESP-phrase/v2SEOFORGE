import { ImageResponse } from "next/og";

// Apple touch icon — 180x180. Used when iOS users save the site to home screen.
// Also referenced by Stripe products as the brand image on Checkout pages.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4ff7a" />
              <stop offset="55%" stopColor="#b3f048" />
              <stop offset="100%" stopColor="#7bbf3a" />
            </linearGradient>
          </defs>
          <path
            d="M140 62 a30 30 0 0 0 -30 -30 h-40 a30 30 0 0 0 0 60 h40 a30 30 0 0 1 0 60 h-40 a30 30 0 0 1 -30 -30"
            stroke="url(#g)"
            strokeWidth={40}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
