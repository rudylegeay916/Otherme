import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitOnboarding } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { OnboardingData } from '../types'

const STEPS_LABELS = [
  'Infos de base',
  'Situation actuelle',
  'Formation',
  'Tes rêves',
  'Tes atouts',
  'Ton CV',
]

const SECTORS = [
  'Technologie & Digital', 'Finance & Banque', 'Santé & Médical',
  'Éducation & Formation', 'Art & Culture', 'Commerce & Vente',
  'Industrie & Manufacturing', 'Conseil & Management', 'Droit & Justice',
  'Marketing & Communication', 'Ressources humaines', 'Agriculture & Environnement',
  'Immobilier & Construction', 'Transport & Logistique', 'Autre',
]

const EDUCATION_LEVELS = [
  'Bac', 'Bac+2 / BTS / DUT', 'Bac+3 / Licence',
  'Bac+4 / Master 1', 'Bac+5 / Master / Ingénieur', 'Bac+8 / Doctorat',
  'Formation professionnelle', 'Autodidacte',
]

const VALUES_OPTIONS = [
  'Liberté', 'Créativité', 'Impact social', 'Famille', 'Reconnaissance',
  'Aventure', 'Sécurité', 'Indépendance', 'Innovation', 'Équilibre vie pro/perso',
]

const STRENGTHS_OPTIONS = [
  'Leadership', 'Créativité', 'Analyse', 'Communication', 'Organisation',
  'Empathie', 'Persévérance', 'Adaptabilité', 'Esprit d\'équipe', 'Initiative',
]

const LANGUAGES_OPTIONS = [
  'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien',
  'Arabe', 'Mandarin', 'Portugais', 'Japonais', 'Autre',
]

const LOADING_MESSAGES = [
  "L'IA analyse ton parcours...",
  "Exploration de tes potentiels cachés...",
  "Construction de tes trajectoires alternatives...",
  "Calcul des scores de faisabilité...",
  "Finalisation de ton rapport personnalisé...",
]

