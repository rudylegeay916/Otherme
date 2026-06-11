import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Heart, FileText, Shield, TrendingUp, Compass, BadgeDollarSign,
  ArrowRight, Check, BarChart3, Calendar, Users,
  AlertTriangle, Zap, BookOpen, Target, Star, ChevronRight,
  RefreshCcw, CheckCircle2, Sparkles,
  type LucideProps,
} from 'lucide-react'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import AnimatedOtherMeLogo from '../components/AnimatedOtherMeLogo'
import OtherMeFeatureTabs from '../components/OtherMeFeatureTabs'
import Floating3DCard from '../components/Floating3DCard'
import Reveal from '../components/Reveal'
import { hasStartedTest, clearProgress } from '../lib/onboardingStorage'
import { useLanguage } from '../contexts/LanguageContext'

// ── Reduced-motion helper ────────────────────────────────────────────────────

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Data (bilingual inline) ──────────────────────────────────────────────────

type IconComponent = React.ComponentType<LucideProps>

interface Signal {
  Icon: IconComponent
  labelFr: string
  labelEn: string
  descFr: string
  descEn: string
  color: string
  accent: string
}

const SIGNALS: Signal[] = [
  { Icon: Brain,          labelFr: 'Compétences',    labelEn: 'Skills',         descFr: 'Savoir-faire réels',     descEn: 'Real expertise',       color: 'rgba(124,58,237,0.12)',  accent: '#a78bfa' },
  { Icon: Heart,          labelFr: 'Motivations',    labelEn: 'Motivations',    descFr: 'Ce qui te nourrit',      descEn: 'What drives you',      color: 'rgba(244,63,94,0.10)',   accent: '#fb7185' },
  { Icon: FileText,       labelFr: 'Parcours',       labelEn: 'Background',     descFr: 'Ton CV analysé',         descEn: 'Your CV analysed',     color: 'rgba(59,130,246,0.10)',  accent: '#60a5fa' },
  { Icon: Shield,         labelFr: 'Contraintes',    labelEn: 'Constraints',    descFr: 'Risque accepté',         descEn: 'Risk tolerance',       color: 'rgba(245,158,11,0.10)',  accent: '#fbbf24' },
  { Icon: TrendingUp,     labelFr: 'Potentiel',      labelEn: 'Potential',      descFr: 'Opportunités marché',    descEn: 'Market opportunities', color: 'rgba(16,185,129,0.10)',  accent: '#34d399' },
  { Icon: BadgeDollarSign,labelFr: 'Revenus cibles', labelEn: 'Target income',  descFr: 'Estimations réelles',    descEn: 'Realistic estimates',  color: 'rgba(16,185,129,0.10)',  accent: '#6ee7b7' },
  { Icon: Compass,        labelFr: 'Style de vie',   labelEn: 'Lifestyle',      descFr: 'Autonomie, rythme…',     descEn: 'Autonomy, pace…',      color: 'rgba(20,184,166,0.10)',  accent: '#2dd4bf' },
]

interface PathData {
  badgeFr: string; badgeEn: string
  titleFr: string; titleEn: string
  descFr: string; descEn: string
  bulletsFr: string[]; bulletsEn: string[]
  durationFr: string; durationEn: string
  accent: string
  border: string
  bg: string
  badgeBg: string
  badgeText: string
  dot: string
  featured?: boolean
}

const PATHS: PathData[] = [
  {
    badgeFr: 'Accessible',   badgeEn: 'Accessible',
    titleFr: 'La trajectoire rapide',            titleEn: 'The fast path',
    descFr:  'Proche de ce que tu fais déjà. Transition en quelques mois, sans tout quitter.',
    descEn:  'Close to what you already do. Transition in a few months without giving everything up.',
    bulletsFr: ['Risque faible', 'Compétences déjà acquises', 'Transition 3–6 mois'],
    bulletsEn: ['Low risk', 'Skills already there', '3–6 month transition'],
    durationFr: '3–6 mois', durationEn: '3–6 months',
    accent: '#34d399', border: 'border-emerald-500/20', bg: 'bg-gradient-to-br from-emerald-950/50 to-dark-800',
    badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-300', dot: 'bg-emerald-400',
  },
  {
    badgeFr: 'Alignée',      badgeEn: 'Aligned',
    titleFr: 'La trajectoire qui te ressemble',  titleEn: 'The path that fits you',
    descFr:  'Construite autour de tes vraies motivations. Pas juste un métier — un vrai choix de vie.',
    descEn:  'Built around your real motivations. Not just a job — a real life choice.',
    bulletsFr: ['Alignement fort', 'Sens et cohérence', 'Transition 6–12 mois'],
    bulletsEn: ['Strong alignment', 'Meaning & coherence', '6–12 month transition'],
    durationFr: '6–12 mois', durationEn: '6–12 months',
    accent: '#a78bfa', border: 'border-violet-500/30', bg: 'bg-gradient-to-br from-violet-950/60 to-dark-800',
    badgeBg: 'bg-violet-500/10', badgeText: 'text-violet-300', dot: 'bg-violet-400',
    featured: true,
  },
  {
    badgeFr: 'Ambitieuse',   badgeEn: 'Ambitious',
    titleFr: 'La trajectoire haute altitude',    titleEn: 'The high-altitude path',
    descFr:  'Pour aller plus loin que ce que tu imagines. Fort potentiel, effort plus important.',
    descEn:  'Go further than you imagine. High potential, greater effort needed.',
    bulletsFr: ['Haut potentiel', 'Formation requise', 'Transition 12–24 mois'],
    bulletsEn: ['High potential', 'Training required', '12–24 month transition'],
    durationFr: '12–24 mois', durationEn: '12–24 months',
    accent: '#fbbf24', border: 'border-amber-500/20', bg: 'bg-gradient-to-br from-amber-950/50 to-dark-800',
    badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-300', dot: 'bg-amber-400',
  },
]

