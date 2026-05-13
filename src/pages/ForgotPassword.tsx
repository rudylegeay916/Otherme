import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { translateAuthError } from '../lib/authErrors'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('L\'email est requis.'); return }
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email.trim())
    setLoading(false)

    if (error) {
      setError(translateAuthError(error.message))
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="card p-10 max-w-sm w-full text-center animate-fade-in">
          <div className="text-5xl mb-4">📩</div>
          <h2 className="text-xl font-bold text-slate-100 mb-3">Email envoyé</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Un lien de réinitialisation a été envoyé à{' '}
            <strong className="text-slate-200">{email}</strong>.<br />
            Clique sur le lien pour choisir un nouveau mot de passe.
          </p>
          <p className="text-xs text-slate-600">Le lien expire dans 1 heure. Vérifie tes spams.</p>
          <div className="mt-6 pt-5 border-t border-dark-700">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-800/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Logo size={40} className="justify-center" />
          <p className="text-slate-500 text-sm mt-1">Réinitialise ton mot de passe</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-2">Mot de passe oublié</h1>
          <p className="text-slate-500 text-sm mb-6">
            Entre ton email pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="marie@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-900/20 border border-red-800/50 text-red-300 text-sm">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi…
                </span>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
