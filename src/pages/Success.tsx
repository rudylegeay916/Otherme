import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchReport } from '../lib/api'
import type { Report } from '../types'

export default function Success() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  const reportId = params.get('report_id') || params.get('session_id')

  useEffect(() => {
    if (!reportId) {
      setLoading(false)
      return
    }
    // Poll until status is 'complete' (PDF sent) or max 20s
    let attempts = 0
    const poll = async () => {
      try {
        const r = await fetchReport(reportId)
        setReport(r)
        if (r.status === 'complete' || attempts >= 10) {
          setLoading(false)
        } else {
          attempts++
          setTimeout(poll, 2000)
        }
      } catch {
        setLoading(false)
      }
    }
    poll()
  }, [reportId])

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      {/* Confetti-like glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-700/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-green-700/15 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-green-600/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-8 text-5xl">
          🎉
        </div>

        <h1 className="text-4xl font-extrabold mb-4">
          Paiement <span className="gradient-text">confirmé !</span>
        </h1>

        {loading ? (
          <div className="mt-6">
            <p className="text-slate-400 mb-6">
              Ton rapport complet est en cours de finalisation...
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
              <span className="text-slate-500 text-sm">Génération du PDF en cours</span>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-300 text-lg mb-2">
              Ton rapport PDF a été envoyé à
            </p>
            {report?.email && (
              <p className="text-brand-400 font-semibold text-lg mb-6">{report.email}</p>
            )}
            <p className="text-slate-500 text-sm mb-10">
              Vérifie ta boite mail (et les spams). Le rapport contient tes 3 trajectoires complètes avec leur plan d'action.
            </p>
          </>
        )}

        <div className="card p-6 text-left mb-8">
          <h3 className="font-semibold text-slate-200 mb-4">Dans ton rapport :</h3>
          <ul className="space-y-3">
            {[
              { icon: '🛤️', text: '3 trajectoires de vie alternatives personnalisées' },
              { icon: '📅', text: 'Plan d\'action avec jalons pour chaque trajectoire' },
              { icon: '📊', text: 'Score de faisabilité et note d\'analyse' },
              { icon: '🎯', text: 'Compétences clés à développer pour chaque vie' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reportId && (
            <button
              onClick={() => navigate(`/paywall/${reportId}`)}
              className="btn-secondary"
            >
              Voir le rapport en ligne
            </button>
          )}
          <button onClick={() => navigate('/')} className="btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
