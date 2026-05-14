import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyPayment } from '../lib/api'

const MAX_RETRIES = 6
const RETRY_DELAY = 2500 // ms

export default function Success() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()

  const reportId  = params.get('report_id') ?? ''
  const sessionId = params.get('session_id') ?? ''

  const [verified,  setVerified]  = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const attempts = useRef(0)

  useEffect(() => {
    if (!reportId || !sessionId) {
      // Pas de session_id → Stripe n'a pas redirigé normalement, renvoyer vers l'accueil
      if (!reportId) { navigate('/'); return }
      setError('Session de paiement introuvable. Si tu as payé, vérifie ton email ou relance le rapport.')
      setLoading(false)
      return
    }

    // Vérification directe auprès de Stripe (+ fallback DB si webhook en retard)
    const check = async () => {
      const { verified: ok, error: apiError } = await verifyPayment(sessionId, reportId)

      if (ok) {
        setVerified(true)
        setLoading(false)
        return
      }

      attempts.current += 1
      if (attempts.current >= MAX_RETRIES) {
        setError(
          apiError ??
          'Le paiement n\'a pas encore été confirmé. Veuillez finaliser votre accès pour consulter le rapport complet.'
        )
        setLoading(false)
        return
      }

      // Réessayer — Stripe peut prendre quelques secondes avant que la session soit 'paid'
      setTimeout(check, RETRY_DELAY)
    }

    check()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      {/* Glow décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-700/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-green-700/15 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg animate-fade-in">

        {/* ── Chargement ─────────────────────────────────────────── */}
        {loading && (
          <>
            <div className="w-20 h-20 rounded-full bg-brand-600/15 border-2 border-brand-500/30 flex items-center justify-center mx-auto mb-8">
              <div className="w-8 h-8 border-2 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-extrabold mb-3 text-slate-100">Confirmation en cours…</h1>
            <p className="text-slate-400">
              Nous vérifions ton paiement auprès de Stripe.
              <br />
              <span className="text-slate-500 text-sm">Cela prend généralement moins de 10 secondes.</span>
            </p>
          </>
        )}

        {/* ── Erreur de vérification ──────────────────────────────── */}
        {!loading && error && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-600/15 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-8 text-4xl">
              ⏳
            </div>
            <h1 className="text-2xl font-extrabold mb-3 text-slate-100">Paiement en cours de traitement</h1>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {reportId && (
                <button
                  onClick={() => { attempts.current = 0; setLoading(true); setError('') }}
                  className="btn-primary"
                >
                  Réessayer la vérification
                </button>
              )}
              <button onClick={() => navigate(`/paywall/${reportId}`)} className="btn-secondary">
                Retour au rapport
              </button>
            </div>
          </>
        )}

        {/* ── Paiement confirmé ───────────────────────────────────── */}
        {!loading && verified && (
          <>
            <div className="w-24 h-24 rounded-full bg-green-600/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-8 text-5xl">
              🎉
            </div>

            <h1 className="text-4xl font-extrabold mb-4">
              Paiement <span className="gradient-text">confirmé !</span>
            </h1>
            <p className="text-slate-300 text-lg mb-2">Tes 3 trajectoires complètes sont prêtes.</p>
            <p className="text-slate-500 text-sm mb-10">
              Accès illimité activé. Le rapport est disponible dès maintenant.
            </p>

            <div className="card p-6 text-left mb-8">
              <h3 className="font-semibold text-slate-200 mb-4">Dans ton rapport :</h3>
              <ul className="space-y-3">
                {[
                  { icon: '🛤️', text: '3 trajectoires de vie alternatives personnalisées' },
                  { icon: '📅', text: 'Timeline sur 5 ans avec jalons détaillés' },
                  { icon: '📊', text: 'Scores d\'adéquation, liberté, revenu et alignement' },
                  { icon: '🎯', text: 'Plan d\'action 30 jours + premier pas concret' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-sm text-slate-300">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/results/${reportId}${sessionId ? `?session_id=${sessionId}` : ''}`)}
                className="btn-primary text-lg py-3 px-8"
              >
                Voir mon rapport complet →
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary">
                Accueil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
