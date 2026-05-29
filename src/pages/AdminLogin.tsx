import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'

interface AdminStatus {
  adminEmailsConfigured: boolean
  accessTokenSecretConfigured: boolean
  supabaseConfigured: boolean
}

export default function AdminLogin() {
  const navigate    = useNavigate()
  const { session, signIn } = useAuth()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [isAdmin,   setIsAdmin]   = useState<boolean | null>(null)
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null)
  const [statusError, setStatusError] = useState('')

  // Charger le statut de configuration admin
  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((d: AdminStatus) => setAdminStatus(d))
      .catch(() => setStatusError('Impossible de joindre /api/admin/status'))
  }, [])

  // Vérifier si l'utilisateur connecté est admin (sur un rapport fictif)
  useEffect(() => {
    if (!session?.access_token) { setIsAdmin(null); return }
    fetch('/api/admin/bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ reportId: 'admin-check' }),
    })
      .then((r) => { setIsAdmin(r.ok || r.status === 400) })
      .catch(() => setIsAdmin(false))
  }, [session?.access_token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signIn(email.trim(), password)
    if (authError) {
      setError(authError.message || 'Email ou mot de passe incorrect.')
      setLoading(false)
    }
    // Si succès, le useEffect ci-dessus se déclenche et vérifie isAdmin
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Logo size={40} className="justify-center" />
          <h1 className="text-2xl font-bold text-slate-100 mt-4">Connexion admin OtherMe</h1>
          <p className="text-slate-500 text-sm mt-1">Accès réservé aux administrateurs</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="card p-8 mb-6">
          {session ? (
            <div className="text-center py-2">
              <div className="text-2xl mb-3">✅</div>
              <p className="text-slate-300 font-medium mb-1">Connecté en tant que</p>
              <p className="text-brand-400 font-semibold text-sm break-all">{session.user?.email}</p>
              {isAdmin === true && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  🔑 Admin reconnu
                </div>
              )}
              {isAdmin === false && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/20 border border-red-700/30 text-red-300 text-xs font-semibold">
                  ✗ Cet email n'est pas dans la liste admin
                </div>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 w-full btn-primary py-2.5"
              >
                Aller au dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email admin</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-900/15 border border-red-700/30 text-red-300 text-sm">
                  <span className="flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion…
                  </span>
                ) : 'Se connecter'}
              </button>
            </form>
          )}
        </div>

        {/* Bloc diagnostic */}
        <div className="card p-6 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Diagnostic serveur
          </p>

          {statusError ? (
            <p className="text-red-400 text-sm">{statusError}</p>
          ) : adminStatus ? (
            <>
              <DiagRow label="ADMIN_EMAILS configuré"          ok={adminStatus.adminEmailsConfigured} />
              <DiagRow label="ACCESS_TOKEN_SECRET configuré"   ok={adminStatus.accessTokenSecretConfigured} />
              <DiagRow label="Supabase configuré"              ok={adminStatus.supabaseConfigured} />
            </>
          ) : (
            <p className="text-slate-500 text-sm animate-pulse">Chargement du diagnostic…</p>
          )}

          <hr className="border-dark-700 my-2" />

          <DiagRow label="Utilisateur connecté"   ok={!!session} value={session?.user?.email} />
          <DiagRow label="Admin reconnu"
            ok={isAdmin === true}
            value={isAdmin === null && session ? 'vérification…' : undefined}
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

function DiagRow({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-2">
        {value && <span className="text-slate-500 text-xs truncate max-w-[140px]">{value}</span>}
        <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${ok ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
          {value === 'vérification…' ? '…' : ok ? 'oui' : 'non'}
        </span>
      </span>
    </div>
  )
}