function MultiSelect({
  options,
  selected,
  onChange,
  max = 5,
  label,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  max?: number
  label?: string
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else if (selected.length < max) {
      onChange([...selected, opt])
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-3">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                active
                  ? 'bg-brand-600 border-brand-500 text-white'
                  : 'bg-dark-800 border-dark-600 text-slate-400 hover:border-brand-700 hover:text-slate-200'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {max && <p className="text-xs text-slate-600 mt-2">Max {max} choix · {selected.length}/{max} sélectionnés</p>}
    </div>
  )
}

const DEFAULT_DATA: OnboardingData = {
  firstName: '',
  email: '',
  age: 25,
  city: '',
  currentJob: '',
  sector: '',
  yearsExperience: 1,
  educationLevel: '',
  educationField: '',
  dreamJob: '',
  values: [],
  strengths: [],
  languages: ['Français'],
  cvText: '',
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof OnboardingData, value: unknown) =>
    setData((d) => ({ ...d, [field]: value }))

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!data.firstName && !!data.email && !!data.city && data.age > 0
      case 1: return !!data.currentJob && !!data.sector && data.yearsExperience >= 0
      case 2: return !!data.educationLevel && !!data.educationField
      case 3: return !!data.dreamJob && data.values.length > 0
      case 4: return data.strengths.length > 0 && data.languages.length > 0
      case 5: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const interval = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length)
    }, 2500)

    try {
      const { reportId } = await submitOnboarding(data, cvFile, session?.access_token)
      clearInterval(interval)
      navigate(`/paywall/${reportId}`)
    } catch (e) {
      clearInterval(interval)
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-brand-900" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-brand-600/20 flex items-center justify-center text-2xl">
              ✨
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">{LOADING_MESSAGES[loadingMsg]}</h2>
          <p className="text-slate-500 text-sm">Cela peut prendre 15 à 30 secondes</p>
          <div className="mt-8 h-1.5 bg-dark-700 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full animate-pulse-slow w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
        <span className="text-xl font-bold gradient-text">OtherMe</span>
        <span className="text-sm text-slate-500">Étape {step + 1} / {STEPS_LABELS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-dark-800">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS_LABELS.length) * 100}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-6 px-4">
        {STEPS_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step
                  ? 'bg-brand-600 text-white'
                  : i === step
                  ? 'bg-brand-600/30 border border-brand-500 text-brand-300'
                  : 'bg-dark-800 text-slate-600'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS_LABELS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < step ? 'bg-brand-600' : 'bg-dark-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          <div className="card p-8 animate-slide-up">
            {/* Step 0: Infos de base */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Parle-nous de toi</h2>
                  <p className="text-slate-500 text-sm">Les bases pour personnaliser ton rapport</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom *</label>
                    <input className="input-field" placeholder="Marie" value={data.firstName}
                      onChange={(e) => set('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Âge *</label>
                    <input className="input-field" type="number" min={16} max={70} value={data.age}
                      onChange={(e) => set('age', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                  <input className="input-field" type="email" placeholder="marie@exemple.com" value={data.email}
                    onChange={(e) => set('email', e.target.value)} />
                  <p className="text-xs text-slate-600 mt-1">Pour recevoir ton rapport PDF par email</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Ville *</label>
                  <input className="input-field" placeholder="Paris" value={data.city}
                    onChange={(e) => set('city', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 1: Situation actuelle */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ta situation actuelle</h2>
                  <p className="text-slate-500 text-sm">Ton point de départ pour construire tes alternatives</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Métier actuel *</label>
                  <input className="input-field" placeholder="Chef de projet, Développeur, Infirmière..." value={data.currentJob}
                    onChange={(e) => set('currentJob', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Secteur d'activité *</label>
                  <select className="input-field" value={data.sector}
                    onChange={(e) => set('sector', e.target.value)}>
                    <option value="">Choisir un secteur...</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Années d'expérience *</label>
                  <input className="input-field" type="number" min={0} max={40} value={data.yearsExperience}
                    onChange={(e) => set('yearsExperience', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            )}

            {/* Step 2: Formation */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ta formation</h2>
                  <p className="text-slate-500 text-sm">Ton bagage académique influence tes trajectoires</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Niveau d'études *</label>
                  <select className="input-field" value={data.educationLevel}
                    onChange={(e) => set('educationLevel', e.target.value)}>
                    <option value="">Choisir un niveau...</option>
                    {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Domaine de formation *</label>
                  <input className="input-field" placeholder="Informatique, Droit, Médecine, Marketing..."
                    value={data.educationField}
                    onChange={(e) => set('educationField', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 3: Rêves */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Tes aspirations</h2>
                  <p className="text-slate-500 text-sm">Ce qui te motive profondément</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Si tu pouvais faire n'importe quoi, ce serait... *</label>
                  <input className="input-field" placeholder="Photographe, entrepreneur, musicien, vétérinaire..."
                    value={data.dreamJob}
                    onChange={(e) => set('dreamJob', e.target.value)} />
                </div>
                <MultiSelect
                  label="Tes valeurs importantes * (max 3)"
                  options={VALUES_OPTIONS}
                  selected={data.values}
                  onChange={(v) => set('values', v)}
                  max={3}
                />
              </div>
            )}

            {/* Step 4: Atouts */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Tes atouts</h2>
                  <p className="text-slate-500 text-sm">Ce qui te distingue des autres</p>
                </div>
                <MultiSelect
                  label="Tes points forts * (max 4)"
                  options={STRENGTHS_OPTIONS}
                  selected={data.strengths}
                  onChange={(v) => set('strengths', v)}
                  max={4}
                />
                <MultiSelect
                  label="Langues parlées *"
                  options={LANGUAGES_OPTIONS}
                  selected={data.languages}
                  onChange={(v) => set('languages', v)}
                  max={5}
                />
              </div>
            )}

            {/* Step 5: CV */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Ton CV <span className="text-slate-500 font-normal text-base">(optionnel)</span></h2>
                  <p className="text-slate-500 text-sm">Un CV enrichit considérablement la personnalisation</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    cvFile
                      ? 'border-brand-600 bg-brand-600/10'
                      : 'border-dark-600 hover:border-brand-700 hover:bg-dark-800/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                  {cvFile ? (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-brand-300 font-medium">{cvFile.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(cvFile.size / 1024).toFixed(0)} Ko · Cliquer pour changer</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-slate-300 font-medium">Glisser ou cliquer pour ajouter ton CV</p>
                      <p className="text-slate-500 text-xs mt-1">PDF, DOCX ou TXT · Max 10 Mo</p>
                    </div>
                  )}
                </div>

                <div className="card p-4 bg-brand-600/5 border-brand-800">
                  <p className="text-sm text-slate-400">
                    <span className="text-brand-400 font-medium">Prêt à découvrir tes autres vies.</span>{' '}
                    L'IA va maintenant analyser ton profil complet et générer 3 trajectoires alternatives personnalisées. Résultat en ~30 secondes.
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className={`btn-secondary ${step === 0 ? 'invisible' : ''}`}
              >
                ← Retour
              </button>

              {step < STEPS_LABELS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  Générer mon rapport ✨
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
