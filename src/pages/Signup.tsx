import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { translateAuthError } from '../lib/authErrors'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const tr = useTr(lang)
  const t = tr.auth

  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const validate = (): string | null => {
    if (!fullName.trim()) return lang === 'fr' ? "Merci d'entrer ton prénom." : 'Please enter your first name.'
    if (!email.trim())    return lang === 'fr' ? "L'email est requis." : 'Email is required.'
    if (password.length < 8)
      return lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.'
    if (password !== confirm)
      return lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    const { error, requiresConfirmation } = await signUp(email.trim(), password, fullName.trim())

    if (error) {
      setError(translateAuthError(error.message))
      setLoading(false)
      return
    }

    if (requiresConfirmation) {
      setEmailSent(true)
      setLoading(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="absolute top-4 right-4"><LanguageToggle /></div>
        <div className="card p-10 max-w-sm w-full text-center animate-fade-in">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-slate-100 mb-3">{t.emailSentTitle}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{t.emailSentSub(email)}</p>
          <p className="text-xs text-slate-600">{t.emailSentNote}</p>
          <div className="mt-6 pt-5 border-t border-dark-700">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    )
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
          <p className="text-slate-500 text-sm mt-1">{t.signupSub}</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-6">{t.signupTitle}</h1>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.firstNameLabel}</label>
              <input type="text" autoComplete="given-name" className="input-field" placeholder="Marie"
                value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.emailLabel}</label>
              <input type="email" autoComplete="email" className="input-field" placeholder="marie@exemple.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t.passwordLabel}
                <span className="text-slate-600 font-normal ml-1">{t.passwordMin}</span>
              </label>
              <input type="password" autoComplete="new-password" className="input-field" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.confirmPwdLabel}</label>
              <input type="password" autoComplete="new-password" className="input-field" placeholder="••••••••"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            {password.length > 0 && <PasswordStrength password={password} t={t} />}

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
                  {t.signingUp}
                </span>
              ) : t.signupBtn}
            </button>

            <p className="text-xs text-slate-600 text-center">
              {t.termsNote}{' '}
              <a href="#" className="text-slate-500 hover:text-slate-400">{t.termsLink}</a>.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t.hasAccount}{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">{t.loginLink}</Link>
        </p>
      </div>
    </div>
  )
}

function PasswordStrength({ password, t }: { password: string; t: ReturnType<typeof useTr>['auth'] }) {
  const checks = [
    { label: t.pwdCheck8,     ok: password.length >= 8 },
    { label: t.pwdCheckUpper, ok: /[A-Z]/.test(password) },
    { label: t.pwdCheckDigit, ok: /[0-9]/.test(password) },
  ]

  const score = checks.filter((c) => c.ok).length
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-green-500']
  const labels = [t.pwdStrengthWeak, t.pwdStrengthMedium, t.pwdStrengthStrong]

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : 'bg-dark-700'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs ${c.ok ? 'text-green-400' : 'text-slate-600'}`}>
              {c.ok ? '✓' : '·'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-medium ${colors[score - 1].replace('bg-', 'text-')}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  )
}