interface ReportFeature {
  Icon: IconComponent
  titleFr: string; titleEn: string
  descFr: string; descEn: string
  accent: string
}

const REPORT_FEATURES: ReportFeature[] = [
  { Icon: Target,          titleFr: 'Métier précis',          titleEn: 'Exact role',            descFr: 'Un rôle exact, pas une catégorie vague',      descEn: 'An exact role, not a vague category',      accent: '#a78bfa' },
  { Icon: BadgeDollarSign, titleFr: 'Revenu estimé',          titleEn: 'Estimated income',      descFr: 'Fourchette réaliste par niveau et marché',    descEn: 'Realistic range by level and market',      accent: '#34d399' },
  { Icon: Shield,          titleFr: 'Niveau de risque',       titleEn: 'Risk level',            descFr: 'Évaluation honnête des obstacles',            descEn: 'Honest assessment of obstacles',           accent: '#fbbf24' },
  { Icon: Compass,         titleFr: 'Quotidien réaliste',     titleEn: 'Realistic daily life',  descFr: 'À quoi ressemble vraiment ce rôle au jour le jour', descEn: 'What this role really looks like day-to-day', accent: '#60a5fa' },
  { Icon: Calendar,        titleFr: 'Timeline 5 ans',         titleEn: '5-year timeline',       descFr: '6 périodes avec objectifs et livrables',     descEn: '6 periods with objectives and deliverables', accent: '#2dd4bf' },
  { Icon: Zap,             titleFr: 'Plan 30 jours',          titleEn: '30-day plan',           descFr: 'Actions concrètes semaine par semaine',      descEn: 'Concrete actions week by week',            accent: '#fb7185' },
  { Icon: BookOpen,        titleFr: 'Formations',             titleEn: 'Training paths',        descFr: 'Types de formation adaptés à la transition', descEn: 'Training types adapted to the transition', accent: '#818cf8' },
  { Icon: Users,           titleFr: 'Profils à contacter',    titleEn: 'People to contact',     descFr: 'Qui approcher pour avancer vite',            descEn: 'Who to approach to move fast',             accent: '#c084fc' },
  { Icon: AlertTriangle,   titleFr: 'Erreurs à éviter',       titleEn: 'Mistakes to avoid',     descFr: 'Pièges fréquents des reconversions',         descEn: 'Common reconversion pitfalls',             accent: '#f97316' },
  { Icon: FileText,        titleFr: 'CV & LinkedIn',          titleEn: 'CV & LinkedIn',         descFr: 'Mots-clés et pitch à repositionner',         descEn: 'Keywords and pitch to reposition',         accent: '#60a5fa' },
  { Icon: Star,            titleFr: 'Preuves à construire',   titleEn: 'Proofs to build',       descFr: 'Ce qui crédibilise la transition',           descEn: 'What makes your transition credible',      accent: '#fbbf24' },
  { Icon: ChevronRight,    titleFr: 'Premier pas en 48h',     titleEn: 'First step in 48h',     descFr: 'Une action immédiate et concrète',           descEn: 'One immediate and concrete action',        accent: '#34d399' },
]

interface TestiData {
  initials: string
  nameFr: string; nameEn: string
  age: number
  fromFr: string; fromEn: string
  toFr: string; toEn: string
  months: string
  quoteFr: string; quoteEn: string
  tagsFr: string[]; tagsEn: string[]
  gradient: string
}

