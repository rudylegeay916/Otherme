// No imports needed beyond React types
export default function AnimatedLifePathsBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* 5 diverging life paths — light segment traveling along each */}
      {/* Use stroke-dasharray trick: small lit segment + long gap animating offset */}
      <g className="paths-layer">
        {/* Far left */}
        <path d="M 720 900 C 660 680 280 420 60 80" stroke="#7c3aed" strokeWidth="1.2" fill="none" strokeOpacity="0.08" />
        <path d="M 720 900 C 660 680 280 420 60 80" stroke="#a78bfa" strokeWidth="1.4" fill="none"
          className="path-flow" style={{ animationDelay: '0s', animationDuration: '12s' }} />
        {/* Center-left */}
        <path d="M 720 900 C 700 680 510 380 350 50" stroke="#6d28d9" strokeWidth="1" fill="none" strokeOpacity="0.06" />
        <path d="M 720 900 C 700 680 510 380 350 50" stroke="#8b5cf6" strokeWidth="1.5" fill="none"
          className="path-flow" style={{ animationDelay: '2.5s', animationDuration: '11s' }} />
        {/* Center — main */}
        <path d="M 720 900 C 720 680 720 380 720 50" stroke="#6d28d9" strokeWidth="1.2" fill="none" strokeOpacity="0.07" />
        <path d="M 720 900 C 720 680 720 380 720 50" stroke="#a78bfa" strokeWidth="2" fill="none"
          className="path-flow" style={{ animationDelay: '1s', animationDuration: '14s' }} />
        {/* Center-right */}
        <path d="M 720 900 C 740 680 940 380 1090 50" stroke="#5b21b6" strokeWidth="1" fill="none" strokeOpacity="0.06" />
        <path d="M 720 900 C 740 680 940 380 1090 50" stroke="#7c3aed" strokeWidth="1.5" fill="none"
          className="path-flow" style={{ animationDelay: '3.5s', animationDuration: '10s' }} />
        {/* Far right */}
        <path d="M 720 900 C 780 680 1160 420 1380 80" stroke="#4f46e5" strokeWidth="1" fill="none" strokeOpacity="0.05" />
        <path d="M 720 900 C 780 680 1160 420 1380 80" stroke="#6d28d9" strokeWidth="1.2" fill="none"
          className="path-flow" style={{ animationDelay: '5s', animationDuration: '13s' }} />
      </g>
    </svg>
  )
}
