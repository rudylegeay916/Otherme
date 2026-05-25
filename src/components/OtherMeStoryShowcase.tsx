import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, ScanSearch, Route, Target, Plus, Minus } from 'lucide-react'
import AnimatedOtherMeLogo from './AnimatedOtherMeLogo'

// ── Static bilingual data ─────────────────────────────────────────────────────

const STEPS_FR = [
  {
    id: '01',
    title: 'Votre point de départ',
    desc: 'OtherMe commence par comprendre votre parcours, vos compétences, vos envies, votre CV si vous l\'ajoutez, et ce que vous ne voulez plus retrouver dans votre prochain rôle.',
    Icon: ClipboardList,
  },
  {
    id: '02',
    title: 'Les signaux détectés',
    desc: 'L\'analyse repère les signaux importants : besoin de liberté, recherche de stabilité, envie de sens, potentiel créatif, rapport au risque, ambition financière.',
    Icon: ScanSearch,
  },
  {
    id: '03',
    title: 'Vos 3 trajectoires',
    desc: 'OtherMe génère trois chemins personnalisés : une voie proche de votre parcours, une voie liée à vos passions et une voie plus ambitieuse.',
    Icon: Route,
  },
  {
    id: '04',
    title: 'Votre plan d\'action',
    desc: 'Chaque trajectoire devient concrète : métier précis, description claire, timeline, plan 30 jours, compétences à développer, risques et premiers pas.',
    Icon: Target,
  },
]

const STEPS_EN = [
  {
    id: '01',
    title: 'Your starting point',
    desc: 'OtherMe starts by understanding your background, skills, goals, your CV if you add it, and what you no longer want to find in your next role.',
    Icon: ClipboardList,
  },
  {
    id: '02',
    title: 'Signals detected',
    desc: 'The analysis identifies key signals: desire for freedom, need for stability, search for meaning, creative potential, risk appetite, financial ambition.',
    Icon: ScanSearch,
  },
  {
    id: '03',
    title: 'Your 3 paths',
    desc: 'OtherMe generates three personalised directions: one close to your background, one based on your passions, and one more ambitious.',
    Icon: Route,
  },
  {
    id: '04',
    title: 'Your action plan',
    desc: 'Each path becomes concrete: precise role, clear description, timeline, 30-day plan, skills to develop, risks and first concrete steps.',
    Icon: Target,
  },
]

const PATH_CARDS_FR = [
  {
    color: 'emerald' as const,
    label: 'Proche de votre parcours',
    desc: 'Une voie réaliste qui valorise ce que vous savez déjà faire.',
  },
  {
    color: 'violet' as const,
    label: 'Basée sur vos passions',
    desc: 'Une direction plus alignée avec ce qui vous donne de l\'énergie.',
  },
  {
    color: 'amber' as const,
    label: 'Fort potentiel',
    desc: 'Une trajectoire plus ambitieuse, avec plus de liberté.',
  },
]

const PATH_CARDS_EN = [
  {
    color: 'emerald' as const,
    label: 'Close to your background',
    desc: 'A realistic path that leverages what you already know.',
  },
  {
    color: 'violet' as const,
    label: 'Based on your passions',
    desc: 'A direction more aligned with what gives you energy.',
  },
  {
    color: 'amber' as const,
    label: 'High potential',
    desc: 'A more ambitious path with greater freedom.',
  },
]

const FAQS_FR = [
  {
    q: 'Est-ce un simple test d\'orientation ?',
    a: 'Non. OtherMe combine vos réponses, votre parcours et éventuellement votre CV pour proposer des trajectoires détaillées, concrètes et actionnables.',
  },
  {
    q: 'Les résultats changent-ils selon mes réponses ?',
    a: 'Oui. Les trajectoires évoluent selon vos compétences, vos passions, votre niveau de risque, votre envie de stabilité, votre besoin de liberté et votre situation actuelle.',
  },
  {
    q: 'Que contient le rapport complet ?',
    a: 'Chaque trajectoire contient un métier précis, une description claire, une timeline, un plan 30 jours, les compétences à développer, les risques, les formations et les premiers pas concrets.',
  },
]

