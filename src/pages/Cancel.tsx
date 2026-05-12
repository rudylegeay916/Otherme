import { useSearchParams, useNavigate } from 'react-router-dom'

export default function Cancel() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reportId = params.get('report_id')

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="relative z-10 text-center max-w-lg animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-8 text-4xl">
          😔
        </div>

        <h1 className="text-3xl font-bold mb-3 text-slate-100">Paiement annulé</h1>
        <p className="text-slate-400 mb-8">
          Pas de souci ! Ton rapport est toujours là. Tu peux relancer le paiement quand tu veux.
        </p>

        <div className="card p-6 mb-8 bg-brand-600/5 border-brand-800">
          <p className="text-sm text-slate-400">
            <span className="text-brand-400 font-medium">Rappel :</span> Ton rapport est disponible uniquement pendant <strong className="text-slate-300">72 heures</strong> après sa génération. Ne rate pas l'occasion de découvrir tes autres vies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reportId ? (
            <button
              onClick={() => navigate(`/paywall/${reportId}`)}
              className="btn-primary text-lg py-4 px-8"
            >
              Réessayer — 4,99 €
            </button>
          ) : (
            <button
              onClick={() => navigate('/onboarding')}
              className="btn-primary text-lg py-4 px-8"
            >
              Recommencer le formulaire
            </button>
          )}
          <button onClick={() => navigate('/')} className="btn-secondary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}