const TESTIMONIALS: TestiData[] = [
  {
    initials: 'ML', nameFr: 'Marie L.', nameEn: 'Marie L.', age: 31,
    fromFr: 'Responsable comptable',             fromEn: 'Accounting manager',
    toFr: 'Consultante transformation digitale', toEn: 'Digital transformation consultant',
    months: '8 mois / 8 months',
    quoteFr: 'Je savais que je voulais autre chose, mais pas quoi. OtherMe a mis des mots dessus — et m\'a montré un chemin concret.',
    quoteEn: 'I knew I wanted something different, but not what. OtherMe named it — and showed me a concrete path.',
    tagsFr: ['Analyser', 'Organiser', 'Piloter'], tagsEn: ['Analyse', 'Organise', 'Drive'],
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    initials: 'TM', nameFr: 'Thomas M.', nameEn: 'Thomas M.', age: 28,
    fromFr: 'Développeur backend',               fromEn: 'Backend developer',
    toFr: 'Product Manager indépendant',         toEn: 'Independent Product Manager',
    months: '5 mois / 5 months',
    quoteFr: 'La précision m\'a surpris. Ce n\'était pas des généralités — c\'était vraiment adapté à mon profil technique.',
    quoteEn: 'The precision surprised me. Not generalities — genuinely tailored to my technical background.',
    tagsFr: ['Tech', 'Vision produit', 'Autonomie'], tagsEn: ['Tech', 'Product vision', 'Autonomy'],
    gradient: 'from-blue-600 to-violet-600',
  },
  {
    initials: 'CB', nameFr: 'Camille B.', nameEn: 'Camille B.', age: 35,
    fromFr: 'Chargée RH',                        fromEn: 'HR Officer',
    toFr: 'Coach carrière freelance',            toEn: 'Freelance career coach',
    months: '10 mois / 10 months',
    quoteFr: 'J\'avais peur de tout perdre. OtherMe m\'a montré que je pouvais construire quelque chose sans repartir de zéro.',
    quoteEn: 'I was afraid of losing everything. OtherMe showed me I could build something new without starting from scratch.',
    tagsFr: ['Écouter', 'Accompagner', 'Former'], tagsEn: ['Listen', 'Support', 'Train'],
    gradient: 'from-rose-600 to-violet-600',
  },
]

// ── FloatingSignalCard sub-component ────────────────────────────────────────

