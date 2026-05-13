import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AppNavbar from '../components/AppNavbar'

// Statuts DB → affichage
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  emailed:   { label: 'Livré',     color: 'text-green-400',  dot: 'bg-green-400' },
  paid:      { label: 'Payé',      color: 'text-blue-400',   dot: 'bg-blue-400' },
  generated: { label: 'Généré',    color: 'text-brand-400',  dot: 'bg-brand-400' },
  draft:     { label: 'Brouillon', color: 'text-slate-500',  dot: 'bg-slate-500' },
  failed:    { label: 'Erreur',    color: 'text-red-400',    dot: 'bg-red-400' },
}

interface DbReport {
  id: string
  title: string | null
  summary: string | null
  status: string
  created_at: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [reports, setReports]   = useState<DbReport[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const firstName = (user?.user_metadata?.full_name as string | undefined)
    ?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'toi'

  useEffect(() => {
    if (!user) return

    supabase
      .from('reports')
      .select('id, title, summary, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('Impossible de charger tes rapports.')
        else setReports((data as DbReport[]) ?? [])
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-dark-950">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-100 mb-1">
            Bonjour, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400">
            {reports.length > 0
              ? `Tu as ${reports.length} rapport${reports.length > 1 ? 's' : ''} généré${reports.length > 1 ? 's' : ''}.`
              : 'Génère ton premier rapport pour découvrir tes autres vies.'}
          </p>
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Erreur */}
        {error && !loading && (
          <div className="card p-5 border-red-800/50 bg-red-900/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Liste des rapports */}
        {!loading && !error && reports.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}

        {/* État vide */}
        {!loading && !error && reports.length === 0 && (
          <EmptyState />
        )}

        {/* CTA nouveau rapport */}
        {!loading && reports.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => navigate('/onboarding')}
              className="btn-secondary"
            >
              + Générer un nouveau rapport
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Carte rapport ─────────────────────────────────────────────────

function ReportCard({ report }: { report: DbReport }) {
  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft
  const isPaid = report.status === 'paid' || report.status === 'emailed'

  const date = new Date(report.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="card p-6 flex flex-col gap-4 hover:border-brand-700 transition-colors duration-300 group">
      {/* Statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse-slow`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${status.color}`}>
            {status.label}
          </span>
        </div>
        <span className="text-xs text-slate-600">{date}</span>
      </div>

      {/* Titre */}
      <div className="flex-1">
        <h3 className="font-semibold text-slate-200 text-sm leading-snug line-clamp-2 mb-1">
          {report.title ?? 'Rapport sans titre'}
        </h3>
        {report.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 italic">"{report.summary}"</p>
        )}
      </div>

      {/* Actions */}
      {isPaid ? (
        <Link
          to={`/paywall/${report.id}`}
          className="btn-primary py-2 px-4 text-sm justify-center"
        >
          Voir le rapport →
        </Link>
      ) : (
        <Link
          to={`/paywall/${report.id}`}
          className="btn-secondary py-2 px-4 text-sm justify-center"
        >
          Débloquer — 4,99 €
        </Link>
      )}
    </div>
  )
}

// ── État vide ─────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-2xl font-bold text-slate-200 mb-3">
        Prêt à explorer tes autres vies ?
      </h2>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Réponds à quelques questions sur ton parcours et l'IA va générer 3 trajectoires de vie alternatives personnalisées.
      </p>
      <button onClick={() => navigate('/onboarding')} className="btn-primary text-base py-3 px-8">
        Démarrer l'analyse IA →
      </button>
      <p className="text-xs text-slate-600 mt-4">
        5 minutes · Rapport en 30 secondes · 4,99 €
      </p>
    </div>
  )
}
