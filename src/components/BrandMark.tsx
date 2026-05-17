/**
 * SEOForge brand mark — lime hexagon outline enclosing a bold lime S.
 * Same shape as /icon.svg so favicon and in-page logo stay in lockstep.
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
        <filter id="bm-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter="url(#bm-shadow)">
        <polygon
          points="32,5 55,18.5 55,45.5 32,59 9,45.5 9,18.5"
          fill="none"
          stroke="url(#bm-grad)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M44 22 a8 8 0 0 0 -8 -8 h-6 a8 8 0 0 0 0 16 h6 a8 8 0 0 1 0 16 h-6 a8 8 0 0 1 -8 -8"
          stroke="url(#bm-grad)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
