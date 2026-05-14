import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchReport, createCheckoutSession } from '../lib/api'
import type { PathData, Report } from '../types'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

const PATH_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  current_aligned: { label: 'Proche de ton parcours', color: 'text-blue-300', bg: 'bg-blue-900/30 border-blue-700/40' },
  passion_based:   { label: 'Basée sur tes passions',  color: 'text-purple-300', bg: 'bg-purple-900/30 border-purple-700/40' },
  high_potential:  { label: 'Fort potentiel',           color: 'text-amber-300',  bg: 'bg-amber-900/30 border-amber-700/40' },
}

function TeaserCard({ path, index }: { path: PathData; index: number }) {
  const gradients = [
    'from-blue-600 to-purple-500',
    'from-purple-600 to-pink-500',
    'from-amber-500 to-orange-500',
  ]
  const typeInfo = PATH_TYPE_LABELS[path.pathType] ?? PATH_TYPE_LABELS.current_aligned
  const shortTitle = path.title.length > 38 ? path.title.slice(0, 38) + '…' : path.title
  const shortDesc  = (path.longDescription || '').slice(0, 140) + '…'

  return (
    <div className="card relative overflow-hidden select-none">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index]} rounded-t-2xl`} />
      <div className="p-6">
        {/* Type badge */}
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${typeInfo.bg} ${typeInfo.color} mb-3`}>
          {typeInfo.label}
        </span>

        {/* Partial title */}
        <h3 className="text-lg font-bold text-slate-100 mb-1">{shortTitle}</h3>
        <p className="text-xs text-slate-500 mb-4">{path.sector}</p>

        {/* Partial description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{shortDesc}</p>

        {/* Blurred / locked content */}
        <div className="relative">
          <div className="space-y-2 blur-sm pointer-events-none select-none opacity-60">
            <div className="h-3 bg-dark-700 rounded w-full" />
            <div className="h-3 bg-dark-700 rounded w-5/6" />
            <div className="h-3 bg-dark-700 rounded w-4/6" />
            <div className="h-3 bg-dark-700 rounded w-full mt-4" />
            <div className="h-3 bg-dark-700 rounded w-3/4" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-dark-900/90 border border-dark-600 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
              <span className="text-lg">🔒</span>
              <span className="text-slate-300 text-sm font-medium">Contenu verrouillé</span>
            </div>
          </div>
        </div>

        {/* Revenue teaser */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <span>Revenu estimé</span>
          <span className="blur-sm select-none">████████████</span>
        </div>
      </div>
    </div>
  )
}

export default function Paywall() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate     = useNavigate()
  const { lang }     = useLanguage()
  const tr           = useTr(lang)
  const t            = tr.paywall

  const [report,    setReport]    = useState<Report | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [paying,    setPaying]    = useState(false)
  const [fetchErr,  setFetchErr]  = useState('')   // erreur chargement rapport
  const [payErr,    setPayErr]    = useState('')   // erreur paiement (inline)

  useEffect(() => {
    if (!reportId) return
    fetchReport(reportId)
      .then((r) => {
        setReport(r)
        if (r.status === 'paid' || r.status === 'complete') {
          navigate(`/results/${reportId}`, { replace: true })
        }
      })
      .catch((e) => setFetchErr(e.message))
      .finally(() => setLoading(false))
  }, [reportId, navigate])

  const handlePay = async () => {
    if (!report || !reportId) return
    setPayErr('')
    setPaying(true)
    try {
      const { url } = await createCheckoutSession(reportId, report.email)
      window.location.href = url
    } catch (e) {
      setPayErr(
        e instanceof Error
          ? e.message
          : (lang === 'fr'
              ? 'Le paiement n\'a pas pu être lancé. Réessaie dans quelques instants.'
              : 'Payment could not be started. Please try again.')
      )
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size={64} withText={false} to={null} className="mx-auto mb-4 opacity-80" />
          <p className="text-slate-400 text-sm">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (fetchErr || !report) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="absolute top-4 right-4"><LanguageToggle /></div>
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">{t.notFound}</h2>
          <p className="text-slate-500 mb-6">{fetchErr || t.notFoundSub}</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary">{t.restartBtn}</button>
        </div>
      </div>
    )
  }

  const paths: PathData[] = report.paths ?? []

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
        <Logo size={30} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button onClick={handlePay} disabled={paying} className="btn-primary text-sm py-2 px-5">
            {paying ? tr.c.redirecting : t.unlockBtn}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600/15 border border-green-600/30 text-green-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t.reportReady(report.firstName)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-100">
            {lang === 'fr'
              ? <>Tes <span className="gradient-text">3 trajectoires</span> sont prêtes</>
              : <>Your <span className="gradient-text">3 paths</span> are ready</>}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">{t.freeSub}</p>
        </div>

        {/* 3 Teaser cards */}
        {paths.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {paths.map((path, i) => (
              <TeaserCard key={path.pathType} path={path} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {[
              { label: 'Proche de ton parcours', color: 'text-blue-300', bg: 'bg-blue-900/30 border-blue-700/40', gradient: 'from-blue-600 to-purple-500' },
              { label: 'Basée sur tes passions',  color: 'text-purple-300', bg: 'bg-purple-900/30 border-purple-700/40', gradient: 'from-purple-600 to-pink-500' },
              { label: 'Fort potentiel',           color: 'text-amber-300', bg: 'bg-amber-900/30 border-amber-700/40', gradient: 'from-amber-500 to-orange-500' },
            ].map((info, i) => (
              <div key={i} className="card relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.gradient} rounded-t-2xl`} />
                <div className="p-6">
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${info.bg} ${info.color} mb-4`}>{info.label}</span>
                  <div className="space-y-2 blur-sm opacity-40">
                    <div className="h-4 bg-dark-700 rounded w-4/5" />
                    <div className="h-3 bg-dark-700 rounded w-full mt-3" />
                    <div className="h-3 bg-dark-700 rounded w-5/6" />
                    <div className="h-3 bg-dark-700 rounded w-4/6" />
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="bg-dark-900/90 border border-dark-600 rounded-xl px-4 py-2.5 flex items-center gap-2">
                      <span>🔒</span>
                      <span className="text-slate-300 text-sm font-medium">Contenu verrouillé</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA block */}
        <div className="card p-8 text-center glow relative overflow-hidden">
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

            {payErr && (
              <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-900/20 border border-red-700/50 text-red-300 text-sm text-left">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{payErr}</span>
              </div>
            )}

            <button onClick={handlePay} disabled={paying} className="btn-primary text-lg py-4 px-10">
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.ctaRedirecting}
                </span>
              ) : 'Débloquer mes 3 trajectoires complètes →'}
            </button>
            <p className="text-xs text-slate-600 mt-3">{t.ctaNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
