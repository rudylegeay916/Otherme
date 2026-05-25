interface Props {
  size?: number
  className?: string
}

export default function AnimatedOtherMeLogo({ size = 220, className = '' }: Props) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* SVG layer: halo, rings, diverging paths, endpoint dots */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="alom-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.30" />
            <stop offset="65%"  stopColor="#5b21b6" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"    />
          </radialGradient>
          <linearGradient id="alom-pg-l" x1="100" y1="100" x2="20" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0"   />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="alom-pg-c" x1="100" y1="100" x2="100" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0"   />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="alom-pg-r" x1="100" y1="100" x2="180" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0"   />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Halo glow */}
        <circle cx="100" cy="100" r="82" fill="url(#alom-halo)" className="alom-breathe" />

        {/* Outer rotating dashed ring */}
        <circle cx="100" cy="100" r="72" stroke="#6d28d9" strokeWidth="0.7" fill="none"
          strokeOpacity="0.28" strokeDasharray="6 12" className="alom-ring-1" />

        {/* Inner rotating dashed ring — reverse */}
        <circle cx="100" cy="100" r="58" stroke="#4f46e5" strokeWidth="0.4" fill="none"
          strokeOpacity="0.18" strokeDasharray="3 9" className="alom-ring-2" />

        {/* Static faint base paths */}
        <path d="M 100 100 C 55 72 32 46 20 18"  stroke="#10b981" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />
        <path d="M 100 100 C 100 72 100 42 100 8" stroke="#8b5cf6" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />
        <path d="M 100 100 C 145 72 168 46 180 18" stroke="#f59e0b" strokeWidth="0.7" fill="none" strokeOpacity="0.14" />

        {/* Traveling light segments */}
        <path d="M 100 100 C 55 72 32 46 20 18"
          stroke="url(#alom-pg-l)" strokeWidth="1.8" fill="none"
          className="path-flow-short"
          style={{ animationDuration: '3s', animationDelay: '0s' }} />
        <path d="M 100 100 C 100 72 100 42 100 8"
          stroke="url(#alom-pg-c)" strokeWidth="1.8" fill="none"
          className="path-flow-short"
          style={{ animationDuration: '3.5s', animationDelay: '1.1s' }} />
        <path d="M 100 100 C 145 72 168 46 180 18"
          stroke="url(#alom-pg-r)" strokeWidth="1.8" fill="none"
          className="path-flow-short"
          style={{ animationDuration: '3.2s', animationDelay: '2.2s' }} />

        {/* Endpoint glowing dots */}
        <circle cx="20"  cy="18" r="7"   fill="#10b981" fillOpacity="0.10" />
        <circle cx="20"  cy="18" r="3.5" fill="#10b981" fillOpacity="0.70" />
        <circle cx="100" cy="8"  r="7"   fill="#8b5cf6" fillOpacity="0.10" />
        <circle cx="100" cy="8"  r="3.5" fill="#8b5cf6" fillOpacity="0.70" />
        <circle cx="180" cy="18" r="7"   fill="#f59e0b" fillOpacity="0.10" />
        <circle cx="180" cy="18" r="3.5" fill="#f59e0b" fillOpacity="0.70" />
      </svg>

      {/* Real OtherMe logo PNG — centered, breathing */}
      <div className="absolute inset-0 flex items-center justify-center alom-breathe-img">
        <img
          src="/otherme-logo.png"
          alt="OtherMe"
          className="object-contain"
          style={{ width: '52%', height: '52%' }}
          draggable={false}
        />
      </div>
    </div>
  )
}