const FAQS_EN = [
  {
    q: 'Is this just a career aptitude test?',
    a: 'No. OtherMe combines your answers, background and optionally your CV to propose detailed, concrete and actionable paths.',
  },
  {
    q: 'Do results change based on my answers?',
    a: 'Yes. Paths evolve based on your skills, passions, risk tolerance, need for stability, desire for freedom and current situation.',
  },
  {
    q: 'What does the full report contain?',
    a: 'Each path includes a specific role, clear description, timeline, 30-day plan, skills to develop, risks, training options and concrete first steps.',
  },
]

const COLOR_MAP = {
  emerald: {
    border: 'border-emerald-500/25',
    bg: 'bg-gradient-to-br from-emerald-950/50 to-dark-800',
    badge: 'text-emerald-300',
    dot: 'bg-emerald-400',
    glow: 'hover:shadow-[0_0_24px_rgba(52,211,153,0.12)]',
    activeBorder: 'border-emerald-500/40',
  },
  violet: {
    border: 'border-violet-500/30',
    bg: 'bg-gradient-to-br from-violet-950/50 to-dark-800',
    badge: 'text-violet-300',
    dot: 'bg-violet-400',
    glow: 'hover:shadow-[0_0_24px_rgba(167,139,250,0.15)]',
    activeBorder: 'border-violet-500/50',
  },
  amber: {
    border: 'border-amber-500/25',
    bg: 'bg-gradient-to-br from-amber-950/50 to-dark-800',
    badge: 'text-amber-300',
    dot: 'bg-amber-400',
    glow: 'hover:shadow-[0_0_24px_rgba(251,191,36,0.12)]',
    activeBorder: 'border-amber-500/40',
  },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MiniAccordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-dark-800/50 backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors gap-3"
      >
        <span className="text-slate-300 text-sm font-medium leading-snug">{q}</span>
        <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors duration-200
          ${open ? 'bg-violet-600/20 border-violet-500/30' : 'border-white/[0.12]'}`}>
          {open
            ? <Minus size={9} className="text-violet-300" />
            : <Plus size={9} className="text-slate-500" />
          }
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40' : 'max-h-0'}`}>
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.05]">
          <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  lang: 'fr' | 'en'
}

