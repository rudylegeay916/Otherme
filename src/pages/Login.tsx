import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { translateAuthError } from '../lib/authErrors'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

export default function Login() {
  const { signIn }  = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { lang }    = useLanguage()
  const tr          = useTr(lang)
  const t           = tr.auth

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    if (error) { setError(translateAuthError(error.message)); setLoading(false); return }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-800/15 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-4 right-4"><LanguageToggle /></div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Logo size={40} className="justify-center" />
          <p className="text-slate-500 text-sm mt-2">{t.loginSub}</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-6">{t.loginTitle}</h1>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.emailLabel}</label>
              <input type="email" autoComplete="email" className="input-field" placeholder="marie@exemple.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">{t.passwordLabel}</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t.forgotLink}</Link>
              </div>
              <input type="password" autoComplete="current-password" className="input-field" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-900/20 border border-red-800/50 text-red-300 text-sm">
                <span className="flex-shrink-0 mt-0.5">⚠</span><span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.loggingIn}
                </span>
              ) : t.loginBtn}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t.noAccount}{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">{t.createAccountLink}</Link>
        </p>
      </div>
    </div>
  )
}
