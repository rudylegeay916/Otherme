import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitOnboarding } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import QuestionWithBubblesAndTextInput from '../components/QuestionWithBubblesAndTextInput'
import type { OnboardingData, QuestionAnswer } from '../types'
import {
  EMPTY_ANSWER, SITUATIONS, GENDERS, SECTORS, EDUCATION_LEVELS, LANGUAGES,
  LOADING_MESSAGES, QUESTIONS, getAdaptiveQuestions,
} from './onboarding-data'

// ── Questions par étape (indices dans QUESTIONS[]) ────────────────

const STEP_QUESTION_IDS: string[][] = [
  [],                                                          // Step 0 — Identité (formulaire custom)
  [],                                                          // Step 1 — CV (formulaire custom)
  ['skills', 'askedFor', 'profile'],                          // Step 2 — Parcours & compétences
  ['motivation', 'energy', 'interests', 'timeActivity'],      // Step 3 — Passions & énergie
  ['lifestyle', 'workEnv', 'money', 'risk'],                  // Step 4 — Motivations & style de vie
  ['drains', 'vision5y', 'successCriteria', 'avoidNext', 'transitionTest'], // Step 5 — Projection
  ['relation', 'role', 'blocks', 'realisticPath'],            // Step 6 — Questions finales
  [],                                                          // Step 7 — Adaptatives (dynamique)
]

const STEP_LABELS = [
  'Identité', 'Ton CV', 'Compétences', 'Passions',
  'Style de vie', 'Projection', 'Profil', 'Pour toi',
]

// ── Helpers ───────────────────────────────────────────────────────

const emptyAnswers = (): Record<string, QuestionAnswer> => ({})

const DEFAULT_DATA: OnboardingData = {
  firstName: '',
  email: '',
  age: 0,
  currentSituation: '',
  gender: '',
  city: '',
  answers: emptyAnswers(),
}

function getQ(id: string) {
  return QUESTIONS.find((q) => q.id === id)!
}

// ── Écran de chargement ───────────────────────────────────────────

function LoadingScreen({ msgIdx }: { msgIdx: number }) {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-brand-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-brand-600/20 flex items-center justify-center text-2xl">✨</div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-100">{LOADING_MESSAGES[msgIdx]}</h2>
        <p className="text-slate-500 text-sm">Cela peut prendre 15 à 30 secondes</p>
        <div className="mt-8 h-1.5 bg-dark-700 rounded-full overflow-hidden max-w-xs mx-auto">
          <div className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full animate-pulse-slow w-3/4" />
        </div>
      </div>
    </div>
  )
}

// ── Composant MultiSelect simple ──────────────────────────────────

