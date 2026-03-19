interface LogoProps {
  size?: number
}

export default function Logo({ size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bands logo"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Guitar pick silhouette */}
      <path
        d="M20 1.5 C31 1.5 38.5 9 38.5 18.5 C38.5 30 20 44.5 20 44.5 C20 44.5 1.5 30 1.5 18.5 C1.5 9 9 1.5 20 1.5Z"
        fill="url(#logo-grad)"
        filter="url(#logo-glow)"
      />

      {/* Guitar strings — 3 horizontal fret lines */}
      <line x1="12" y1="14" x2="28" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />
      <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.80" />
      <line x1="12" y1="26" x2="28" y2="26" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
    </svg>
  )
}
