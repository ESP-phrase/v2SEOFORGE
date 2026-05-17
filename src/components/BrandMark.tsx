/**
 * SEOForge brand mark — chunky gradient "S" with a soft drop shadow.
 * No container background; renders cleanly on any backdrop.
 * Same shape as /icon.svg so the favicon and in-page logo match.
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
        <linearGradient id="sfm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4ff7a" />
          <stop offset="55%" stopColor="#b3f048" />
          <stop offset="100%" stopColor="#7bbf3a" />
        </linearGradient>
        <filter id="sfm-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      <path
        d="M50 22 a11 11 0 0 0 -11 -11 h-14 a11 11 0 0 0 0 22 h14 a11 11 0 0 1 0 22 h-14 a11 11 0 0 1 -11 -11"
        stroke="url(#sfm-grad)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sfm-shadow)"
      />
    </svg>
  );
}