function ChipSelect({
  options, selected, onChange, multi = true, label,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  multi?: boolean
  label?: string
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else if (multi) {
      onChange([...selected, opt])
    } else {
      onChange([opt])
    }
  }
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3.5 py-2 rounded-full text-sm border transition-all duration-200 ${
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
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [error, setError] = useState('')

  const answers = data.answers ?? {}

  const setField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) =>
    setData((d) => ({ ...d, [field]: value }))

  const setAnswer = (id: string, value: QuestionAnswer) =>
    setData((d) => ({ ...d, answers: { ...(d.answers ?? {}), [id]: value } }))

  const getAnswer = (id: string): QuestionAnswer =>
    answers[id] ?? { ...EMPTY_ANSWER }

  // Questions adaptatives calculées à partir des réponses de l'étape 6
  const adaptiveQuestions = useMemo(
    () => getAdaptiveQuestions(answers, data.currentSituation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step] // recalculate only when advancing to step 7
  )

  const TOTAL_STEPS = adaptiveQuestions.length > 0 ? 8 : 7

  // ── Validation step 0 ───────────────────────────────────────────
  const step0Valid = !!data.firstName.trim() && !!data.email.trim() &&
    data.age > 0 && !!data.currentSituation

  const canProceed = (): boolean => {
    if (step === 0) return step0Valid
    return true // toutes les autres étapes sont optionnelles
  }

  // ── Soumission ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const interval = setInterval(() => setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length), 2500)
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

  const isLastStep = step === TOTAL_STEPS - 1
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100

  if (loading) return <LoadingScreen msgIdx={loadingMsg} />

  // ── IDs de questions pour l'étape courante ──────────────────────
  const currentQuestionIds: string[] =
    step === 7 ? adaptiveQuestions.map((q) => q.id) : (STEP_QUESTION_IDS[step] ?? [])

  // Questions à afficher dans cette étape
  const currentQuestions = currentQuestionIds.map((id) => {
    const base = QUESTIONS.find((q) => q.id === id)
    if (base) return base
    return adaptiveQuestions.find((q) => q.id === id) ?? null
  }).filter(Boolean)

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
        <span className="text-xl font-bold gradient-text">OtherMe</span>
        <span className="text-sm text-slate-500">Étape {step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Barre de progression */}
      <div className="h-1 bg-dark-800">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Indicateur d'étapes (compact) */}
      <div className="flex items-center justify-center gap-1.5 py-4 px-4 overflow-x-auto">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`flex-shrink-0 transition-all duration-300 ${
              i < step
                ? 'w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center'
                : i === step
                ? 'w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500'
                : 'w-2 h-2 rounded-full bg-dark-700'
            }`}
          >
            {i < step && (
              <span className="text-white text-[10px] font-bold">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <div className="card p-6 md:p-8 animate-slide-up">

            {/* ── Étape 0 : Identité ─────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">Parle-nous de toi</h2>
                  <p className="text-slate-500 text-sm">Quelques infos pour personnaliser ton analyse</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Prénom *</label>
                    <input
                      className="input-field"
                      placeholder="Marie"
                      value={data.firstName}
                      onChange={(e) => setField('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Âge *</label>
                    <input
                      className="input-field"
                      type="number"
                      min={16}
                      max={75}
                      placeholder="28"
                      value={data.age || ''}
                      onChange={(e) => setField('age', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="marie@exemple.com"
                    value={data.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                  <p className="text-xs text-slate-600 mt-1">Pour recevoir ton rapport PDF</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Situation actuelle *</label>
                  <ChipSelect
                    options={SITUATIONS}
                    selected={data.currentSituation ? [data.currentSituation] : []}
                    onChange={(v) => setField('currentSituation', v[0] ?? '')}
                    multi={false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Ville <span className="text-slate-600 font-normal">(optionnel)</span></label>
                  <input
                    className="input-field"
                    placeholder="Paris"
                    value={data.city ?? ''}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Genre <span className="text-slate-600 font-normal">(optionnel)</span></label>
                  <ChipSelect
                    options={GENDERS}
                    selected={data.gender ? [data.gender] : []}
                    onChange={(v) => setField('gender', v[0] ?? '')}
                    multi={false}
                  />
                </div>
              </div>
            )}

            {/* ── Étape 1 : CV ───────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">
                    Ton CV <span className="text-slate-500 font-normal text-base">(optionnel)</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Ajoutez votre CV pour permettre à OtherMe de personnaliser les prochaines questions.
                    C'est optionnel, mais cela rendra l'analyse beaucoup plus précise.
                  </p>
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
                    <>
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-brand-300 font-medium">{cvFile.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(cvFile.size / 1024).toFixed(0)} Ko · Cliquer pour changer</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-slate-300 font-medium">Glisser ou cliquer pour ajouter votre CV</p>
                      <p className="text-slate-500 text-xs mt-1">PDF, DOCX ou TXT · Max 10 Mo</p>
                    </>
                  )}
                </div>

                {/* Parcours rapide (optionnel) */}
                <div className="space-y-4 pt-2 border-t border-dark-700">
                  <p className="text-sm text-slate-500">Ou renseignez votre parcours rapidement :</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Métier actuel</label>
                    <input
                      className="input-field"
                      placeholder="Chef de projet, Développeur, Infirmière…"
                      value={data.currentJob ?? ''}
                      onChange={(e) => setField('currentJob', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Secteur</label>
                      <select
                        className="input-field"
                        value={data.sector ?? ''}
                        onChange={(e) => setField('sector', e.target.value)}
                      >
                        <option value="">Choisir…</option>
                        {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Années d'expérience</label>
                      <input
                        className="input-field"
                        type="number"
                        min={0}
                        max={40}
                        placeholder="5"
                        value={data.yearsExperience ?? ''}
                        onChange={(e) => setField('yearsExperience', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Niveau d'études</label>
                      <select
                        className="input-field"
                        value={data.educationLevel ?? ''}
                        onChange={(e) => setField('educationLevel', e.target.value)}
                      >
                        <option value="">Choisir…</option>
                        {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Domaine</label>
                      <input
                        className="input-field"
                        placeholder="Informatique, Droit…"
                        value={data.educationField ?? ''}
                        onChange={(e) => setField('educationField', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Langues parlées</label>
                    <ChipSelect
                      options={LANGUAGES}
                      selected={data.languages ?? []}
                      onChange={(v) => setField('languages', v)}
                      multi={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Étapes 2–7 : questions ─────────────────────────── */}
            {step >= 2 && currentQuestions.length > 0 && (
              <div className="space-y-10">
                {step === 2 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Tes compétences & ton profil</h2>
                    <p className="text-slate-500 text-sm">Ce que vous savez faire et comment vous fonctionnez</p>
                  </div>
                )}
                {step === 3 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Tes passions & ton énergie</h2>
                    <p className="text-slate-500 text-sm">Ce qui vous anime naturellement</p>
                  </div>
                )}
                {step === 4 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Ton style de vie idéal</h2>
                    <p className="text-slate-500 text-sm">Le cadre de vie professionnel qui vous correspond</p>
                  </div>
                )}
                {step === 5 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Ta projection de vie</h2>
                    <p className="text-slate-500 text-sm">Ce que vous voulez construire et éviter</p>
                  </div>
                )}
                {step === 6 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Ton profil & tes blocages</h2>
                    <p className="text-slate-500 text-sm">Les derniers éléments pour affiner vos trajectoires</p>
                  </div>
                )}
                {step === 7 && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">Questions adaptées à ton profil</h2>
                    <p className="text-slate-500 text-sm">Quelques questions personnalisées selon vos réponses</p>
                  </div>
                )}

                {currentQuestions.map((q) => q && (
                  <div key={q.id} className="border-t border-dark-700 pt-8 first:border-0 first:pt-0">
                    <QuestionWithBubblesAndTextInput
                      questionTitle={q.title}
                      questionSubtitle={q.subtitle}
                      bubbleOptions={q.bubbles}
                      allowMultiple={q.allowMultiple}
                      value={getAnswer(q.id)}
                      onChange={(v) => setAnswer(q.id, v)}
                      placeholder={q.placeholder}
                      onSkip={() => setAnswer(q.id, EMPTY_ANSWER)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Étape 7 vide = pas de questions adaptatives */}
            {step === 7 && currentQuestions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Profil complété !</h2>
                <p className="text-slate-400 text-sm">Vous pouvez générer votre rapport maintenant.</p>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Note finale avant soumission */}
            {isLastStep && (
              <div className="mt-6 card p-4 bg-brand-600/5 border-brand-800">
                <p className="text-sm text-slate-400">
                  <span className="text-brand-400 font-medium">Prêt à découvrir tes autres vies.</span>{' '}
                  L'IA va analyser ton profil complet et générer 3 trajectoires alternatives personnalisées. Résultat en ~30 secondes.
                </p>
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

              {!isLastStep ? (
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
