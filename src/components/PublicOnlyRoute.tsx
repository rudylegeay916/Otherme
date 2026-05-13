import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/** Redirige vers /dashboard si l'utilisateur est déjà connecté. */
export default function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
