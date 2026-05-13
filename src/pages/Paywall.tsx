import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchReport, createCheckoutSession } from '../lib/api'
import type { Report, Trajectory } from '../types'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

function FeasibilityBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-200 w-10 text-right">{score}%</span>
    </div>
  )
}

function TrajectoryCard({
  trajectory, index, locked, t,
}: {
  trajectory: Trajectory; index: number; locked: boolean
  t: ReturnType<typeof useTr>['paywall']
}) {
  const gradients = [
    'from-brand-600 via-purple-500 to-pink-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-amber-500 via-orange-500 to-red-500',
  ]

  return (
    <div className={`card relative overflow-hidden ${locked ? 'select-none' : ''}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index]} rounded-t-2xl`} />

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-900/80 backdrop-blur-sm rounded-2xl">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-slate-300 font-semibold text-center px-4">{t.locked}</p>
          <p className="text-slate-500 text-sm text-center mt-1 px-6">{t.lockedSub}</p>
        </div>
      )}

      <div className={locked ? 'blur-locked p-8' : 'p-8'}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {t.trajLabel} #{index + 1}
            </span>
            <h3 className="text-xl font-bold mt-1 text-slate-100">{trajectory.title}</h3>
            <p className="text-slate-400 italic text-sm mt-1">"{trajectory.tagline}"</p>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <div className={`text-3xl font-black ${
              trajectory.feasibilityScore >= 70 ? 'text-green-400'
              : trajectory.feasibilityScore >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {trajectory.feasibilityScore}%
            </div>
            <div className="text-xs text-slate-500">{t.feasibility}</div>
          </div>
        </div>

        <FeasibilityBar score={trajectory.feasibilityScore} />

        <div className="mt-5 space-y-3">
          {trajectory.description.map((para, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed">{para}</p>
          ))}
        </div>

        {trajectory.timeline.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{t.actionPlan}</h4>
            <div className="space-y-2">
              {trajectory.timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-400">{step.year}</span>
                    <p className="text-sm text-slate-300">{step.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {trajectory.skillsToDevlop.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{t.skillsLabel}</h4>
            <div className="flex flex-wrap gap-2">
              {trajectory.skillsToDevlop.map((skill) => (
                <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-dark-700 text-slate-400 border border-dark-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-600 mt-5 italic">{trajectory.feasibilityNote}</p>
      </div>
    </div>
  )
}

export default function Paywall() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const tr = useTr(lang)
  const t = tr.paywall

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reportId) return
    fetchReport(reportId)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [reportId])

  const handlePay = async () => {
    if (!report || !reportId) return
    setPaying(true)
    try {
      const { url } = await createCheckoutSession(reportId, report.email)
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : (lang === 'fr' ? 'Erreur de paiement' : 'Payment error'))
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-900 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="absolute top-4 right-4"><LanguageToggle /></div>
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">{t.notFound}</h2>
          <p className="text-slate-500 mb-6">{error || t.notFoundSub}</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary">{t.restartBtn}</button>
        </div>
      </div>
    )
  }

  const isPaid = report.status === 'paid' || report.status === 'emailed' || report.status === 'complete'
  const trajectories = report.trajectories || []

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
        <Logo size={30} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {!isPaid && (
            <button onClick={handlePay} disabled={paying} className="btn-primary text-sm py-2 px-5">
              {paying ? tr.c.redirecting : t.unlockBtn}
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600/15 border border-green-600/30 text-green-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {t.reportReady(report.firstName)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {lang === 'fr' ? <>Tes <span className="gradient-text">3 autres vies</span></> : <>Your <span className="gradient-text">3 other lives</span></>}
          </h1>
          <p className="text-slate-400">{isPaid ? t.paidSub : t.freeSub}</p>
        </div>

        <div className="space-y-8">
          {trajectories.map((traj, i) => (
            <TrajectoryCard key={traj.id} trajectory={traj} index={i} locked={!isPaid && i > 0} t={t} />
          ))}
        </div>

        {!isPaid && (
          <div className="mt-12 card p-8 text-center glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 to-transparent pointer-events-none rounded-2xl" />
            <div className="relative">
              <div className="text-4xl mb-4">🔓</div>
              <h2 className="text-2xl font-bold mb-2">{t.ctaTitle}</h2>
              <p className="text-slate-400 mb-2 max-w-md mx-auto">{t.ctaSub(report.email)}</p>
              <p className="text-brand-300 text-sm font-medium mb-6">{t.ctaUnlimited}</p>

              <div className="inline-flex flex-col items-center bg-dark-800/60 border border-dark-600 rounded-2xl px-8 py-5 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                    {t.priceBadge}
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-2 mt-2">
                  <span className="text-5xl font-black text-slate-100">{t.priceAmount}</span>
                  <span className="text-slate-400 text-sm">{t.pricePeriod}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm">
                  <span>{t.priceThen}</span>
                  <span className="font-semibold text-slate-400">{t.priceThenAmount}</span>
                  <span>· {t.priceThenSub}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-sm text-slate-400">
                {t.features.map((f) => (
                  <span key={f} className="flex items-center gap-1.5">
                    <span className="text-brand-400">✓</span> {f}
                  </span>
                ))}
              </div>

              <button onClick={handlePay} disabled={paying} className="btn-primary text-lg py-4 px-10">
                {paying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.ctaRedirecting}
                  </span>
                ) : t.ctaBtn}
              </button>
              <p className="text-xs text-slate-600 mt-3">{t.ctaNote}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
