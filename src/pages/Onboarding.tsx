import { useState, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitOnboarding } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import QuestionWithBubblesAndTextInput from '../components/QuestionWithBubblesAndTextInput'
import MotivationalCheckpoint from '../components/MotivationalCheckpoint'
import Logo from '../components/Logo'
import type { OnboardingData, QuestionAnswer } from '../types'
import {
  EMPTY_ANSWER, SITUATIONS, GENDERS, SECTORS, EDUCATION_LEVELS, LANGUAGES,
  LOADING_MESSAGES, QUESTIONS, getAdaptiveQuestions,
} from './onboarding-data'
import { saveProgress, loadProgress, clearProgress } from '../lib/onboardingStorage'

// ── Questions par étape (IDs dans QUESTIONS[]) ────────────────────
const STEP_QUESTION_IDS: string[][] = [
  [],                                                                      // Step 0 — Identité
  [],                                                                      // Step 1 — CV
  ['skills', 'askedFor', 'profile'],                                       // Step 2 — Compétences
  ['motivation', 'energy', 'interests', 'timeActivity'],                   // Step 3 — Passions
  ['lifestyle', 'workEnv', 'money', 'risk'],                               // Step 4 — Style de vie
  ['drains', 'vision5y', 'successCriteria', 'avoidNext', 'transitionTest'],// Step 5 — Projection
  ['relation', 'role', 'blocks', 'realisticPath'],                         // Step 6 — Profil
  [],                                                                      // Step 7 — Adaptatives
]

// Étapes après lesquelles on affiche un checkpoint (index 0..3)
const CHECKPOINT_AFTER: number[] = [3, 4, 5, 6]

// ── Contenu des checkpoints ───────────────────────────────────────

interface CheckpointContent {
  title:     string
  message:   string
  statLabel: string
  statValue: string
  icon:      string
  ctaLabel?: string
}

function detectSignals(answers: Record<string, QuestionAnswer>) {
  const motiv     = answers.motivation?.selectedOptions ?? []
  const lifestyle = answers.lifestyle?.selectedOptions  ?? []
  const energy    = answers.energy?.selectedOptions     ?? []
  const interests = answers.interests?.selectedOptions  ?? []
  const risk      = answers.risk?.selectedOptions       ?? []
  const money     = answers.money?.selectedOptions      ?? []

  return {
    liberty:     motiv.includes('Avoir plus de liberté') ||
                 lifestyle.some(o => ['Libre et flexible', 'Indépendante', 'Nomade / à distance'].includes(o)),
    creativity:  motiv.includes('Créer mon activité') ||
                 lifestyle.includes('Créative') ||
                 energy.some(o => ['Créer', 'Imaginer'].includes(o)) ||
                 interests.some(o => ['Art', 'Musique'].includes(o)),
    meaning:     motiv.some(o => ['Trouver plus de sens', 'Me sentir plus aligné'].includes(o)) ||
                 lifestyle.includes('Utile aux autres'),
    money:       motiv.includes('Gagner plus') ||
                 money.some(o => ['Hauts revenus', 'Indépendance financière'].includes(o)),
    progressive: motiv.includes('Me reconvertir progressivement') ||
                 risk.some(o => ['Je veux avancer progressivement', 'Je veux une transition douce',
                                 'Je veux sécuriser avant de changer'].includes(o)),
  }
}

