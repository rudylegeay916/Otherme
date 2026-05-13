import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/** Redirige vers /login si l'utilisateur n'est pas connecté. */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthSpinner />

  if (!user) {
    // On passe la destination dans le state pour revenir après login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

function AuthSpinner() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Vérification de la session…</p>
      </div>
    </div>
  )
}