export default function OtherMeStoryShowcase({ lang }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [tick, setTick] = useState(0)

  const steps     = lang === 'fr' ? STEPS_FR     : STEPS_EN
  const pathCards = lang === 'fr' ? PATH_CARDS_FR : PATH_CARDS_EN
  const faqs      = lang === 'fr' ? FAQS_FR       : FAQS_EN

  const handleStepClick = useCallback((i: number) => {
    setActiveStep(i)
    setTick(t => t + 1)
  }, [])

  // Auto-advance every 5 s, resets when tick changes (i.e. on manual click)
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 5000)
    return () => clearInterval(id)
  }, [tick, steps.length])

  const step = steps[activeStep]

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-dark-950">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[700px] bg-violet-900/[0.07] rounded-full blur-[130px]" />
        <div className="absolute top-[15%] right-[10%] w-[350px] h-[350px] bg-indigo-900/[0.05] rounded-full blur-[90px]" />
        <div className="absolute bottom-[15%] left-[8%] w-[300px] h-[300px] bg-purple-900/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-14 md:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
            {lang === 'fr' ? 'Expérience d\'analyse' : 'Analysis experience'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {lang === 'fr'
              ? <>Comment OtherMe <span className="gradient-text">révèle vos trajectoires</span></>
              : <>How OtherMe <span className="gradient-text">reveals your paths</span></>
            }
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
            {lang === 'fr'
              ? 'Une expérience d\'analyse personnalisée — pas un test classique.'
              : 'A personalised analysis experience — not a classic test.'}
          </p>
        </div>

        {/* ── Main grid: [left text] [center visual] [right nav] ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr_1.6fr] gap-10 lg:gap-12 items-start">

          {/* ── LEFT: Step content + FAQ accordions ── */}
          <div className="flex flex-col gap-8 order-2 lg:order-1 lg:pt-4">

            {/* Step text — animated key on activeStep so it fades */}
            <div key={activeStep} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-600/12 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <step.Icon size={17} strokeWidth={1.5} className="text-violet-300" />
                </div>
                <span className="text-[11px] font-bold text-brand-400/80 uppercase tracking-[0.18em]">{step.id}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-4 leading-snug">
                {step.title}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed">
                {step.desc}
              </p>
            </div>

            {/* Mobile step progress dots */}
            <div className="flex items-center gap-2 lg:hidden">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStepClick(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === activeStep ? 'w-8 bg-brand-400' : 'w-4 bg-dark-600 hover:bg-dark-500'
                  }`}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>

            {/* FAQ accordions */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 mb-0.5">
                {lang === 'fr' ? 'Questions fréquentes' : 'Common questions'}
              </p>
              {faqs.map((faq, i) => (
                <MiniAccordion key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          {/* ── CENTER: Animated logo + path cards ── */}
          <div className="flex flex-col items-center gap-5 order-1 lg:order-2">

            {/* Path trajectory cards — scrollable on mobile, grid on desktop */}
            <div className="flex lg:grid lg:grid-cols-3 gap-3 w-full overflow-x-auto pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none">
              {pathCards.map((card, i) => {
                const c = COLOR_MAP[card.color]
                return (
                  <div
                    key={i}
                    className={`float-card flex-shrink-0 w-[170px] sm:w-auto snap-start border rounded-xl p-3.5 transition-all duration-300 ${c.border} ${c.bg} ${c.glow}`}
                    style={{ animationDelay: `${i * 0.8}s`, animationDuration: `${3.6 + i * 0.4}s` }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${c.badge}`}>
                        {card.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{card.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Animated logo — the visual core of the section */}
            <div className="relative flex items-center justify-center">
              <AnimatedOtherMeLogo size={220} />
            </div>

            {/* Subtle center label */}
            <p className="text-slate-700 text-[11px] text-center tracking-wide">
              {lang === 'fr'
                ? 'Intelligence artificielle · Analyse personnalisée'
                : 'Artificial intelligence · Personalised analysis'}
            </p>
          </div>

          {/* ── RIGHT: Step navigation (desktop only) ── */}
          <div className="hidden lg:flex flex-col gap-1 order-3 lg:pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 mb-4">
              {lang === 'fr' ? 'Les étapes' : 'The steps'}
            </p>

            {steps.map((s, i) => {
              const isActive = i === activeStep
              return (
                <button
                  key={i}
                  onClick={() => handleStepClick(i)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 group ${
                    isActive
                      ? 'bg-violet-600/[0.09] border border-violet-500/20'
                      : 'border border-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Active indicator bar */}
                  <div className={`w-0.5 h-9 rounded-full flex-shrink-0 transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-b from-brand-400 to-brand-600' : 'bg-dark-700'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold tracking-[0.15em] mb-0.5 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-dark-500'
                    }`}>{s.id}</div>
                    <div className={`text-xs font-medium leading-snug transition-colors ${
                      isActive ? 'text-slate-100' : 'text-slate-600 group-hover:text-slate-500'
                    }`}>{s.title}</div>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 animate-pulse-slow" />
                  )}
                </button>
              )
            })}

            {/* Auto-advance indicator */}
            <div className="mt-5 px-3 flex items-center gap-2 text-[10px] text-slate-700">
              <div className="flex gap-0.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      i === activeStep ? 'w-4 bg-brand-500/60' : 'w-2 bg-dark-600'
                    }`}
                  />
                ))}
              </div>
              <span>{lang === 'fr' ? 'Défilement auto' : 'Auto-play'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
