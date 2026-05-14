import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SocialProofBeforeResults from '../components/SocialProofBeforeResults'

export default function SocialProof() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!reportId) navigate('/')
  }, [reportId, navigate])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Ton rapport est prêt
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Pendant ce temps, rencontre ceux qui ont sauté le pas
        </h1>
        <p className="text-gray-400 text-base max-w-xl mx-auto">
          Ils étaient dans la même situation que toi. Voici comment OtherMe les a aidés à tracer leur chemin.
        </p>
      </div>

      <SocialProofBeforeResults />

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={() => navigate(`/paywall/${reportId}`)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
        >
          Voir mon rapport de trajectoires →
        </button>
        <p className="text-gray-500 text-xs">Analyse personnalisée basée sur ton profil unique</p>
      </div>
    </div>
  )
}
