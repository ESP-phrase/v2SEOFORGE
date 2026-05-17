/**
 * SEOForge brand mark — black rounded square with a lime, glowing "S" stroke.
 * Same shape rendered as /icon.svg so the favicon and in-page logo match.
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
        <radialGradient id="sfm-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <filter id="sfm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#sfm-bg)" />
      <path
        d="M44 18 a10 10 0 0 0 -10 -10 h-8 a10 10 0 0 0 0 20 h8 a10 10 0 0 1 0 20 h-8 a10 10 0 0 1 -10 -10"
        stroke="#bef848"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sfm-glow)"
      />
    </svg>
  );
}