function getCheckpointContent(
  index:   number,
  answers: Record<string, QuestionAnswer>,
): CheckpointContent {
  const s = detectSignals(answers)

  const generic: CheckpointContent[] = [
    // 0 — après Compétences
    {
      title:     'Ton profil commence à se dessiner.',
      message:   "Tes premières réponses permettent déjà à OtherMe de mieux comprendre ce qui te motive, ce qui t'attire et ce que tu veux éviter.",
      statLabel: 'Analyse',
      statValue: 'En cours',
      icon:      '🧩',
    },
    // 1 — après Passions (on injecte un message adaptatif ici)
    {
      title:     'Tu avances mieux que tu ne le penses.',
      message:   'Chaque réponse affine tes trajectoires. OtherMe commence à distinguer les environnements, les secteurs et les rôles qui pourraient vraiment te correspondre.',
      statLabel: 'Personnalisation',
      statValue: '+ précise',
      icon:      '📡',
    },
    // 2 — après Style de vie
    {
      title:     'Tes trajectoires deviennent plus précises.',
      message:   'Tes réponses ne servent pas à te mettre dans une case. Elles permettent de construire plusieurs chemins possibles à partir de ton parcours, tes envies et ta réalité.',
      statLabel: 'Trajectoires',
      statValue: '3 scénarios',
      icon:      '🗺️',
    },
    // 3 — avant les questions adaptatives
    {
      title:     'OtherMe va maintenant affiner ton profil.',
      message:   'Les prochaines questions sont adaptées à tes réponses. Elles servent à mieux distinguer les pistes réalistes, inspirantes et actionnables pour toi.',
      statLabel: 'Questions',
      statValue: 'Personnalisées',
      icon:      '✨',
      ctaLabel:  'Répondre aux questions personnalisées',
    },
  ]

  // Checkpoint 1 : message adaptatif selon profil détecté
  if (index === 1) {
    if (s.liberty) return {
      title:     'Ton envie de liberté ressort clairement.',
      message:   "OtherMe va privilégier des trajectoires qui peuvent t'offrir plus d'autonomie, sans ignorer ton besoin de sécurité.",
      statLabel: 'Signal détecté',
      statValue: 'Autonomie',
      icon:      '🦅',
    }
    if (s.creativity) return {
      title:     'Ton profil créatif commence à apparaître.',
      message:   "OtherMe va chercher des trajectoires où tu peux créer, imaginer, produire ou transformer des idées en projets concrets.",
      statLabel: 'Signal détecté',
      statValue: 'Créativité',
      icon:      '🎨',
    }
    if (s.meaning) return {
      title:     'Ton besoin de sens ressort dans tes réponses.',
      message:   "OtherMe va explorer des pistes où ton travail peut avoir plus d'impact, d'utilité ou d'alignement personnel.",
      statLabel: 'Signal détecté',
      statValue: 'Sens & impact',
      icon:      '💡',
    }
    if (s.money) return {
      title:     'Ton ambition est prise en compte.',
      message:   "OtherMe va chercher des trajectoires qui valorisent mieux tes compétences, tout en restant réalistes selon ton parcours.",
      statLabel: 'Signal détecté',
      statValue: 'Ambition',
      icon:      '🎯',
    }
  }

  // Checkpoint 2 : progressive transition
  if (index === 2 && s.progressive) return {
    title:     'Ta transition peut se construire étape par étape.',
    message:   "OtherMe ne va pas seulement proposer un métier final, mais aussi un chemin réaliste pour y arriver progressivement.",
    statLabel: 'Approche',
    statValue: 'Transition douce',
    icon:      '🪜',
  }

  return generic[index] ?? generic[0]
}

// ── Valeurs par défaut ────────────────────────────────────────────

