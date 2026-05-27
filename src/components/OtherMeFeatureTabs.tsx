import { useState, useEffect, useRef } from 'react'
import {
  ScanSearch, Lightbulb, ArrowRightLeft, ListChecks, Zap,
  Brain, Heart, BarChart2, FileText,
  type LucideProps,
} from 'lucide-react'
import Reveal from './Reveal'

type IconComponent = React.ComponentType<LucideProps>

// ── Data ─────────────────────────────────────────────────────────────────────

interface TabDef {
  id: string
  num: string
  labelFr: string
  labelEn: string
  titleFr: string
  titleEn: string
  descFr: string
  descEn: string
  Icon: IconComponent
  color: 'violet' | 'emerald' | 'blue' | 'amber' | 'rose'
}

const TABS: TabDef[] = [
  {
    id: 'analyse', num: '01',
    labelFr: 'Analyser', labelEn: 'Analyse',
    titleFr: 'Analysez votre parcours avec plus de profondeur',
    titleEn: 'Analyse your background with greater depth',
    descFr: 'OtherMe prend en compte vos compétences, vos envies, votre situation actuelle et votre CV si vous l\'ajoutez.',
    descEn: 'OtherMe takes into account your skills, goals, current situation and CV if you add it.',
    Icon: ScanSearch, color: 'violet',
  },
  {
    id: 'revele', num: '02',
    labelFr: 'Révéler', labelEn: 'Reveal',
    titleFr: 'Révélez des trajectoires que vous n\'auriez pas envisagées',
    titleEn: 'Reveal paths you wouldn\'t have considered',
    descFr: 'L\'IA identifie des voies réalistes, alignées et actionnables à partir de votre profil.',
    descEn: 'AI identifies realistic, aligned and actionable paths based on your profile.',
    Icon: Lightbulb, color: 'emerald',
  },
  {
    id: 'compare', num: '03',
    labelFr: 'Comparer', labelEn: 'Compare',
    titleFr: 'Comparez vos 3 chemins possibles côte à côte',
    titleEn: 'Compare your 3 possible paths side by side',
    descFr: 'Chaque trajectoire est évaluée selon la faisabilité, le risque, le revenu, la liberté et l\'alignement.',
    descEn: 'Each path is assessed on feasibility, risk, income, freedom and personal alignment.',
    Icon: ArrowRightLeft, color: 'blue',
  },
  {
    id: 'planifie', num: '04',
    labelFr: 'Planifier', labelEn: 'Plan',
    titleFr: 'Transformez une idée en plan d\'action concret',
    titleEn: 'Turn an idea into a concrete action plan',
    descFr: 'Chaque voie contient une timeline, un plan 30 jours, les compétences à développer et les premières actions.',
    descEn: 'Each path includes a timeline, 30-day plan, skills to develop and first actions to take.',
    Icon: ListChecks, color: 'amber',
  },
  {
    id: 'agir', num: '05',
    labelFr: 'Agir', labelEn: 'Act',
    titleFr: 'Passez à l\'action sans tout quitter',
    titleEn: 'Take action without giving everything up',
    descFr: 'OtherMe vous aide à tester une nouvelle voie progressivement, avec des preuves à construire et des premiers pas réalistes.',
    descEn: 'OtherMe helps you test a new path gradually, with concrete proofs and realistic first steps.',
    Icon: Zap, color: 'rose',
  },
]

const COLOR = {
  violet:  { tab: 'border-violet-500/30 bg-violet-600/[0.08]', num: 'text-violet-400', dot: 'bg-violet-400', card: 'border-violet-500/20 bg-violet-900/20', badge: 'text-violet-300', bar: 'bg-violet-500' },
  emerald: { tab: 'border-emerald-500/25 bg-emerald-600/[0.06]', num: 'text-emerald-400', dot: 'bg-emerald-400', card: 'border-emerald-500/20 bg-emerald-900/20', badge: 'text-emerald-300', bar: 'bg-emerald-500' },
  blue:    { tab: 'border-blue-500/25 bg-blue-600/[0.06]', num: 'text-blue-400', dot: 'bg-blue-400', card: 'border-blue-500/20 bg-blue-900/20', badge: 'text-blue-300', bar: 'bg-blue-500' },
  amber:   { tab: 'border-amber-500/25 bg-amber-600/[0.06]', num: 'text-amber-400', dot: 'bg-amber-400', card: 'border-amber-500/20 bg-amber-900/20', badge: 'text-amber-300', bar: 'bg-amber-500' },
  rose:    { tab: 'border-rose-500/25 bg-rose-600/[0.06]', num: 'text-rose-400', dot: 'bg-rose-400', card: 'border-rose-500/20 bg-rose-900/20', badge: 'text-rose-300', bar: 'bg-rose-500' },
}

