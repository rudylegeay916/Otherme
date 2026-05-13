import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AppNavbar from '../components/AppNavbar'
import { translateAuthError } from '../lib/authErrors'

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName]     = useState('')
  const [saveMsg, setSaveMsg]       = useState('')
  const [saveError, setSaveError]   = useState('')
  const [saving, setSaving]         = useState(false)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [pwdMsg, setPwdMsg]         = useState('')
  const [pwdError, setPwdError]     = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name as string)
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMsg('')
    setSaveError('')
    if (!fullName.trim()) { setSaveError('Le prénom ne peut pas être vide.'); return }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    })
    setSaving(false)

    if (error) {
      setSaveError(translateAuthError(error.message))
    } else {
      setSaveMsg('Profil mis à jour.')
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg('')
    setPwdError('')

    if (newPwd.length < 8) {
      setPwdError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!currentPwd.trim()) {
      setPwdError('Saisis ton mot de passe actuel.')
      return
    }

    setPwdLoading(true)

    // Re-authenticate first to validate current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPwd,
    })

    if (signInError) {
      setPwdError('Mot de passe actuel incorrect.')
      setPwdLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setPwdLoading(false)

    if (error) {
      setPwdError(translateAuthError(error.message))
    } else {
      setPwdMsg('Mot de passe modifié.')
      setCurrentPwd('')
      setNewPwd('')
      setTimeout(() => setPwdMsg(''), 3000)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <AppNavbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-100 mb-1">Mon compte</h1>
          <p className="text-slate-400 text-sm">{user?.email}</p>
        </div>

        {/* Profil */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-5">Informations personnelles</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom</label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ton prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field opacity-50 cursor-not-allowed"
                value={user?.email ?? ''}
                disabled
              />
              <p className="text-xs text-slate-600 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            {saveError && <FeedbackBox type="error" message={saveError} />}
            {saveMsg   && <FeedbackBox type="success" message={saveMsg} />}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                'Enregistrer'
              )}
            </button>
          </form>
        </section>

        {/* Mot de passe */}
        <section className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-5">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Mot de passe actuel
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nouveau mot de passe
                <span className="text-slate-600 font-normal ml-1">(min. 8 caractères)</span>
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="••••••••"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </div>

            {pwdError && <FeedbackBox type="error" message={pwdError} />}
            {pwdMsg   && <FeedbackBox type="success" message={pwdMsg} />}

            <button
              type="submit"
              disabled={pwdLoading}
              className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwdLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Modification…
                </span>
              ) : (
                'Modifier le mot de passe'
              )}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="card p-6 border-red-900/30">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Déconnexion</h2>
          <p className="text-sm text-slate-500 mb-4">
            Tu seras redirigé vers la page d'accueil.
          </p>
          <button
            onClick={handleLogout}
            className="py-2 px-6 rounded-xl border border-red-800/60 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Se déconnecter
          </button>
        </section>
      </main>
    </div>
  )
}

function FeedbackBox({ type, message }: { type: 'error' | 'success'; message: string }) {
  if (type === 'success') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-900/20 border border-green-800/50 text-green-300 text-sm">
        <span>✓</span>
        <span>{message}</span>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-900/20 border border-red-800/50 text-red-300 text-sm">
      <span className="flex-shrink-0 mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  )
}