const DEFAULT_DATA: OnboardingData = {
  firstName: '', email: '', age: 0, currentSituation: '',
  gender: '', city: '', answers: {},
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

// ── ChipSelect ────────────────────────────────────────────────────

function ChipSelect({
  options, selected, onChange, multi = true, label,
}: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void
  multi?: boolean; label?: string
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
  const navigate    = useNavigate()
  const { session } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step,              setStep]              = useState(0)
  const [data,              setData]              = useState<OnboardingData>(DEFAULT_DATA)
  const [cvFile,            setCvFile]            = useState<File | null>(null)
  const [cvMeta,            setCvMeta]            = useState<{ name: string; size: number } | null>(null)
  const [loading,           setLoading]           = useState(false)
  const [loadingMsg,        setLoadingMsg]        = useState(0)
  const [error,             setError]             = useState('')
  const [showingCheckpoint, setShowingCheckpoint] = useState<number | null>(null)

  // ── Restauration depuis localStorage ─────────────────────────────
  useEffect(() => {
    const saved = loadProgress()
    if (!saved) return
    setStep(saved.currentStep)
    setData(saved.data)
    if (saved.showingCheckpoint !== null) setShowingCheckpoint(saved.showingCheckpoint)
    if (saved.cvMeta) setCvMeta(saved.cvMeta)
  }, [])

  // ── Sauvegarde automatique ────────────────────────────────────────
  useEffect(() => {
    // Ne pas sauvegarder sur l'état par défaut vide
    if (!data.firstName && !data.email && step === 0) return
    saveProgress(step, data, cvFile, showingCheckpoint)
  }, [step, data, cvFile, showingCheckpoint])

  const answers = data.answers ?? {}

  const setField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) =>
    setData((d) => ({ ...d, [field]: value }))

  const setAnswer = (id: string, value: QuestionAnswer) =>
    setData((d) => ({ ...d, answers: { ...(d.answers ?? {}), [id]: value } }))

  const getAnswer = (id: string): QuestionAnswer =>
    answers[id] ?? { ...EMPTY_ANSWER }

  const adaptiveQuestions = useMemo(
    () => getAdaptiveQuestions(answers, data.currentSituation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step]
  )

  const TOTAL_STEPS = adaptiveQuestions.length > 0 ? 8 : 7

  // ── Validation ────────────────────────────────────────────────────
  const step0Valid = !!data.firstName.trim() && !!data.email.trim() &&
    data.age > 0 && !!data.currentSituation

  const canProceed = () => step === 0 ? step0Valid : true

  // ── Navigation ────────────────────────────────────────────────────
  const handleNext = () => {
    const checkpointIdx = CHECKPOINT_AFTER.indexOf(step)
    if (checkpointIdx !== -1) {
      setShowingCheckpoint(checkpointIdx)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (showingCheckpoint !== null) {
      setShowingCheckpoint(null)
      return
    }
    setStep((s) => Math.max(0, s - 1))
  }

  // ── Soumission ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const interval = setInterval(() => setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length), 2500)
    try {
      const { reportId } = await submitOnboarding(data, cvFile, session?.access_token)
      clearInterval(interval)
      clearProgress()
      navigate(`/paywall/${reportId}`)
    } catch (e) {
      clearInterval(interval)
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const isLastStep  = step === TOTAL_STEPS - 1
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100

  if (loading) return <LoadingScreen msgIdx={loadingMsg} />

  // ── Checkpoint motivationnel ──────────────────────────────────────
  if (showingCheckpoint !== null) {
    const content = getCheckpointContent(showingCheckpoint, answers)
    return (
      <MotivationalCheckpoint
        {...content}
        onContinue={() => {
          setShowingCheckpoint(null)
          setStep((s) => s + 1)
        }}
      />
    )
  }

  const currentQuestionIds: string[] =
    step === 7 ? adaptiveQuestions.map((q) => q.id) : (STEP_QUESTION_IDS[step] ?? [])

  const currentQuestions = currentQuestionIds
    .map((id) => QUESTIONS.find((q) => q.id === id) ?? adaptiveQuestions.find((q) => q.id === id) ?? null)
    .filter(Boolean)

  const stepTitles: Record<number, { title: string; sub: string }> = {
    0: { title: 'Parle-nous de toi',               sub: 'Quelques infos pour personnaliser ton analyse' },
    2: { title: 'Tes compétences & ton profil',    sub: 'Ce que tu sais faire et comment tu fonctionnes' },
    3: { title: 'Tes passions & ton énergie',      sub: "Ce qui t'anime naturellement" },
    4: { title: 'Ton style de vie idéal',          sub: 'Le cadre professionnel qui te correspond' },
    5: { title: 'Ta projection de vie',            sub: 'Ce que tu veux construire et éviter' },
    6: { title: 'Ton profil & tes blocages',       sub: 'Les derniers éléments pour affiner tes trajectoires' },
    7: { title: 'Questions adaptées à ton profil', sub: 'Quelques questions personnalisées selon tes réponses' },
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
        <Logo size={36} />
        <span className="text-sm text-slate-500">Étape {step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Barre de progression */}
      <div className="h-1 bg-dark-800">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Indicateur d'étapes */}
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
            {i < step && <span className="text-white text-[10px] font-bold">✓</span>}
          </div>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <div className="card p-6 md:p-8 animate-slide-up">

            {/* ── Étape 0 : Identité ──────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">{stepTitles[0].title}</h2>
                  <p className="text-slate-500 text-sm">{stepTitles[0].sub}</p>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Ville <span className="text-slate-600 font-normal">(optionnel)</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="Paris"
                    value={data.city ?? ''}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Genre <span className="text-slate-600 font-normal">(optionnel)</span>
                  </label>
                  <ChipSelect
                    options={GENDERS}
                    selected={data.gender ? [data.gender] : []}
                    onChange={(v) => setField('gender', v[0] ?? '')}
                    multi={false}
                  />
                </div>
              </div>
            )}

            {/* ── Étape 1 : CV ────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">
                    Ton CV <span className="text-slate-500 font-normal text-base">(optionnel)</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Ajoute ton CV pour permettre à OtherMe de personnaliser l'analyse. C'est optionnel, mais cela la rend beaucoup plus précise.
                  </p>
                </div>

                {/* Fichier CV sauvegardé mais non rechargeable */}
                {!cvFile && cvMeta && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-600/10 border border-brand-700/40">
                    <span className="text-xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-300 text-sm font-medium truncate">{cvMeta.name}</p>
                      <p className="text-slate-500 text-xs">CV de la session précédente · Re-charge le fichier si tu veux l'inclure</p>
                    </div>
                  </div>
                )}

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
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null
                      setCvFile(f)
                      if (f) setCvMeta({ name: f.name, size: f.size })
                    }}
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
                      <p className="text-slate-300 font-medium">Glisser ou cliquer pour ajouter ton CV</p>
                      <p className="text-slate-500 text-xs mt-1">PDF, DOCX ou TXT · Max 10 Mo</p>
                    </>
                  )}
                </div>

                <div className="space-y-4 pt-2 border-t border-dark-700">
                  <p className="text-sm text-slate-500">Ou renseigne ton parcours rapidement :</p>
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

            {/* ── Étapes 2–7 : questions ────────────────────────────── */}
            {step >= 2 && currentQuestions.length > 0 && (
              <div className="space-y-10">
                {stepTitles[step] && (
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">{stepTitles[step].title}</h2>
                    <p className="text-slate-500 text-sm">{stepTitles[step].sub}</p>
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

            {/* Étape 7 sans questions adaptatives */}
            {step === 7 && currentQuestions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">Profil complété !</h2>
                <p className="text-slate-400 text-sm">Tu peux générer ton rapport maintenant.</p>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Note finale */}
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
                onClick={handleBack}
                className={`btn-secondary ${step === 0 ? 'invisible' : ''}`}
              >
                ← Retour
              </button>

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
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
