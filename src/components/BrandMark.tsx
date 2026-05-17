/**
 * SEOForge brand mark — black rounded square containing a lime hexagon
 * outline and a bold lime S. Matches /icon.svg so favicon and in-page
 * logo stay in lockstep. The black backdrop ensures the mark reads
 * cleanly on any surface (light wallpapers, browser chrome, etc.).
 */
export function BrandMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="bm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="50%" stopColor="#b3f048" />
          <stop offset="100%" stopColor="#7bbf3a" />
        </linearGradient>
        <radialGradient id="bm-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#bm-bg)" />
      <polygon
        points="32,8 53,20 53,44 32,56 11,44 11,20"
        fill="none"
        stroke="url(#bm-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M43 22 a7 7 0 0 0 -7 -7 h-5 a7 7 0 0 0 0 14 h5 a7 7 0 0 1 0 14 h-5 a7 7 0 0 1 -7 -7"
        stroke="url(#bm-grad)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
