interface Props {
  size?: number
  className?: string
}

export default function AnimatedOtherMeLogo({ size = 200, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Logo gradients — unique IDs to avoid clash with Logo.tsx */}
        <linearGradient id="alom-o" x1="5" y1="8" x2="68" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id="alom-m" x1="52" y1="10" x2="96" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>

        {/* Halo radial gradient */}
        <radialGradient id="alom-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#5b21b6" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>

        {/* Path gradients: transparent at logo center → opaque at endpoint */}
        <linearGradient id="alom-pg-l" x1="100" y1="100" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="alom-pg-c" x1="100" y1="100" x2="100" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="alom-pg-r" x1="100" y1="100" x2="180" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Outer halo glow — breathes with logo */}
      <circle cx="100" cy="100" r="80" fill="url(#alom-halo)" className="alom-breathe" />

      {/* Rotating dashed outer ring */}
      <circle
        cx="100" cy="100" r="70"
        stroke="#6d28d9" strokeWidth="0.7" fill="none"
        strokeOpacity="0.28" strokeDasharray="6 12"
        className="alom-ring-1"
      />

      {/* Rotating dashed inner ring — reverse direction */}
      <circle
        cx="100" cy="100" r="56"
        stroke="#4f46e5" strokeWidth="0.4" fill="none"
        strokeOpacity="0.18" strokeDasharray="3 9"
        className="alom-ring-2"
      />

      {/* Static base paths (very faint traces) */}
      <path d="M 100 100 C 55 72 32 46 20 18" stroke="#10b981" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />
      <path d="M 100 100 C 100 72 100 42 100 8"  stroke="#8b5cf6" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />
      <path d="M 100 100 C 145 72 168 46 180 18" stroke="#f59e0b" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />

      {/* Traveling light segment on each path */}
      <path
        d="M 100 100 C 55 72 32 46 20 18"
        stroke="url(#alom-pg-l)" strokeWidth="1.8" fill="none"
        className="path-flow-short"
        style={{ animationDuration: '3s', animationDelay: '0s' }}
      />
      <path
        d="M 100 100 C 100 72 100 42 100 8"
        stroke="url(#alom-pg-c)" strokeWidth="1.8" fill="none"
        className="path-flow-short"
        style={{ animationDuration: '3.5s', animationDelay: '1.1s' }}
      />
      <path
        d="M 100 100 C 145 72 168 46 180 18"
        stroke="url(#alom-pg-r)" strokeWidth="1.8" fill="none"
        className="path-flow-short"
        style={{ animationDuration: '3.2s', animationDelay: '2.2s' }}
      />

      {/* Endpoint glowing dots */}
      <circle cx="20" cy="18" r="7" fill="#10b981" fillOpacity="0.10" />
      <circle cx="20" cy="18" r="3.5" fill="#10b981" fillOpacity="0.70" />

      <circle cx="100" cy="8" r="7" fill="#8b5cf6" fillOpacity="0.10" />
      <circle cx="100" cy="8" r="3.5" fill="#8b5cf6" fillOpacity="0.70" />

      <circle cx="180" cy="18" r="7" fill="#f59e0b" fillOpacity="0.10" />
      <circle cx="180" cy="18" r="3.5" fill="#f59e0b" fillOpacity="0.70" />

      {/* OtherMe O+M logo — scaled ~55px, centered at (100,100) */}
      {/* Original viewBox 0 0 100 100 → scale(0.55), visual center ~(65,50) → translate to (100,100) */}
      <g transform="translate(64, 73) scale(0.55)" className="alom-breathe">
        <circle cx="36" cy="50" r="25" stroke="url(#alom-o)" strokeWidth="12" fill="none" />
        <path
          d="M 54 82 L 54 18 L 74 52 L 94 18 L 94 82"
          stroke="url(#alom-m)"
          strokeWidth="10" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