// ── Mock visuals per tab ──────────────────────────────────────────────────────

const SIGNAL_COLORS = {
  violet: {
    bg:          'rgba(10,5,25,0.72)',
    bgHover:     'rgba(10,5,25,0.82)',
    border:      'rgba(139,92,246,0.20)',
    borderHover: 'rgba(139,92,246,0.52)',
    glow:        'rgba(139,92,246,0.22)',
    spotlight:   'rgba(139,92,246,0.18)',
    iconBg:      'rgba(109,40,217,0.22)',
    iconGlow:    'rgba(139,92,246,0.35)',
    tagBg:       'rgba(139,92,246,0.13)',
    tagBgHover:  'rgba(139,92,246,0.24)',
    tagText:     '#c4b5fd',
    stripe:      'rgba(139,92,246,0.75)',
    iconClass:   'text-violet-400',
  },
  emerald: {
    bg:          'rgba(5,15,12,0.70)',
    bgHover:     'rgba(5,15,12,0.80)',
    border:      'rgba(52,211,153,0.17)',
    borderHover: 'rgba(52,211,153,0.44)',
    glow:        'rgba(52,211,153,0.18)',
    spotlight:   'rgba(52,211,153,0.16)',
    iconBg:      'rgba(5,150,105,0.22)',
    iconGlow:    'rgba(52,211,153,0.32)',
    tagBg:       'rgba(52,211,153,0.11)',
    tagBgHover:  'rgba(52,211,153,0.22)',
    tagText:     '#6ee7b7',
    stripe:      'rgba(52,211,153,0.75)',
    iconClass:   'text-emerald-400',
  },
  blue: {
    bg:          'rgba(5,10,25,0.70)',
    bgHover:     'rgba(5,10,25,0.80)',
    border:      'rgba(96,165,250,0.17)',
    borderHover: 'rgba(96,165,250,0.44)',
    glow:        'rgba(96,165,250,0.18)',
    spotlight:   'rgba(96,165,250,0.16)',
    iconBg:      'rgba(37,99,235,0.22)',
    iconGlow:    'rgba(96,165,250,0.32)',
    tagBg:       'rgba(96,165,250,0.11)',
    tagBgHover:  'rgba(96,165,250,0.22)',
    tagText:     '#93c5fd',
    stripe:      'rgba(96,165,250,0.75)',
    iconClass:   'text-blue-400',
  },
  amber: {
    bg:          'rgba(20,12,5,0.70)',
    bgHover:     'rgba(20,12,5,0.80)',
    border:      'rgba(251,191,36,0.15)',
    borderHover: 'rgba(251,191,36,0.40)',
    glow:        'rgba(251,191,36,0.16)',
    spotlight:   'rgba(251,191,36,0.14)',
    iconBg:      'rgba(146,64,14,0.24)',
    iconGlow:    'rgba(251,191,36,0.28)',
    tagBg:       'rgba(251,191,36,0.10)',
    tagBgHover:  'rgba(251,191,36,0.20)',
    tagText:     '#fcd34d',
    stripe:      'rgba(251,191,36,0.75)',
    iconClass:   'text-amber-400',
  },
} as const

type SignalColor = keyof typeof SIGNAL_COLORS

function AnalyseVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible]   = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [hoverPos, setHoverPos] = useState<Record<number, { x: number; y: number } | null>>({})

  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [prefersReduced])

  const signals: { Icon: React.ComponentType<LucideProps>; label: string; tags: string[]; color: SignalColor }[] = [
    { Icon: Brain,     label: 'Compétences', tags: ['Communication', 'Organisation', 'Analyse'], color: 'violet'  },
    { Icon: Heart,     label: 'Passions',    tags: ['Technologie', 'Créativité', 'Enseigner'],   color: 'emerald' },
    { Icon: BarChart2, label: 'Situation',   tags: ['Salarié · 5 ans', 'Bac+5', 'Paris'],        color: 'blue'    },
    { Icon: FileText,  label: 'CV ajouté',   tags: ['3 expériences', 'Secteur : Tech'],           color: 'amber'   },
  ]

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-4">
      {signals.map((s, i) => {
        const sc       = SIGNAL_COLORS[s.color]
        const pos      = hoverPos[i]
        const isHover  = hoverIdx === i
        const delay    = i * 105
        const easeIn   = prefersReduced ? 'none' : `opacity 0.62s ease ${delay}ms, transform 0.62s ease ${delay}ms`

        return (
          /* ── Entrance wrapper — handles scroll-stagger animation ── */
          <div
            key={i}
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'scale(1) translateY(0px)' : 'scale(0.97) translateY(24px)',
              transition: easeIn,
            }}
          >
            {/* ── Hover card — elevation + glow on hover ── */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 h-full cursor-default select-none"
              style={{
                background:  isHover ? sc.bgHover : sc.bg,
                border:      `1px solid ${isHover ? sc.borderHover : sc.border}`,
                boxShadow:   isHover
                  ? `0 8px 32px ${sc.glow}, 0 0 0 1px ${sc.borderHover}`
                  : '0 2px 12px rgba(0,0,0,0.20)',
                backdropFilter: 'blur(6px)',
                transform:   isHover ? 'translateY(-4px)' : 'translateY(0px)',
                transition:  'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease',
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                setHoverPos(prev => ({ ...prev, [i]: { x: e.clientX - r.left, y: e.clientY - r.top } }))
              }}
              onMouseLeave={() => {
                setHoverIdx(null)
                setHoverPos(prev => ({ ...prev, [i]: null }))
              }}
            >
              {/* Top accent stripe — brightens on hover */}
              <div
                className="absolute top-0 left-5 right-5 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${sc.stripe}, transparent)`,
                  opacity:    isHover ? 0.90 : 0.30,
                  transition: 'opacity 0.22s ease',
                }}
              />

              {/* Cursor-following radial spotlight */}
              {pos && !prefersReduced && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(130px circle at ${pos.x}px ${pos.y}px, ${sc.spotlight}, transparent 70%)`,
                  }}
                />
              )}

              {/* Icon ring + category label */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: sc.iconBg,
                    boxShadow:  isHover ? `0 0 14px ${sc.iconGlow}` : 'none',
                    transform:  isHover ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  }}
                >
                  <s.Icon size={16} strokeWidth={1.6} className={sc.iconClass} />
                </div>
                <p className="text-slate-100 text-sm font-semibold leading-tight tracking-tight">{s.label}</p>
              </div>

              {/* Tags — stagger-in after card appears */}
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t, ti) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium leading-none"
                    style={{
                      background: isHover ? sc.tagBgHover : sc.tagBg,
                      color:      sc.tagText,
                      opacity:    visible ? 1 : 0,
                      transform:  visible ? 'translateY(0px)' : 'translateY(6px)',
                      transition: prefersReduced
                        ? 'none'
                        : `opacity 0.40s ease ${delay + 300 + ti * 80}ms, transform 0.40s ease ${delay + 300 + ti * 80}ms, background 0.20s ease`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Bottom scan line — sweeps in once card is visible */}
              <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden rounded-b-2xl">
                <div
                  style={{
                    height:     '100%',
                    background: `linear-gradient(90deg, transparent, ${sc.stripe}, transparent)`,
                    width:      visible ? '100%' : '0%',
                    opacity:    0.45,
                    transition: prefersReduced ? 'none' : `width 1.1s ease ${delay + 580}ms`,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReveleVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [prefersReduced])

  const paths = [
    { color: 'emerald', label: 'Chargé de projet digital', score: 87, tag: 'Accessible',  delay: 0   },
    { color: 'violet',  label: 'Consultant indépendant',   score: 74, tag: 'Alignée',     delay: 110 },
    { color: 'amber',   label: 'Product Manager',          score: 68, tag: 'Ambitieuse',  delay: 220 },
  ]

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      {paths.map((p, i) => {
        const c = COLOR[p.color as keyof typeof COLOR]
        return (
          <div
            key={i}
            className={`relative overflow-hidden border rounded-xl p-4 backdrop-blur-sm ${c.card}`}
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'translateY(0px)' : 'translateY(20px)',
              transition: prefersReduced ? 'none' : `opacity 0.55s ease ${p.delay}ms, transform 0.55s ease ${p.delay}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${c.badge}`}>{p.tag}</span>
              <span className="text-slate-400 text-xs">{p.score}% faisabilité</span>
            </div>
            <p className="text-slate-100 text-sm font-semibold mb-3">{p.label}</p>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full ${c.bar} rounded-full`}
                style={{
                  width:      visible ? `${p.score}%` : '0%',
                  transition: prefersReduced ? 'none' : `width 1.2s ease ${p.delay + 350}ms`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompareVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [prefersReduced])

  const dims = [
    { label: 'Faisabilité', a: 87, b: 74, c: 68 },
    { label: 'Revenu',      a: 65, b: 72, c: 88 },
    { label: 'Liberté',     a: 55, b: 82, c: 90 },
    { label: 'Stabilité',   a: 80, b: 60, c: 45 },
  ]
  const cols = ['Proche', 'Passion', 'Ambitieuse']
  return (
    <div ref={containerRef} className="bg-dark-800/70 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="grid grid-cols-4 text-[10px] font-semibold uppercase tracking-wider border-b border-white/[0.06] bg-dark-800/60">
        <div className="p-3 text-slate-600" />
        {cols.map(c => <div key={c} className="p-3 text-slate-500 border-l border-white/[0.05]">{c}</div>)}
      </div>
      {dims.map((d, i) => (
        <div key={i} className={`grid grid-cols-4 text-xs ${i < dims.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
          <div className="p-3 text-slate-500 text-[11px] font-medium">{d.label}</div>
          {[d.a, d.b, d.c].map((val, j) => (
            <div key={j} className="p-3 border-l border-white/[0.04]">
              <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${j === 0 ? 'bg-emerald-500' : j === 1 ? 'bg-violet-500' : 'bg-amber-500'}`}
                  style={{
                    width:      visible ? `${val}%` : '0%',
                    transition: prefersReduced ? 'none' : `width 1.0s ease ${i * 100 + j * 50 + 100}ms`,
                  }}
                />
              </div>
              <span className="text-slate-600 text-[10px]">{val}%</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function PlanifierVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [prefersReduced])

  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const actions = [
    'Analyser 15 offres PM sur LinkedIn',
    'Identifier 3 professionnels à contacter',
    'Lire 5 fiches métier Product School',
  ]
  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div
        className="bg-dark-800/70 border border-white/[0.09] rounded-xl p-4 backdrop-blur-sm"
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0px)' : 'translateY(18px)',
          transition: prefersReduced ? 'none' : 'opacity 0.55s ease, transform 0.55s ease',
        }}
      >
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Plan 30 jours</p>
        <div className="flex items-center gap-1">
          {weeks.map((w, i) => (
            <div key={w} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-1 rounded-full bg-dark-600 overflow-hidden">
                <div
                  className={`h-full rounded-full origin-left ${i < 2 ? 'bg-violet-500' : 'bg-dark-500'}`}
                  style={{
                    transform:  visible ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left center',
                    transition: prefersReduced ? 'none' : `transform 0.55s ease ${i * 130}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-600">{w}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {actions.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-dark-800/60 border border-white/[0.07] rounded-lg px-3 py-2.5 backdrop-blur-sm"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'translateX(0px)' : 'translateX(-14px)',
              transition: prefersReduced ? 'none' : `opacity 0.40s ease ${i * 110 + 280}ms, transform 0.40s ease ${i * 110 + 280}ms`,
            }}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${i < 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-dark-700 text-slate-600'}`}>
              {i < 2 ? '✓' : '→'}
            </span>
            <span className="text-slate-300 text-xs">{a}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgirVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [prefersReduced])

  const steps = [
    { done: true,  label: 'Explorer 15 offres PM ciblées' },
    { done: true,  label: 'Contacter 1 PM en reconversion' },
    { done: false, label: 'Rejoindre une communauté produit' },
    { done: false, label: 'Créer un premier case study' },
    { done: false, label: 'Postuler à 3 offres Associate PM' },
  ]
  return (
    <div
      ref={containerRef}
      className="bg-dark-800/70 border border-white/[0.10] rounded-2xl p-5 backdrop-blur-sm"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0px)' : 'translateY(20px)',
        transition: prefersReduced ? 'none' : 'opacity 0.60s ease, transform 0.60s ease',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-100 text-sm font-semibold">Mes premiers pas</p>
        <span className="text-[10px] text-emerald-400 font-semibold">2 / 5 faits</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? 'translateX(0px)' : 'translateX(-12px)',
              transition: prefersReduced ? 'none' : `opacity 0.40s ease ${i * 90 + 200}ms, transform 0.40s ease ${i * 90 + 200}ms`,
            }}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold border ${
              s.done
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'border-dark-600 text-dark-500'
            }`}>{s.done ? '✓' : ''}</span>
            <span className={`text-xs ${s.done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{
            width:      visible ? '40%' : '0%',
            transition: prefersReduced ? 'none' : 'width 1.2s ease 700ms',
          }}
        />
      </div>
    </div>
  )
}

const VISUALS: Record<string, React.ComponentType> = {
  analyse: AnalyseVisual,
  revele:  ReveleVisual,
  compare: CompareVisual,
  planifie: PlanifierVisual,
  agir:    AgirVisual,
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { lang: 'fr' | 'en' }

export default function OtherMeFeatureTabs({ lang }: Props) {
  const [active, setActive] = useState(0)
  const tab = TABS[active]
  const c   = COLOR[tab.color]
  const Visual = VISUALS[tab.id]

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-dark-950">
      {/* Per-tab background images — Révéler / Planifier / Agir only
          Analyser uses its own immersive content panel (see below) */}
      {([
        { id: 'revele',   src: '/reveler-otherme.png'   },
        { id: 'planifie', src: '/planifier-otherme.png' },
        { id: 'agir',     src: '/agir-otherme.png'      },
      ] as const).map(item => (
        <div
          key={item.id}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: tab.id === item.id ? 1 : 0, transition: 'opacity 0.85s ease' }}
        >
          <img
            src={item.src}
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
            aria-hidden
            style={{ filter: 'brightness(0.40) saturate(0.75)' }}
          />
        </div>
      ))}

      {/* Global overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(5,5,9,0.58)' }} />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #050509 0%, rgba(5,5,9,0.55) 55%, transparent 100%)' }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5,5,9,0.98) 0%, rgba(5,5,9,0.60) 55%, transparent 100%)' }} />

      {/* Ambient violet glow (always present) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.09) 0%, rgba(109,40,217,0.03) 60%, transparent 80%)' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
            {lang === 'fr' ? 'Ce qu\'OtherMe fait pour vous' : 'What OtherMe does for you'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {lang === 'fr'
              ? <>De l'analyse au <span className="gradient-text">plan d'action</span></>
              : <>From analysis to <span className="gradient-text">action plan</span></>
            }
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            {lang === 'fr'
              ? 'Cinq étapes concrètes pour transformer votre profil en trajectoires actionnables.'
              : 'Five concrete steps to turn your profile into actionable paths.'}
          </p>
        </Reveal>

        {/* Desktop layout: tabs left + content right */}
        <div className="hidden lg:grid grid-cols-[280px_1fr] gap-10 items-start">
          {/* Tab list */}
          <div className="flex flex-col gap-2 sticky top-28">
            {TABS.map((t, i) => {
              const isActive = i === active
              const tc = COLOR[t.color]
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-250 border ${
                    isActive
                      ? `${tc.tab} border-opacity-100`
                      : 'border-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-white/[0.08]' : 'bg-white/[0.03]'
                  }`}>
                    <t.Icon size={16} strokeWidth={1.5} className={isActive ? tc.badge : 'text-slate-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold tracking-widest mb-0.5 ${isActive ? tc.num : 'text-dark-500'}`}>{t.num}</div>
                    <div className={`text-sm font-medium ${isActive ? 'text-slate-100' : 'text-slate-600'}`}>
                      {lang === 'fr' ? t.labelFr : t.labelEn}
                    </div>
                  </div>
                  {isActive && <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tc.dot}`} />}
                </button>
              )
            })}
          </div>

          {/* Content panel */}
          <div key={active} className="animate-fade-in">
            {tab.id === 'analyse' ? (

              /* ── Analyser: panneau immersif avec image en fond ── */
              <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '560px' }}>

                {/* Image de fond — visible, lumineuse, centrée */}
                <img
                  src="/analyser-otherme.png"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                  alt=""
                  aria-hidden
                  style={{ filter: 'brightness(0.82) contrast(1.06) saturate(1.08)' }}
                />

                {/* Overlay global léger — laisse l'image respirer */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(5,5,9,0.28)' }} />

                {/* Gradient bas — lisibilité des cartes */}
                <div className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(5,5,9,0.88) 0%, rgba(5,5,9,0.55) 40%, transparent 100%)' }} />

                {/* Gradient haut — lisibilité du titre */}
                <div className="absolute inset-x-0 top-0 h-44 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(5,5,9,0.75) 0%, rgba(5,5,9,0.20) 60%, transparent 100%)' }} />

                {/* Contenu posé par-dessus */}
                <div className="relative z-10 p-8 flex flex-col" style={{ minHeight: '560px' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.card}`}>
                      <tab.Icon size={18} strokeWidth={1.5} className={c.badge} />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${c.num}`}>{tab.num}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug">
                    {lang === 'fr' ? tab.titleFr : tab.titleEn}
                  </h3>
                  <p className="text-slate-300/80 text-base leading-relaxed mb-10 max-w-lg">
                    {lang === 'fr' ? tab.descFr : tab.descEn}
                  </p>
                  <div className="max-w-lg">
                    <Visual />
                  </div>
                </div>
              </div>

            ) : (

              /* ── Autres onglets: layout standard ── */
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.card}`}>
                    <tab.Icon size={18} strokeWidth={1.5} className={c.badge} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${c.num}`}>{tab.num}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4 leading-snug">
                  {lang === 'fr' ? tab.titleFr : tab.titleEn}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed mb-10">
                  {lang === 'fr' ? tab.descFr : tab.descEn}
                </p>
                <div className="max-w-lg">
                  <Visual />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile layout: pill tabs + stacked content */}
        <div className="lg:hidden">
          {/* Pill tabs row */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory mb-8">
            {TABS.map((t, i) => {
              const isActive = i === active
              const tc = COLOR[t.color]
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(i)}
                  className={`flex-shrink-0 snap-start flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? `${tc.tab}`
                      : 'border-white/[0.07] text-slate-600 hover:text-slate-500'
                  }`}
                >
                  <t.Icon size={13} strokeWidth={1.5} className={isActive ? tc.badge : 'text-slate-600'} />
                  <span className={isActive ? 'text-slate-100' : ''}>{lang === 'fr' ? t.labelFr : t.labelEn}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile content */}
          <div key={`m-${active}`} className="animate-fade-in">
            {tab.id === 'analyse' ? (

              /* ── Analyser mobile: panneau immersif ── */
              <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '480px' }}>
                <img
                  src="/analyser-otherme.png"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                  alt=""
                  aria-hidden
                  style={{ filter: 'brightness(0.80) contrast(1.06) saturate(1.08)' }}
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(5,5,9,0.30)' }} />
                <div className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(5,5,9,0.90) 0%, rgba(5,5,9,0.55) 45%, transparent 100%)' }} />
                <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(5,5,9,0.72) 0%, transparent 100%)' }} />
                <div className="relative z-10 p-6 flex flex-col" style={{ minHeight: '480px' }}>
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug">
                    {lang === 'fr' ? tab.titleFr : tab.titleEn}
                  </h3>
                  <p className="text-slate-300/80 text-sm leading-relaxed mb-8">
                    {lang === 'fr' ? tab.descFr : tab.descEn}
                  </p>
                  <Visual />
                </div>
              </div>

            ) : (

              /* ── Autres onglets mobile: layout standard ── */
              <>
                <h3 className="text-xl font-bold text-slate-100 mb-3 leading-snug">
                  {lang === 'fr' ? tab.titleFr : tab.titleEn}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {lang === 'fr' ? tab.descFr : tab.descEn}
                </p>
                <Visual />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
