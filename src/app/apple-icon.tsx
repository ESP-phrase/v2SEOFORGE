import { ImageResponse } from "next/og";

// Apple touch icon — 180x180. Used when iOS users save the site to home screen.
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
        <svg width="140" height="140" viewBox="0 0 64 64">
          <path
            d="M44 18 a10 10 0 0 0 -10 -10 h-8 a10 10 0 0 0 0 20 h8 a10 10 0 0 1 0 20 h-8 a10 10 0 0 1 -10 -10"
            stroke="#bef848"
            strokeWidth="9"
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
