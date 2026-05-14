import { Link } from 'react-router-dom'

interface LogoProps {
  size?: number
  withText?: boolean
  className?: string
  /** null = pas de lien, '/' = lien vers accueil */
  to?: string | null
}

function OtherMeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="om-grad-o" x1="5" y1="8" x2="68" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id="om-grad-m" x1="52" y1="10" x2="96" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="45%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>

      {/* O — anneau circulaire, blanc → lavande */}
      <circle
        cx="36"
        cy="50"
        r="25"
        stroke="url(#om-grad-o)"
        strokeWidth="12"
        fill="none"
      />

      {/* M — angulaire, lavande → violet profond */}
      <path
        d="M 54 82 L 54 18 L 74 52 L 94 18 L 94 82"
        stroke="url(#om-grad-m)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({
  size = 36,
  withText = true,
  className = '',
  to = '/',
}: LogoProps) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <OtherMeIcon size={size} />
      {withText && (
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: size * 0.44 }}
        >
          <span className="text-white">Other</span>
          <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Me</span>
        </span>
      )}
    </span>
  )

  if (to === null) return inner

  return (
    <Link to={to} className="inline-flex items-center">
      {inner}
    </Link>
  )
}