function FloatingSignalCard({
  sig, delay, duration, lang,
}: {
  sig: Signal; delay: number; duration: number; lang: 'fr' | 'en'
}) {
  return (
    <div
      className="float-card flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl backdrop-blur-md border text-left"
      style={{
        background: sig.color,
        borderColor: `${sig.accent}30`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${sig.accent}20`,
        minWidth: 120,
      }}
    >
      <sig.Icon size={14} style={{ color: sig.accent, flexShrink: 0 }} strokeWidth={1.5} />
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-white/80 leading-tight">
          {lang === 'fr' ? sig.labelFr : sig.labelEn}
        </div>
        <div className="text-[10px] leading-tight" style={{ color: sig.accent, opacity: 0.75 }}>
          {lang === 'fr' ? sig.descFr : sig.descEn}
        </div>
      </div>
    </div>
  )
}

// ── Hero scene (logo + orbiting signal cards) ────────────────────────────────

function HeroScene({ lang, mouseX, mouseY }: { lang: 'fr' | 'en'; mouseX: number; mouseY: number }) {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches

  if (isMobile) {
    return (
      <div className="flex justify-center items-center py-4">
        <AnimatedOtherMeLogo size={160} />
      </div>
    )
  }

  const positions: Array<{ top?: string; bottom?: string; left?: string; right?: string; pxFactor: number; pyFactor: number }> = [
    { top: '2%',  left: '4%',   pxFactor: -0.8, pyFactor: -0.5 },
    { top: '0%',  left: '40%',  pxFactor: -0.2, pyFactor: -0.9 },
    { top: '2%',  right: '0%',  pxFactor: 0.8,  pyFactor: -0.5 },
    { top: '38%', right: '-2%', pxFactor: 1.0,  pyFactor: -0.1 },
    { bottom: '4%', right: '1%', pxFactor: 0.8, pyFactor: 0.5  },
    { bottom: '2%', left: '30%', pxFactor: -0.1, pyFactor: 0.8 },
    { top: '38%', left: '-2%', pxFactor: -1.0, pyFactor: -0.1 },
  ]

  return (
    <div
      className="relative w-[460px] h-[460px] flex-shrink-0"
      aria-hidden="true"
    >
      {/* Radial background glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(109,40,217,0.18) 0%, rgba(79,70,229,0.08) 50%, transparent 80%)',
          transform: `translate(${mouseX * -12}px, ${mouseY * -10}px)`,
          transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
        }}
      />
      {/* Outer ring decoration */}
      <div
        className="absolute inset-4 rounded-full border pointer-events-none"
        style={{
          borderColor: 'rgba(124,58,237,0.08)',
          transform: `translate(${mouseX * -6}px, ${mouseY * -5}px)`,
          transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)',
        }}
      />

      {/* Signal cards */}
      {SIGNALS.map((sig, i) => {
        const pos = positions[i]
        return (
          <div
            key={sig.labelFr}
            className="absolute"
            style={{
              top: pos.top, bottom: pos.bottom,
              left: pos.left, right: pos.right,
              transform: `translate(${mouseX * pos.pxFactor * 18}px, ${mouseY * pos.pyFactor * 14}px)`,
              transition: `transform ${0.5 + i * 0.04}s cubic-bezier(0.23,1,0.32,1)`,
            }}
          >
            <FloatingSignalCard
              sig={sig}
              delay={i * 0.5}
              duration={3.5 + i * 0.4}
              lang={lang}
            />
          </div>
        )
      })}

      {/* Logo centered */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${mouseX * 5}px, ${mouseY * 4}px)`,
          transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <AnimatedOtherMeLogo size={200} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LandingV2() {
  const navigate     = useNavigate()
  const { lang }     = useLanguage()
  const [started, setStarted]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [heroMouse, setHeroMouse]     = useState({ x: 0, y: 0 })

  useEffect(() => { setStarted(hasStartedTest()) }, [])

  useEffect(() => {
    const mq    = window.matchMedia('(prefers-reduced-motion: reduce)')
    const touch = window.matchMedia('(pointer: coarse)')
    if (mq.matches || touch.matches) return
    const onMove = (e: MouseEvent) => {
      setHeroMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const handleStart          = () => navigate('/onboarding')
  const handleResume         = () => navigate('/onboarding')
  const handleConfirmRestart = () => {
    clearProgress(); setStarted(false); setShowConfirm(false); navigate('/onboarding')
  }

  const fr = lang === 'fr'

  return (
    <div className="min-h-dvh bg-dark-950 overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.05]">
        <Logo size={48} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {started ? (
            <>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary py-2 px-4 text-sm">
                {fr ? 'Recommencer' : 'Restart'}
              </button>
              <button onClick={handleResume} className="btn-primary py-2 px-5 text-sm">
                {fr ? 'Reprendre →' : 'Resume →'}
              </button>
            </>
          ) : (
            <button onClick={handleStart} className="btn-primary py-2 px-5 text-sm">
              {fr ? 'Commencer' : 'Get started'}
            </button>
          )}
        </div>
      </nav>

      {/* ── Confirm restart modal ──────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-dark-800 border border-white/[0.10] rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <RefreshCcw size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">
              {fr ? 'Recommencer depuis le début ?' : 'Start over from scratch?'}
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {fr ? 'Tes réponses actuelles seront supprimées. Cette action est irréversible.' : 'Your current answers will be deleted. This cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-3">
                {fr ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={handleConfirmRestart} className="flex-1 py-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97]">
                {fr ? 'Recommencer' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-dvh flex flex-col pt-20 pb-16 px-6 sm:px-10 lg:px-16 xl:px-24 overflow-hidden">
        {/* Background radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '15%', left: '5%', width: 600, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(109,40,217,0.10) 0%, transparent 70%)', filter: 'blur(40px)', transform: `translate(${heroMouse.x * -20}px, ${heroMouse.y * -15}px)`, transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 70%)', filter: 'blur(60px)', transform: `translate(${heroMouse.x * -35}px, ${heroMouse.y * -25}px)`, transition: 'transform 0.9s cubic-bezier(0.23,1,0.32,1)' }} />
        </div>

        {/* Grid dot pattern (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(rgba(148,163,184,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Main grid: text left / scene right */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left: text + CTAs ── */}
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              {/* Badge */}
              <div
                className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300/90 text-xs font-medium tracking-wide animate-slide-up-hero glow-ring-pulse"
                style={{ animationDelay: '0ms' }}
              >
                <Sparkles size={12} strokeWidth={1.5} />
                {fr ? 'Pas un test d\'orientation. Une exploration.' : 'Not a quiz. An exploration.'}
              </div>

              {/* Headline */}
              <div className="animate-slide-up-hero" style={{ animationDelay: '80ms' }}>
                <h1 className="font-bold tracking-tight leading-[1.08]">
                  <span className="block text-white text-[2.4rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[3.8rem] xl:text-[4.2rem]">
                    {fr ? 'Et si tu avais' : 'What if you still'}
                  </span>
                  <span className="block gradient-text-animated text-[2.4rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[3.8rem] xl:text-[4.2rem]">
                    {fr ? 'encore le choix ?' : 'had a choice?'}
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <p
                className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-[500px] animate-slide-up-hero"
                style={{ animationDelay: '180ms' }}
              >
                {fr
                  ? 'OtherMe analyse ton parcours, tes envies et ton CV pour révéler 3 trajectoires alternatives — avec plan d\'action, timeline et premier pas concret.'
                  : 'OtherMe analyses your background, motivations and CV to reveal 3 alternative paths — with action plan, timeline and a concrete first step.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 animate-slide-up-hero" style={{ animationDelay: '270ms' }}>
                {started ? (
                  <>
                    <button onClick={handleResume} className="btn-primary text-base py-3.5 px-9">
                      <ArrowRight size={16} />
                      {fr ? 'Reprendre mon test' : 'Resume my test'}
                    </button>
                    <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-3.5 px-7">
                      {fr ? 'Recommencer' : 'Restart'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleStart} className="btn-primary text-base py-3.5 px-9">
                      <ArrowRight size={16} />
                      {fr ? 'Découvrir mes autres vies' : 'Discover my other lives'}
                    </button>
                    <button
                      onClick={() => document.getElementById('v2-example')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-secondary text-base py-3.5 px-7"
                    >
                      {fr ? 'Voir un exemple' : 'See an example'}
                    </button>
                  </>
                )}
              </div>

              {/* Proof pills */}
              <div className="flex flex-wrap gap-2 animate-slide-up-hero" style={{ animationDelay: '360ms' }}>
                {[
                  { icon: CheckCircle2, text: fr ? '3 trajectoires personnalisées' : '3 personalised paths' },
                  { icon: FileText,     text: fr ? 'CV optionnel' : 'Optional CV' },
                  { icon: Zap,          text: fr ? 'Plan 30 jours inclus' : '30-day plan included' },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="proof-chip">
                    <Icon size={13} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: animated scene ── */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <HeroScene lang={lang} mouseX={heroMouse.x} mouseY={heroMouse.y} />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="relative z-10 flex justify-center text-dark-600 animate-bounce mt-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 2. SIGNAL SECTION ───────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-10 bg-dark-900/40">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">Analyse</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
              {fr ? <>OtherMe analyse <span className="gradient-text">ces signaux</span></> : <>OtherMe analyses <span className="gradient-text">these signals</span></>}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              {fr
                ? 'Chaque trajectoire est construite en croisant tes compétences réelles, tes envies et tes contraintes — pas juste un questionnaire générique.'
                : 'Each path is built by combining your real skills, motivations and constraints — not just a generic questionnaire.'}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SIGNALS.map((sig, i) => (
              <Reveal key={sig.labelFr} delay={i * 60} scale>
                <Floating3DCard intensity={6} className="rounded-2xl border p-4 flex items-start gap-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(109,40,217,0.10)]"
                  style={{
                    background: sig.color,
                    borderColor: `${sig.accent}25`,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{ background: `${sig.accent}15`, borderColor: `${sig.accent}30` }}
                  >
                    <sig.Icon size={16} style={{ color: sig.accent }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100 mb-0.5">
                      {lang === 'fr' ? sig.labelFr : sig.labelEn}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: `${sig.accent}CC` }}>
                      {lang === 'fr' ? sig.descFr : sig.descEn}
                    </div>
                  </div>
                </Floating3DCard>
              </Reveal>
            ))}
          </div>

          {/* Connection line visual */}
          <Reveal className="mt-10 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-600/30 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-xs font-semibold text-brand-300">
                {fr ? 'Analyse IA personnalisée' : 'Personalised AI analysis'}
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-600/30 to-transparent" />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 3. 3 TRAJECTOIRES ───────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {fr ? 'Les trajectoires' : 'The paths'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              {fr ? <>3 trajectoires, <span className="gradient-text">3 niveaux de projection</span></> : <>3 paths, <span className="gradient-text">3 levels of ambition</span></>}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
              {fr
                ? 'Ton rapport compare trois directions distinctes. Chacune est justifiée, chiffrée et accompagnée d\'un plan d\'action.'
                : 'Your report compares three distinct directions. Each one is justified, quantified and comes with an action plan.'}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {PATHS.map((path, i) => (
              <Reveal key={path.titleFr} delay={i * 100} scale>
                <Floating3DCard
                  intensity={7}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 overflow-hidden h-full ${path.border} ${path.bg} ${path.featured ? 'ring-1 ring-violet-500/30 shadow-[0_0_50px_rgba(109,40,217,0.12)]' : ''}`}
                >
                  {path.featured && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
                      {fr ? 'Recommandée' : 'Recommended'}
                    </div>
                  )}
                  <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${path.badgeBg} ${path.badgeText} border-current/20`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${path.dot}`} />
                    {lang === 'fr' ? path.badgeFr : path.badgeEn}
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-bold text-lg mb-2 leading-snug">
                      {lang === 'fr' ? path.titleFr : path.titleEn}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {lang === 'fr' ? path.descFr : path.descEn}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-white/[0.06]">
                    {(lang === 'fr' ? path.bulletsFr : path.bulletsEn).map((b) => (
                      <div key={b} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check size={12} style={{ color: path.accent, flexShrink: 0 }} strokeWidth={2.5} />
                        {b}
                      </div>
                    ))}
                  </div>
                  {/* Decorative duration badge */}
                  <div className="absolute bottom-4 right-4 px-2 py-1 rounded-lg bg-dark-800/60 border border-white/[0.06] text-[10px] text-slate-500 font-medium backdrop-blur-sm">
                    ⏱ {lang === 'fr' ? path.durationFr : path.durationEn}
                  </div>
                </Floating3DCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 4. RAPPORT COMPLET ──────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-10 bg-dark-900/50 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(109,40,217,0.05) 0%, transparent 70%)' }} />

        <div className="relative max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {fr ? 'Livrable' : 'What you get'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              {fr ? <>Ce que contient <span className="gradient-text">ton rapport</span></> : <>What's inside <span className="gradient-text">your report</span></>}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
              {fr
                ? 'Pas un résultat de quiz. Un rapport structuré, personnalisé et actionnable — pour chacune des 3 trajectoires.'
                : 'Not a quiz result. A structured, personalised and actionable report — for each of the 3 paths.'}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {REPORT_FEATURES.map((feat, i) => (
              <Reveal key={feat.titleFr} delay={i * 40} from={i % 2 === 0 ? 'left' : 'right'}>
                <div className="card p-4 flex items-start gap-3 hover:border-white/[0.12] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all duration-300 h-full">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border mt-0.5"
                    style={{ background: `${feat.accent}12`, borderColor: `${feat.accent}25` }}
                  >
                    <feat.Icon size={14} style={{ color: feat.accent }} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-100 font-semibold text-xs mb-0.5">
                      {lang === 'fr' ? feat.titleFr : feat.titleEn}
                    </div>
                    <div className="text-slate-500 text-[11px] leading-relaxed">
                      {lang === 'fr' ? feat.descFr : feat.descEn}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Mid CTA */}
          <Reveal className="mt-12 text-center">
            <button onClick={handleStart} className="btn-primary text-base py-3.5 px-10">
              <ArrowRight size={16} />
              {fr ? 'Obtenir mon rapport complet' : 'Get my full report'}
            </button>
            <div className="cta-microcopy mt-3">
              <span>{fr ? 'Sans compte requis' : 'No account needed'}</span>
              <span className="cta-microcopy-dot" />
              <span>{fr ? 'Quelques minutes' : 'Just a few minutes'}</span>
              <span className="cta-microcopy-dot" />
              <span>{fr ? 'CV optionnel' : 'CV optional'}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 5. FEATURE TABS (réutilisé) ─────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <OtherMeFeatureTabs lang={lang} />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 6. EXEMPLE DE RAPPORT (aperçu premium) ──────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="v2-example" className="py-24 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {fr ? 'Aperçu' : 'Preview'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              {fr ? <>Une trajectoire, <span className="gradient-text">à quoi ça ressemble ?</span></> : <>A path — <span className="gradient-text">what does it look like?</span></>}
            </h2>
          </Reveal>

          <Floating3DCard intensity={2} className="card glow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

            {/* Header with disclaimer */}
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2 text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 mb-5">
                <FileText size={12} strokeWidth={1.5} className="flex-shrink-0" />
                <span>{fr ? 'Exemple illustratif — les résultats réels varient selon ton profil.' : 'Illustrative example — real results vary by profile.'}</span>
              </div>

              {/* Path header */}
              <div className="flex flex-wrap items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {fr ? 'Trajectoire basée sur tes passions' : 'Passion-based path'}
                  </div>
                  <h3 className="text-slate-100 font-bold text-xl md:text-2xl leading-snug mb-1">
                    Product Manager — Solutions SaaS B2B
                  </h3>
                  <p className="text-slate-500 text-sm italic">
                    {fr ? '"Une transition qui valorise ton sens de l\'écoute et ta rigueur analytique"' : '"A transition that leverages your listening skills and analytical rigour"'}
                  </p>
                </div>
                {/* Scores grid */}
                <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                  {[
                    { label: fr ? 'Alignement' : 'Alignment', value: 88, color: '#a78bfa' },
                    { label: fr ? 'Faisabilité' : 'Feasibility', value: 74, color: '#34d399' },
                    { label: fr ? 'Potentiel' : 'Potential', value: 91, color: '#fbbf24' },
                    { label: fr ? 'Liberté' : 'Freedom', value: 82, color: '#60a5fa' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-dark-900/60 rounded-xl p-3 text-center border border-white/[0.06]">
                      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key details row */}
            <div className="px-5 pb-5">
              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: BadgeDollarSign, label: fr ? 'Revenu estimé' : 'Est. income',    value: '45–65k€ / an', color: '#34d399' },
                  { icon: Shield,          label: fr ? 'Niveau de risque' : 'Risk level',   value: fr ? 'Modéré' : 'Moderate',    color: '#fbbf24' },
                  { icon: Calendar,        label: fr ? 'Durée transition' : 'Transition',   value: fr ? '9–14 mois' : '9–14 months', color: '#a78bfa' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-dark-900/40 rounded-xl p-3.5 border border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border" style={{ background: `${color}12`, borderColor: `${color}25` }}>
                      <Icon size={14} style={{ color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-semibold text-slate-100">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* First week actions preview */}
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/[0.05]">
                <p className="text-xs font-semibold text-brand-400 mb-3">
                  <Zap size={11} className="inline mr-1" strokeWidth={2} />
                  {fr ? 'Premières actions — cette semaine' : 'First actions — this week'}
                </p>
                <div className="space-y-2">
                  {(fr ? [
                    'Analyser 10 offres PM sur LinkedIn — noter les compétences récurrentes (1h)',
                    'Faire un product teardown d\'une app que tu utilises — identifier 3 problèmes (30 min)',
                    'Rejoindre Slack PM France — se présenter en 3 phrases dans #reconversions',
                  ] : [
                    'Analyse 10 PM listings on LinkedIn — note recurring skills (1h)',
                    'Do a product teardown of an app you use — identify 3 problems (30 min)',
                    'Join Slack PM France — introduce yourself in 3 sentences in #reconversions',
                  ]).map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-brand-300 mt-0.5">{i + 1}</span>
                      {action}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 text-center mt-5 italic">
                {fr ? '↑ Aperçu d\'une trajectoire — le rapport complet inclut timeline 5 ans, plan 30 jours, formations et bien plus.' : '↑ Path preview — full report includes 5-year timeline, 30-day plan, training recommendations and much more.'}
              </p>
            </div>
          </Floating3DCard>

          <Reveal className="mt-8 text-center">
            <button onClick={handleStart} className="btn-primary py-3.5 px-10 text-base">
              <ArrowRight size={16} />
              {fr ? 'Voir mes 3 trajectoires personnalisées' : 'See my 3 personalised paths'}
            </button>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 7. COMPARATIF ───────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-10 bg-dark-900/40">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {fr ? 'Comparaison' : 'Comparison'}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
              {fr ? <>OtherMe vs <span className="gradient-text">test classique</span></> : <>OtherMe vs <span className="gradient-text">classic quiz</span></>}
            </h2>
          </Reveal>

          <Reveal scale>
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-3 border-b border-white/[0.07]">
                <div className="p-3.5 bg-dark-800/50" />
                <div className="p-3.5 bg-dark-800/30 border-l border-white/[0.06] text-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {fr ? 'Test classique' : 'Classic quiz'}
                  </span>
                </div>
                <div className="p-3.5 comp-col-highlight text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">OtherMe</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-300 text-[9px] font-bold">✦ IA</span>
                  </div>
                </div>
              </div>

              {(fr ? [
                { crit: 'Résultats',    classic: 'Génériques',                   v2: 'Personnalisés à ton profil' },
                { crit: 'Analyse',      classic: 'Surface',                       v2: 'Compétences + envies + CV' },
                { crit: 'Output',       classic: 'Liste de métiers',              v2: '3 trajectoires + plan d\'action' },
                { crit: 'Durée',        classic: '30–60 min',                     v2: '5–10 min' },
                { crit: 'CV',           classic: 'Ignoré',                        v2: 'Optionnel, pour affiner' },
                { crit: 'Timeline',     classic: 'Absente',                       v2: 'Plan 30j + 5 ans inclus' },
              ] : [
                { crit: 'Results',      classic: 'Generic',                       v2: 'Personalised to your profile' },
                { crit: 'Analysis',     classic: 'Surface level',                 v2: 'Skills + motivations + CV' },
                { crit: 'Output',       classic: 'List of job titles',            v2: '3 paths + action plan' },
                { crit: 'Duration',     classic: '30–60 min',                     v2: '5–10 min' },
                { crit: 'CV',           classic: 'Ignored',                       v2: 'Optional, to refine results' },
                { crit: 'Timeline',     classic: 'None',                          v2: '30-day plan + 5-year included' },
              ]).map((row, i, arr) => (
                <div key={row.crit} className={`grid grid-cols-3 ${i < arr.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                  <div className="p-3 text-slate-400 font-medium text-[11px] bg-dark-800/20">{row.crit}</div>
                  <div className="p-3 border-l border-white/[0.05] bg-dark-800/10 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2 h-2 text-dark-500" fill="currentColor" viewBox="0 0 16 16"><path d="M11.354 4.646a.5.5 0 0 1 0 .708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708L8 7.293l2.646-2.647a.5.5 0 0 1 .708 0z"/></svg>
                    </span>
                    <span className="text-[11px] text-slate-600">{row.classic}</span>
                  </div>
                  <div className="p-3 comp-col-highlight flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2 h-2 text-emerald-400" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                    </span>
                    <span className="text-[11px] text-slate-200 font-medium">{row.v2}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 8. PROOF NUMBERS ────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-6 border-y border-white/[0.05] bg-dark-800/10 proof-scan">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {(fr ? [
              { value: '3',    label: 'trajectoires par rapport' },
              { value: '5 min', label: 'pour le questionnaire' },
              { value: '12+',  label: 'sections par trajectoire' },
              { value: 'CV',   label: 'optionnel' },
            ] : [
              { value: '3',    label: 'paths per report' },
              { value: '5 min', label: 'for the questionnaire' },
              { value: '12+',  label: 'sections per path' },
              { value: 'CV',   label: 'optional' },
            ]).map((item, i) => (
              <div key={i} className="text-center px-6 md:px-8 py-4 relative">
                {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/[0.05]" />}
                <div className="text-3xl sm:text-4xl font-black gradient-text tracking-tight tabular-nums">{item.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 9. TESTIMONIALS / PROFILES ──────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {fr ? 'Profils illustratifs' : 'Illustrative profiles'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              {fr ? <>Ils ont découvert <span className="gradient-text">leur autre vie</span></> : <>They discovered <span className="gradient-text">their other life</span></>}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.initials} delay={i * 90} scale>
                <Floating3DCard
                  intensity={6}
                  className="testi-card bg-dark-800 border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 h-full"
                >
                  {/* Profile + meta */}
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center ring-2 ring-white/[0.07] shadow-lg`}>
                        <span className="text-white font-bold text-sm">{t.initials}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-800" />
                    </div>
                    <div>
                      <div className="text-slate-100 font-semibold text-sm">{lang === 'fr' ? t.nameFr : t.nameEn}, {t.age} {fr ? 'ans' : 'yo'}</div>
                      <div className="text-slate-500 text-[11px]">{fr ? 'Profil illustratif' : 'Illustrative profile'}</div>
                    </div>
                  </div>

                  {/* Before → After */}
                  <div className="flex items-center gap-2 bg-dark-900/60 rounded-xl border border-white/[0.05] p-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-600 uppercase tracking-wide font-medium mb-0.5">{fr ? 'Avant' : 'Before'}</div>
                      <div className="text-xs text-slate-400 font-medium truncate">{lang === 'fr' ? t.fromFr : t.fromEn}</div>
                    </div>
                    <ArrowRight size={12} className="text-brand-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-[10px] text-brand-400/80 uppercase tracking-wide font-medium mb-0.5">{fr ? 'Vers' : 'Towards'}</div>
                      <div className="text-xs text-brand-300 font-semibold truncate">{lang === 'fr' ? t.toFr : t.toEn}</div>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-slate-400 text-xs leading-relaxed flex-1 italic">
                    <span className="text-violet-400/40 text-lg leading-none font-serif mr-0.5 not-italic">"</span>
                    {lang === 'fr' ? t.quoteFr : t.quoteEn}
                    <span className="text-violet-400/40 text-lg leading-none font-serif ml-0.5 not-italic">"</span>
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <div className="flex flex-wrap gap-1">
                      {(lang === 'fr' ? t.tagsFr : t.tagsEn).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-violet-600/10 border border-violet-500/15 text-violet-300/80 text-[10px] font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="result-chip flex-shrink-0 ml-2">
                      <Check size={11} strokeWidth={2.5} />
                      {t.months.split('/')[lang === 'fr' ? 0 : 1]?.trim()}
                    </div>
                  </div>
                </Floating3DCard>
              </Reveal>
            ))}
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            {fr ? 'Profils illustratifs inspirés de trajectoires types générées par OtherMe.' : 'Illustrative profiles inspired by typical paths generated by OtherMe.'}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── 10. FINAL CTA ───────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-6 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/cta-otherme.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.30) saturate(0.60)' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(5,5,9,0.65)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(109,40,217,0.20) 0%, transparent 70%)' }} />
          <div className="absolute inset-x-0 top-0 h-32" style={{ background: 'linear-gradient(to bottom, #050509 0%, transparent 100%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: 'linear-gradient(to top, #050509 0%, transparent 100%)' }} />

          {/* Dot grid over image */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(rgba(148,163,184,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        <Reveal className="relative z-10 max-w-2xl mx-auto text-center" scale>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-5">
            {fr ? 'Prochaine étape' : 'Next step'}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            {fr
              ? <><span className="gradient-text-animated">Quelle version</span> de toi t'attend encore ?</>
              : <><span className="gradient-text-animated">Which version</span> of you is still waiting?</>}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {fr
              ? 'Réponds à quelques questions sur toi. OtherMe analyse ton profil et révèle les trajectoires que tu peux encore construire.'
              : 'Answer a few questions about yourself. OtherMe analyses your profile and reveals the paths you can still build.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={handleStart} className="btn-primary text-base py-4 px-12">
              <ArrowRight size={17} />
              {fr ? 'Découvrir mes autres vies' : 'Discover my other lives'}
            </button>
          </div>
          <div className="cta-microcopy mt-5">
            <span>{fr ? 'Sans compte requis pour commencer' : 'No account needed to start'}</span>
            <span className="cta-microcopy-dot" />
            <span>{fr ? 'Résultat personnalisé' : 'Personalised result'}</span>
            <span className="cta-microcopy-dot" />
            <span>{fr ? 'Vous pouvez reprendre plus tard' : 'Resume later if needed'}</span>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <Logo size={36} />
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span>© 2024 OtherMe</span>
            <span className="cta-microcopy-dot" />
            <a href="/landing-v2" className="hover:text-slate-400 transition-colors">V2 Preview</a>
            <span className="cta-microcopy-dot" />
            <a href="/" className="hover:text-slate-400 transition-colors">Version actuelle</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
