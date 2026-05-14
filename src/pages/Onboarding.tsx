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
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'
import { getLocalizedData } from './onboarding-data'
import LanguageToggle from '../components/LanguageToggle'

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
  tr:      import('../lib/i18n/translations').Tr,
): CheckpointContent {
  const s = detectSignals(answers)
  const c = tr.cp

  const generic: CheckpointContent[] = c.generic.map(g => ({ ...g }))

  if (index === 1) {
    if (s.liberty)    return c.liberty
    if (s.creativity) return c.creativity
    if (s.meaning)    return c.meaning
    if (s.money)      return c.money
  }
  if (index === 2 && s.progressive) return c.progressive

  return generic[index] ?? generic[0]
}

// ── Valeurs par défaut ────────────────────────────────────────────

const DEFAULT_DATA: OnboardingData = {
  firstName: '', email: '', age: 0, currentSituation: '',
  gender: '', city: '', answers: {},
}

// ── Écran de chargement ───────────────────────────────────────────

function LoadingScreen({ msgIdx, messages }: { msgIdx: number; messages: string[] }) {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="relative mx-auto mb-8 w-fit">
          <div className="absolute -inset-3 rounded-full bg-purple-600/20 blur-xl animate-pulse-slow" />
          <Logo size={80} withText={false} to={null} />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-100">{messages[msgIdx]}</h2>
        <p className="text-slate-500 text-sm">{messages.length > 0 ? '15 – 30 sec' : ''}</p>
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
  const { lang }    = useLanguage()
  const tr          = useTr(lang)
  const ld          = getLocalizedData(lang)

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
    () => ld.getAdaptiveQuestions(answers, data.currentSituation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, lang]
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
      navigate(`/social-proof/${reportId}`)
    } catch (e) {
      clearInterval(interval)
      console.error('[Onboarding] Erreur génération rapport:', e)
      const msg = e instanceof Error ? e.message : 'Une erreur est survenue'
      setError(`${msg} — Vérifie ta connexion et réessaie.`)
      setLoading(false)
    }
  }

  const isLastStep  = step === TOTAL_STEPS - 1
  const progressPct = ((step + 1) / TOTAL_STEPS) * 100

  if (loading) return <LoadingScreen msgIdx={loadingMsg} messages={tr.onb.loadingMessages} />

  // ── Checkpoint motivationnel ──────────────────────────────────────
  if (showingCheckpoint !== null) {
    const content = getCheckpointContent(showingCheckpoint, answers, tr)
    return (
      <MotivationalCheckpoint
        {...content}
        footer={tr.cp.footer}
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
    .map((id) => ld.QUESTIONS.find((q) => q.id === id) ?? adaptiveQuestions.find((q) => q.id === id) ?? null)
    .filter(Boolean)

  const stepTitles = tr.onb.stepTitles

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* ── Sticky top nav ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
        {/* Row 1: Logo / Back / Continue */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={40} />
            {step > 0 && (
              <>
                <div className="hidden sm:block h-4 w-px bg-dark-700 mx-1" />
                <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[160px]">
                  {stepTitles[step]?.title ?? ''}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                ← {tr.c.back}
              </button>
            )}
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tr.c.continue} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary text-sm py-1.5 px-4"
              >
                {tr.onb.generateBtn}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Progress bar + step counter */}
        <div className="px-4 pb-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{tr.c.stepLabel(step + 1, TOTAL_STEPS)}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2 overflow-x-auto py-0.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 transition-all duration-300 ${
                  i < step
                    ? 'w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center'
                    : i === step
                    ? 'w-4 h-4 rounded-full bg-brand-600/30 border border-brand-500'
                    : 'w-1.5 h-1.5 rounded-full bg-dark-700'
                }`}
              >
                {i < step && <span className="text-white text-[9px] font-bold">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 pb-16">
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
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldFirstName}</label>
                    <input
                      className="input-field"
                      placeholder="Marie"
                      value={data.firstName}
                      onChange={(e) => setField('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldAge}</label>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldEmail}</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="marie@exemple.com"
                    value={data.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                  <p className="text-xs text-slate-600 mt-1">{tr.onb.fieldEmailNote}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{tr.onb.fieldSituation}</label>
                  <ChipSelect
                    options={ld.SITUATIONS}
                    selected={data.currentSituation ? [data.currentSituation] : []}
                    onChange={(v) => setField('currentSituation', v[0] ?? '')}
                    multi={false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {tr.onb.fieldCity} <span className="text-slate-600 font-normal">({tr.c.optional})</span>
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
                    {tr.onb.fieldGender} <span className="text-slate-600 font-normal">({tr.c.optional})</span>
                  </label>
                  <ChipSelect
                    options={ld.GENDERS}
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
                    {tr.onb.cvTitle} <span className="text-slate-500 font-normal text-base">({tr.c.optional})</span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{tr.onb.cvSub}</p>
                </div>

                {/* Fichier CV sauvegardé mais non rechargeable */}
                {!cvFile && cvMeta && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-600/10 border border-brand-700/40">
                    <span className="text-xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-300 text-sm font-medium truncate">{cvMeta.name}</p>
                      <p className="text-slate-500 text-xs">{tr.onb.cvSavedNote}</p>
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
                      <p className="text-slate-500 text-xs mt-1">{(cvFile.size / 1024).toFixed(0)} Ko · {tr.onb.cvClickChange}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-slate-300 font-medium">{tr.onb.cvDropTitle}</p>
                      <p className="text-slate-500 text-xs mt-1">{tr.onb.cvDropSub}</p>
                    </>
                  )}
                </div>

                <div className="space-y-4 pt-2 border-t border-dark-700">
                  <p className="text-sm text-slate-500">{tr.onb.cvQuickTitle}</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldJob}</label>
                    <input
                      className="input-field"
                      placeholder="Chef de projet, Développeur, Infirmière…"
                      value={data.currentJob ?? ''}
                      onChange={(e) => setField('currentJob', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldSector}</label>
                      <select
                        className="input-field"
                        value={data.sector ?? ''}
                        onChange={(e) => setField('sector', e.target.value)}
                      >
                        <option value="">{tr.onb.chooseLabel}</option>
                        {ld.SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldExp}</label>
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
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldEducLevel}</label>
                      <select
                        className="input-field"
                        value={data.educationLevel ?? ''}
                        onChange={(e) => setField('educationLevel', e.target.value)}
                      >
                        <option value="">{tr.onb.chooseLabel}</option>
                        {ld.EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{tr.onb.fieldEducField}</label>
                      <input
                        className="input-field"
                        placeholder="Informatique, Droit…"
                        value={data.educationField ?? ''}
                        onChange={(e) => setField('educationField', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{tr.onb.fieldLanguages}</label>
                    <ChipSelect
                      options={ld.LANGUAGES}
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
                  <span className="text-brand-400 font-medium">{tr.onb.readyAccent}</span>{' '}
                  {tr.onb.readyText}
                </p>
              </div>
            )}

            {/* Navigation bottom (duplicate for long forms) */}
            <div className="flex items-center justify-end mt-8 pt-6 border-t border-dark-700">
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {tr.c.continue} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  {tr.onb.generateBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
