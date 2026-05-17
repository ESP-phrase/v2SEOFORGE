import { ImageResponse } from "next/og";

// Apple touch icon — 180x180. Used when iOS users save the site to home screen,
// and as the image Stripe shows on product rows in Checkout.
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
              <stop offset="50%" stopColor="#b3f048" />
              <stop offset="100%" stopColor="#7bbf3a" />
            </linearGradient>
          </defs>
          <polygon
            points="90,14 155,52 155,128 90,166 25,128 25,52"
            fill="none"
            stroke="url(#g)"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <path
            d="M122 60 a22 22 0 0 0 -22 -22 h-20 a22 22 0 0 0 0 44 h20 a22 22 0 0 1 0 44 h-20 a22 22 0 0 1 -22 -22"
            stroke="url(#g)"
            strokeWidth={20}
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
