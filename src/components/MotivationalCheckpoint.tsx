import { Brain, Sparkles, Map, Zap, Wind, Palette, Lightbulb, Target, TrendingUp, Layers, Compass, Route, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  brain:        Brain,
  sparkles:     Sparkles,
  map:          Map,
  zap:          Zap,
  wind:         Wind,
  palette:      Palette,
  lightbulb:    Lightbulb,
  target:       Target,
  'trending-up': TrendingUp,
  layers:       Layers,
  compass:      Compass,
  route:        Route,
  user:         UserRound,
}

interface Props {
  title:      string
  message:    string
  statLabel:  string
  statValue:  string
  icon:       string
  ctaLabel?:  string
  footer?:    string
  onContinue: () => void
}

export default function MotivationalCheckpoint({
  title, message, statLabel, statValue, icon, ctaLabel = 'Continuer', footer = 'OtherMe · Analyse en cours', onContinue,
}: Props) {
  const IconComponent = ICON_MAP[icon] ?? Sparkles

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="max-w-md w-full bg-[#111111] border border-dark-700 rounded-2xl p-8 md:p-10 text-center shadow-2xl">

        {/* Icône */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/15 border border-violet-500/20 flex items-center justify-center mb-6">
          <IconComponent size={28} className="text-violet-300" strokeWidth={1.5} />
        </div>

        {/* Stat badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          {statLabel} · {statValue}
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-slate-100 mb-4 leading-snug">{title}</h2>

        {/* Message */}
        <p className="text-slate-400 text-sm leading-relaxed mb-10">{message}</p>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="btn-primary w-full justify-center py-4 text-base"
        >
          {ctaLabel} →
        </button>
      </div>

      <p className="text-slate-700 text-xs mt-8">{footer}</p>
    </div>
  )
}
