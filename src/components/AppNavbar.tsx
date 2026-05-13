import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Mes rapports' },
  { href: '/account',   label: 'Mon compte' },
]

export default function AppNavbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Initiales de l'utilisateur pour l'avatar
  const initials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-40 border-b border-dark-800 bg-dark-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Logo size={34} />

        {/* Navigation centrale */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Droite : avatar + déconnexion */}
        <div className="flex items-center gap-3">
          {/* Nouveau rapport */}
          <Link to="/onboarding" className="hidden sm:block btn-primary py-2 px-4 text-sm">
            + Nouveau rapport
          </Link>

          {/* Avatar */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-brand-600/30 border border-brand-600/40 flex items-center justify-center text-brand-300 text-sm font-bold hover:bg-brand-600/50 transition-colors">
              {initials}
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="card p-1 shadow-xl">
                <p className="px-3 py-2 text-xs text-slate-500 truncate border-b border-dark-700 mb-1">
                  {user?.email}
                </p>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-dark-700 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
