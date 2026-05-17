import { ImageResponse } from "next/og";

// Apple touch icon — 180x180. Used when iOS users save the site to home screen,
// and as the image Stripe shows on product rows in Checkout. Black backdrop so
// the mark reads on any home-screen wallpaper.
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
          background: "radial-gradient(60% 60% at 50% 50%, #1a1a1a 0%, #000 100%)",
          borderRadius: 38,
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4ff7a" />
              <stop offset="50%" stopColor="#b3f048" />
              <stop offset="100%" stopColor="#7bbf3a" />
            </linearGradient>
          </defs>
          <polygon
            points="90,22 148,55 148,125 90,158 32,125 32,55"
            fill="none"
            stroke="url(#g)"
            strokeWidth={8}
            strokeLinejoin="round"
          />
          <path
            d="M120 60 a20 20 0 0 0 -20 -20 h-16 a20 20 0 0 0 0 40 h16 a20 20 0 0 1 0 40 h-16 a20 20 0 0 1 -20 -20"
            stroke="url(#g)"
            strokeWidth={18}
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
