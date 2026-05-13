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
      {/* Fond */}
      <rect width="100" height="100" rx="20" fill="#0E1015" />

      {/* Arc du O — ouvert sur la droite */}
      <path
        d="M 53 30 A 26 26 0 1 0 53 70"
        stroke="#E8EBF2"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />

      {/* M angulaire */}
      <path
        d="M 48 76 L 48 26 L 62 50 L 76 26 L 76 76"
        stroke="#E8EBF2"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Accent bleu — bas de la jambe droite du M */}
      <rect x="69" y="71" width="15" height="7" rx="3.5" fill="#4473F5" />
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
          className="font-bold text-slate-100 tracking-tight"
          style={{ fontSize: size * 0.44 }}
        >
          OtherMe
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
