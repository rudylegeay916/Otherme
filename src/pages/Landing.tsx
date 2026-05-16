import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Route, BriefcaseBusiness, BadgeEuro, ShieldCheck, CalendarRange, ListChecks,
  ArrowRightLeft, Brain, GraduationCap, ClipboardList, ScanSearch,
  RefreshCcw, Compass, Lightbulb, TrendingUp,
  Target, FileText, AlertTriangle, CheckCircle2, ChevronDown, Zap, BarChart3,
  type LucideProps,
} from 'lucide-react'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { hasStartedTest, clearProgress } from '../lib/onboardingStorage'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

// ── Données statiques bilingues ───────────────────────────────────────────────

type IconComponent = React.ComponentType<LucideProps>

const DELIVERABLES: Array<{ Icon: IconComponent; fr: { title: string; desc: string }; en: { title: string; desc: string } }> = [
  {
    Icon: Route,
    fr: { title: '3 trajectoires personnalisées', desc: 'Trois voies professionnelles distinctes : une proche de ton parcours actuel, une progressive alignée sur tes envies, une plus ambitieuse. L\'objectif est de comparer plusieurs futurs possibles, pas de te donner une seule réponse simpliste.' },
    en: { title: '3 personalised paths', desc: 'Three distinct professional directions: one close to your current background, one progressively aligned with your interests, one more ambitious. The goal is to compare multiple possible futures, not give a single simplistic answer.' },
  },
  {
    Icon: BriefcaseBusiness,
    fr: { title: 'Métier cible identifié', desc: 'Chaque métier cible est expliqué avec son environnement de travail, ses missions principales, son niveau d\'accessibilité et les raisons pour lesquelles il peut correspondre à ton profil spécifique.' },
    en: { title: 'Target job identified', desc: 'Each target role is explained with its work environment, key missions, accessibility level and the reasons it may suit your specific profile.' },
  },
  {
    Icon: BadgeEuro,
    fr: { title: 'Revenu estimé réaliste', desc: 'Fourchette salariale basée sur le marché actuel, avec une trajectoire financière réaliste sur les 2 premières années de transition — pas sur des promesses.' },
    en: { title: 'Realistic salary estimate', desc: 'Salary range based on current market data, with a realistic financial trajectory for the first 2 transition years — not wishful thinking.' },
  },
  {
    Icon: ShieldCheck,
    fr: { title: 'Niveau de risque évalué', desc: 'Pour choisir en connaissance de cause : chaque trajectoire inclut une évaluation des risques concrets, des erreurs fréquentes et des solutions pour les anticiper avant de se lancer.' },
    en: { title: 'Risk level assessed', desc: 'To make informed decisions: each path includes an assessment of real risks, common mistakes and solutions to anticipate them before committing.' },
  },
  {
    Icon: CalendarRange,
    fr: { title: 'Timeline 6 à 24 mois', desc: 'La timeline détaille les grandes étapes de transition : clarification, montée en compétences, preuves à construire, premières candidatures, première expérience et consolidation du positionnement.' },
    en: { title: 'Timeline 6 to 24 months', desc: 'The timeline details the key transition stages: clarification, skill-building, proofs to build, first applications, first experience and positioning consolidation.' },
  },
  {
    Icon: ListChecks,
    fr: { title: 'Plan d\'action 30 jours', desc: 'Des actions concrètes semaine par semaine pour ne pas rester bloqué dans la réflexion. Chaque semaine inclut un objectif précis, un livrable attendu et un conseil pratique.' },
    en: { title: '30-day action plan', desc: 'Concrete actions week by week to avoid getting stuck in reflection. Each week includes a precise objective, an expected deliverable and a practical tip.' },
  },
  {
    Icon: ArrowRightLeft,
    fr: { title: 'Compétences transférables', desc: 'Le rapport identifie ce que tu sais déjà faire et comment le valoriser dans une nouvelle voie professionnelle — pour éviter de repartir de zéro inutilement.' },
    en: { title: 'Transferable skills', desc: 'The report identifies what you already know how to do and how to leverage it in a new career path — to avoid unnecessarily starting from scratch.' },
  },
  {
    Icon: Brain,
    fr: { title: 'Compétences à développer', desc: 'Le rapport distingue les compétences prioritaires à acquérir, leur utilité concrète dans le métier cible et les moyens précis de les travailler.' },
    en: { title: 'Skills to develop', desc: 'The report distinguishes the priority skills to acquire, their concrete usefulness in the target role and the specific ways to work on them.' },
  },
  {
    Icon: GraduationCap,
    fr: { title: 'Ressources & formations', desc: 'Des pistes concrètes pour te former sans repartir de zéro : formations courtes, plateformes ciblées, certifications accessibles et méthodes d\'auto-apprentissage adaptées à chaque trajectoire.' },
    en: { title: 'Resources & training', desc: 'Concrete leads to upskill without starting from scratch: short courses, targeted platforms, accessible certifications and self-learning methods tailored to each path.' },
  },
]

const FOR_WHO: Array<{ Icon: IconComponent; featured?: boolean; fr: { title: string; desc: string }; en: { title: string; desc: string } }> = [
  {
    Icon: BriefcaseBusiness,
    featured: true,
    fr: { title: 'Jeunes actifs (25–35 ans)', desc: 'Tu travailles, mais tu te demandes si tu es vraiment au bon endroit — et tu veux changer sans repartir de zéro.' },
    en: { title: 'Young professionals (25–35)', desc: 'You\'re working but wondering if you\'re in the right place — and want to change without starting over.' },
  },
  {
    Icon: RefreshCcw,
    fr: { title: 'Profils en reconversion', desc: 'Tu sais que tu veux changer, mais tu ne sais pas encore vers quoi te diriger ni par où commencer.' },
    en: { title: 'Career changers', desc: 'You know you want to change, but haven\'t found your direction or where to start.' },
  },
  {
    Icon: Compass,
    fr: { title: 'Salariés en perte de sens', desc: 'Tu fais bien ton travail, mais il ne te nourrit plus. Tu cherches à te réaligner avec ce qui compte vraiment.' },
    en: { title: 'Employees losing meaning', desc: 'You do your job well, but it no longer fulfils you. You\'re seeking realignment with what truly matters.' },
  },
  {
    Icon: GraduationCap,
    fr: { title: 'Étudiants en questionnement', desc: 'Tu hésites entre plusieurs orientations et tu veux voir plus loin que les débouchés classiques.' },
    en: { title: 'Students at a crossroads', desc: 'Unsure between directions and want to see beyond conventional career paths.' },
  },
  {
    Icon: Lightbulb,
    fr: { title: 'Profils créatifs', desc: 'Tes projets perso méritent peut-être d\'être ton vrai métier — OtherMe l\'explore sérieusement.' },
    en: { title: 'Creative profiles', desc: 'Your personal projects might deserve to become your real job — OtherMe explores it seriously.' },
  },
  {
    Icon: TrendingUp,
    fr: { title: 'Ambitieux discrets', desc: 'Tu as plus de potentiel que ce que ton CV laisse paraître. Il est temps de le voir clairement.' },
    en: { title: 'Quiet ambitious', desc: 'You have more potential than your CV reveals. It\'s time to see it clearly.' },
  },
]

const AVOIDS = [
  {
    fr: 'Continuer dans un métier qui ne te correspond plus simplement parce que tu ne sais pas quoi faire d\'autre',
    en: 'Continuing in a career that no longer fits you simply because you don\'t know what else to do',
  },
  {
    fr: 'Choisir une reconversion trop floue, sans plan ni projection réaliste',
    en: 'Choosing a vague career change with no plan or realistic projection',
  },
  {
    fr: 'Croire qu\'il faut repartir de zéro alors que certaines compétences sont déjà transférables',
    en: 'Believing you have to start over when some of your skills are already transferable',
  },
  {
    fr: 'Sous-estimer ton expérience et les passerelles possibles vers d\'autres métiers',
    en: 'Underestimating your experience and the bridges possible to other careers',
  },
  {
    fr: 'Confondre passion et projet professionnel viable',
    en: 'Confusing a passion with a viable professional project',
  },
  {
    fr: 'Prendre une décision importante sans avoir sérieusement exploré plusieurs options',
    en: 'Making an important decision without seriously exploring multiple options',
  },
]

const WHY_DIFFERENT: Array<{ Icon: IconComponent; fr: { title: string; desc: string }; en: { title: string; desc: string } }> = [
  {
    Icon: BarChart3,
    fr: { title: 'Analyse de ton parcours complet', desc: 'Pas un questionnaire générique. OtherMe prend en compte ton histoire, tes compétences, ton contexte et ton CV si tu le fournis.' },
    en: { title: 'Analysis of your full background', desc: 'Not a generic quiz. OtherMe takes into account your history, skills, context and CV if you provide it.' },
  },
  {
    Icon: Target,
    fr: { title: 'Résultats vraiment personnalisés', desc: 'Deux profils similaires obtiennent des trajectoires différentes. Il n\'y a pas de réponse standard.' },
    en: { title: 'Truly personalised results', desc: 'Two similar profiles get different paths. There\'s no standard answer.' },
  },
  {
    Icon: ClipboardList,
    fr: { title: 'Un plan d\'action concret', desc: 'Chaque trajectoire inclut les premières étapes réalistes à enclencher, pas juste un titre de métier.' },
    en: { title: 'A concrete action plan', desc: 'Each path includes realistic first steps to take, not just a job title.' },
  },
  {
    Icon: ShieldCheck,
    fr: { title: 'Sans promesses magiques', desc: 'OtherMe ne remplace pas un conseiller en évolution professionnelle. Il t\'aide à clarifier tes options et à avancer avec une feuille de route structurée.' },
    en: { title: 'No magic promises', desc: 'OtherMe doesn\'t replace a career coach. It helps you clarify your options and move forward with a structured roadmap.' },
  },
]

// Step icons for "Comment ça fonctionne ?" (indexed 0-2, matches t.steps order)
const STEP_ICONS: IconComponent[] = [ClipboardList, ScanSearch, Route]

// ── Exemple de trajectoire — données statiques ────────────────────────────────

interface ExTimelinePeriodData {
  period: string
  objective: string
  actions: string
  deliverable: string
  kpi: string
  vigilance: string
}

const EX_TIMELINE: ExTimelinePeriodData[] = [
  {
    period: '0 à 30 jours',
    objective: 'Clarifier le positionnement et vérifier que le métier correspond vraiment au profil.',
    actions: 'Analyser 10 offres de chargé de projet digital junior sur LinkedIn et Indeed, noter les compétences qui reviennent souvent, regarder 3 témoignages métier en ligne, identifier les outils les plus cités.',
    deliverable: 'Une fiche de synthèse avec les missions du métier, les compétences demandées et les écarts à combler.',
    kpi: 'Être capable d\'expliquer le métier en 5 phrases simples et de dire précisément pourquoi il correspond au profil.',
    vigilance: 'Ne pas se lancer directement dans une formation sans avoir compris les attentes réelles du marché.',
  },
  {
    period: '1 à 3 mois',
    objective: 'Acquérir les bases opérationnelles du métier.',
    actions: 'Apprendre les bases de la gestion de projet (Notion, Trello ou Asana), découvrir les outils collaboratifs, comprendre les notions de brief, planning, cahier des charges, suivi d\'avancement et reporting.',
    deliverable: 'Un premier mini-projet structuré avec objectif, étapes, planning, livrables et indicateurs — même fictif.',
    kpi: 'Pouvoir présenter un projet simple de façon claire et structurée, avec vocabulaire correct du métier.',
    vigilance: 'Éviter d\'accumuler des contenus théoriques sans produire de preuve concrète.',
  },
  {
    period: '3 à 6 mois',
    objective: 'Construire une crédibilité visible.',
    actions: 'Créer un portfolio simple, documenter 1 ou 2 cas pratiques, refaire le CV autour des compétences transférables, améliorer le profil LinkedIn avec les bons mots-clés.',
    deliverable: 'Une page portfolio ou un document PDF présentant les projets réalisés et les compétences démontrées.',
    kpi: 'Obtenir des retours extérieurs positifs sur le positionnement et être capable de candidater sur des offres junior.',
    vigilance: 'Ne pas cacher la reconversion — l\'expliquer comme une trajectoire logique et progressive.',
  },
  {
    period: '6 à 9 mois',
    objective: 'Entrer dans une phase active d\'opportunités.',
    actions: 'Cibler des postes junior, stages, alternances, missions courtes ou projets associatifs, contacter des professionnels du secteur, préparer des entretiens avec un pitch de reconversion clair.',
    deliverable: 'Une liste de 30 opportunités qualifiées et un script d\'approche personnalisé.',
    kpi: 'Obtenir des premiers échanges, entretiens ou retours sur candidature dans le secteur cible.',
    vigilance: 'Ne pas viser uniquement les postes les plus compétitifs — chercher aussi les portes d\'entrée réalistes.',
  },
  {
    period: '9 à 12 mois',
    objective: 'Sécuriser une première expérience crédible.',
    actions: 'Accepter une première mission, un poste junior, un stage ou un projet concret permettant de démontrer les compétences en situation réelle.',
    deliverable: 'Une expérience réelle ou simulée suffisamment solide pour être valorisée dans le CV.',
    kpi: 'Être capable de raconter une première expérience projet avec résultats, difficultés et apprentissages concrets.',
    vigilance: 'Ne pas attendre le poste parfait — commencer à construire de l\'expérience dès que possible.',
  },
  {
    period: '12 à 24 mois',
    objective: 'Consolider le positionnement et progresser vers plus d\'autonomie.',
    actions: 'Approfondir les outils, prendre plus de responsabilités, se spécialiser dans un secteur ou une méthode, améliorer la capacité à piloter des projets plus complexes.',
    deliverable: 'Un profil professionnel clair, avec expériences, projets, compétences et positionnement cohérent.',
    kpi: 'Accéder à des postes plus stables ou mieux rémunérés, dans un secteur et un rôle clairement définis.',
    vigilance: 'Ne pas rester dans un rôle trop junior si les compétences progressent rapidement — demander plus de responsabilités.',
  },
]

const REPORT_CONTENTS: Array<{ Icon: IconComponent; title: string; desc: string }> = [
  { Icon: ScanSearch, title: 'Diagnostic de départ', desc: 'Analyse de ton profil, de ton parcours et de tes réponses pour poser une base solide avant toute recommandation.' },
  { Icon: Route, title: '3 trajectoires détaillées', desc: 'Trois voies distinctes avec des secteurs différents, chacune expliquée en profondeur et justifiée selon ton profil réel.' },
  { Icon: BarChart3, title: 'Scores de faisabilité', desc: 'Évaluation multi-dimensionnelle : compatibilité personnelle, effort de transition, opportunité marché et faisabilité concrète.' },
  { Icon: CalendarRange, title: 'Timeline approfondie', desc: 'Jalons de 30 jours à 24 mois : objectifs, actions, livrables et indicateurs de réussite pour chaque période clé.' },
  { Icon: ListChecks, title: 'Plan d\'action 30 jours', desc: 'Actions semaine par semaine pour démarrer concrètement, avec objectif, livrable et conseil pratique par semaine.' },
  { Icon: AlertTriangle, title: 'Risques et erreurs à éviter', desc: 'Les obstacles fréquents liés à ta trajectoire spécifique, avec des solutions concrètes pour les anticiper.' },
  { Icon: CheckCircle2, title: 'Preuves à construire', desc: 'Les livrables à créer pour devenir crédible auprès des recruteurs ou clients de ta nouvelle voie professionnelle.' },
  { Icon: FileText, title: 'Positionnement CV / LinkedIn', desc: 'Phrase de positionnement, accroche LinkedIn, pitch d\'entretien et mots-clés CV pour maximiser ta visibilité.' },
  { Icon: Zap, title: 'Première action concrète', desc: 'Une action précise, réalisable aujourd\'hui ou demain, pour ne pas repartir les mains vides après la lecture.' },
]

// ── Composants internes ───────────────────────────────────────────────────────

function ExSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: IconComponent; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-dark-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 bg-dark-800/40 hover:bg-dark-800/70 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2.5 font-semibold text-slate-200 text-sm">
          <Icon size={15} strokeWidth={1.5} className="text-brand-400 flex-shrink-0" />
          {title}
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 py-4 border-t border-dark-700">{children}</div>}
    </div>
  )
}

function TimelinePeriod({ period, index }: { period: ExTimelinePeriodData; index: number }) {
  const [open, setOpen] = useState(false)
  const dotColors = ['bg-violet-500', 'bg-blue-500', 'bg-indigo-500', 'bg-teal-500', 'bg-green-500', 'bg-emerald-500']
  return (
    <div className="border border-dark-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800/30 hover:bg-dark-800/60 transition-colors text-left gap-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[index]}`} />
          <span className="text-sm font-semibold text-slate-200 flex-shrink-0">{period.period}</span>
          <span className="text-xs text-slate-600 hidden sm:block truncate">— {period.objective.slice(0, 55)}…</span>
        </div>
        <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-dark-700 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 mb-1">Objectif</p>
            <p className="text-sm text-slate-300 leading-relaxed">{period.objective}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Actions concrètes</p>
            <p className="text-sm text-slate-400 leading-relaxed">{period.actions}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 pt-1">
            <div className="bg-green-900/15 border border-green-800/20 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-green-400 mb-1.5">Livrable attendu</p>
              <p className="text-xs text-slate-400 leading-relaxed">{period.deliverable}</p>
            </div>
            <div className="bg-blue-900/15 border border-blue-800/20 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-blue-400 mb-1.5">Indicateur de réussite</p>
              <p className="text-xs text-slate-400 leading-relaxed">{period.kpi}</p>
            </div>
            <div className="bg-amber-900/15 border border-amber-800/20 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-semibold text-amber-400 mb-1.5">Point de vigilance</p>
              <p className="text-xs text-slate-400 leading-relaxed">{period.vigilance}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const { lang }  = useLanguage()
  const tr        = useTr(lang)
  const t         = tr.landing

  const [started, setStarted]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => { setStarted(hasStartedTest()) }, [])

  const handleStart          = () => navigate('/onboarding')
  const handleResume         = () => navigate('/onboarding')
  const handleConfirmRestart = () => {
    clearProgress(); setStarted(false); setShowConfirm(false); navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-dark-950">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-dark-950/85 backdrop-blur-md border-b border-white/[0.06]">
        <Logo size={68} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {started ? (
            <>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary py-2 px-4">{tr.nav.restart}</button>
              <button onClick={handleResume} className="btn-primary py-2 px-5">{tr.nav.resume}</button>
            </>
          ) : (
            <button onClick={handleStart} className="btn-primary py-2 px-5">{tr.nav.start}</button>
          )}
        </div>
      </nav>

      {/* ── Modal confirmation restart ─────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-dark-800 border border-white/[0.10] rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-red-400 text-lg font-bold">!</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">{tr.nav.restartTitle}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{tr.nav.restartMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-3">{tr.c.cancel}</button>
              <button onClick={handleConfirmRestart} className="flex-1 py-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97]">{tr.nav.restartConfirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-700/[0.09] rounded-full blur-[140px]" />
          <div className="absolute top-[60%] left-[18%] w-[300px] h-[300px] bg-indigo-800/[0.07] rounded-full blur-[100px]" />
          <div className="absolute top-[15%] right-[12%] w-[220px] h-[220px] bg-purple-800/[0.06] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300/90 text-xs font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400/80" />
            {t.badge}
          </div>

          {/* Titre hero */}
          <h1 className="font-bold tracking-tight mb-8">
            <span className="block text-slate-100 text-[2.4rem] sm:text-[3rem] md:text-[3.5rem] leading-[1.28]">
              {t.heroTitle}
            </span>
            <span className="block gradient-text text-[2rem] sm:text-[2.5rem] md:text-[2.9rem] leading-[1.28]">
              {t.heroAccent}
            </span>
            <span className="block gradient-text text-[2rem] sm:text-[2.5rem] md:text-[2.9rem] leading-[1.28]">
              {t.heroTitle2}
            </span>
          </h1>

          {/* Sous-titre */}
          <p
            className="text-base md:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.heroSub }}
          />

          {/* CTA */}
          {started ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <button onClick={handleResume} className="btn-primary text-base py-3.5 px-9 w-full sm:w-auto">{t.ctaResume}</button>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto">{t.ctaRestart}</button>
            </div>
          ) : (
            <div className="flex justify-center mb-10">
              <button onClick={handleStart} className="btn-primary text-base py-3.5 px-9">{t.heroCta}</button>
            </div>
          )}

          {/* Microcopy sous CTA */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 flex-wrap">
            <span>{t.statRating}</span>
            <span className="hidden sm:block w-px h-3 bg-dark-600" />
            <span>{t.statReports}</span>
            <span className="hidden sm:block w-px h-3 bg-dark-600" />
            <span>{t.statSpeed}</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-dark-600 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Bannière de reprise ────────────────────────────────────── */}
      {started && (
        <section className="px-4 -mt-8 pb-8 relative z-10">
          <div className="max-w-2xl mx-auto card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-xl flex-shrink-0 text-slate-500">↩</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 font-semibold text-sm">{tr.nav.resumeBannerTitle}</p>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{tr.nav.resumeBannerSub}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setShowConfirm(true)} className="text-slate-600 hover:text-slate-400 text-xs underline underline-offset-2 transition-colors">{tr.nav.restart}</button>
              <button onClick={handleResume} className="btn-primary text-xs py-2 px-4">{lang === 'fr' ? 'Reprendre →' : 'Resume →'}</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Comment ça fonctionne ──────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {t.howTitle}{' '}<span className="gradient-text">{t.howAccent}</span> ?
            </h2>
            <p className="text-slate-500 text-base max-w-md mx-auto">{t.howSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {t.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i]
              return (
                <div key={i} className="card p-7 relative group hover:border-white/[0.12] transition-colors duration-300">
                  <div className="absolute top-5 right-5 text-5xl font-black text-dark-700 select-none group-hover:text-dark-600 transition-colors tabular-nums">{i + 1}</div>
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-5 flex-shrink-0">
                    <StepIcon size={20} strokeWidth={1.5} className="text-violet-300" />
                  </div>
                  <h3 className="text-base font-semibold mb-2.5 text-slate-100">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Ce que vous recevez ───────────────────────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Contenu du rapport' : 'Report content'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr' ? <>Ce que tu <span className="gradient-text">reçois</span></> : <>What you <span className="gradient-text">receive</span></>}
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? 'Un rapport structuré, concret et actionnable — pas un test générique.'
                : 'A structured, concrete and actionable report — not a generic test.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {DELIVERABLES.map((d) => (
              <div key={d.fr.title} className="card p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <d.Icon size={18} strokeWidth={1.5} className="text-violet-300" />
                </div>
                <div>
                  <h4 className="text-slate-100 font-semibold text-sm mb-1">{lang === 'fr' ? d.fr.title : d.en.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{lang === 'fr' ? d.fr.desc : d.en.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trajectoire exemple ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Aperçu du rapport' : 'Report preview'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr'
                ? <>Un exemple de <span className="gradient-text">trajectoire détaillée</span></>
                : <>A <span className="gradient-text">detailed path</span> example</>}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              {lang === 'fr'
                ? 'Voici le type d\'analyse que tu retrouves dans ton rapport complet. Les résultats réels varient selon ton profil, tes réponses et ton CV.'
                : 'This is the type of analysis you\'ll find in your full report. Real results vary according to your profile, answers and CV.'}
            </p>
          </div>

          <div className="card glow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent" />

            {/* Header */}
            <div className="p-6 md:p-8 pb-0">
              <div className="flex items-center gap-2 mb-5 text-xs text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                <FileText size={13} strokeWidth={1.5} className="flex-shrink-0" />
                <span>
                  {lang === 'fr'
                    ? 'Exemple indicatif. Le rapport complet est généré selon tes réponses, ton profil et ton CV.'
                    : 'Indicative example. The full report is generated from your answers, profile and CV.'}
                </span>
              </div>

              <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-semibold text-brand-400/80 uppercase tracking-widest">
                    {lang === 'fr' ? 'Trajectoire 1 / 3 — Proche du parcours' : 'Path 1 / 3 — Close to background'}
                  </span>
                  <h3 className="text-xl font-bold mt-1.5 text-slate-100">
                    {lang === 'fr' ? 'Chargé de projet digital junior' : 'Junior Digital Project Manager'}
                  </h3>
                  <p className="text-slate-500 italic mt-1 text-sm">
                    {lang === 'fr'
                      ? 'Coordination de projets numériques pour PME et structures intermédiaires'
                      : 'Coordinating digital projects for SMEs and mid-sized organisations'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black text-brand-400">82%</div>
                  <div className="text-xs text-slate-600 mt-0.5">{lang === 'fr' ? 'Faisabilité' : 'Feasibility'}</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: lang === 'fr' ? 'Durée estimée' : 'Est. duration', value: lang === 'fr' ? '6 à 9 mois' : '6 to 9 months' },
                  { label: lang === 'fr' ? 'Salaire cible' : 'Target salary', value: '30 000 – 38 000 €/an' },
                  { label: lang === 'fr' ? 'Niveau de risque' : 'Risk level', value: lang === 'fr' ? 'Modéré' : 'Moderate' },
                  { label: lang === 'fr' ? 'Formation nécessaire' : 'Training needed', value: lang === 'fr' ? 'Courte / certifiante' : 'Short / certified' },
                  { label: lang === 'fr' ? 'Télétravail' : 'Remote work', value: lang === 'fr' ? 'Élevé' : 'High' },
                ].map(item => (
                  <div key={item.label} className="bg-dark-900/60 border border-white/[0.05] rounded-xl p-3">
                    <div className="text-xs text-slate-600 mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-200">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordions */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-3">

              {/* Description */}
              <ExSection title={lang === 'fr' ? 'Description du métier' : 'Job description'} icon={BriefcaseBusiness} defaultOpen>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    {lang === 'fr'
                      ? 'Cette trajectoire s\'adresse à une personne qui souhaite évoluer vers un métier plus dynamique, plus transversal et plus proche des projets digitaux, sans forcément repartir dans plusieurs années d\'études. Le rôle de chargé de projet digital consiste à coordonner des actions, comprendre les besoins d\'une équipe ou d\'un client, suivre l\'avancement d\'un projet et faire le lien entre différents interlocuteurs.'
                      : 'This path is for someone who wants to move towards a more dynamic, cross-functional role closer to digital projects, without necessarily returning to years of study. A digital project manager coordinates actions, understands team or client needs, tracks project progress and bridges different stakeholders.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'C\'est une fonction particulièrement intéressante pour les profils organisés, curieux, capables de communiquer clairement et prêts à monter progressivement en compétence sur les outils numériques. Elle ne demande pas nécessairement de devenir développeur, designer ou expert technique.'
                      : 'This is a particularly interesting role for organised, curious profiles able to communicate clearly and willing to progressively build digital tool skills. It doesn\'t require becoming a developer, designer or technical expert.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Elle repose plutôt sur une capacité à comprendre les enjeux d\'un projet, à structurer les étapes, à suivre les priorités et à coordonner les bonnes personnes. Pour une personne qui possède déjà une expérience professionnelle, même dans un autre domaine, certaines compétences peuvent être directement valorisées : rigueur, gestion des délais, relation client, organisation, adaptation, communication écrite et orale.'
                      : 'It relies on understanding project stakes, structuring steps, tracking priorities and coordinating the right people. For someone with professional experience, even in another field, certain skills transfer directly: rigour, deadline management, client relations, organisation, adaptability, written and oral communication.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'La transition reste réaliste parce qu\'elle peut se construire par étapes. L\'objectif n\'est pas de tout maîtriser immédiatement, mais de comprendre progressivement les bases du web, les outils collaboratifs, la gestion de projet agile, le no-code, le suivi de budget et les méthodes de coordination. Une personne motivée peut commencer par analyser des offres d\'emploi, identifier les compétences récurrentes, suivre une formation courte ciblée, puis créer un mini-projet pour prouver sa compréhension du métier.'
                      : 'The transition is realistic because it can be built step by step. The goal isn\'t to master everything immediately, but to progressively understand web basics, collaborative tools, agile project management, no-code, budget tracking and coordination methods.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Le principal risque est de rester trop théorique. Suivre une formation ne suffit pas si aucun livrable concret ne permet de prouver la compétence. Pour devenir crédible, il faut construire des preuves : un mini-portfolio, une étude de cas, une maquette de projet, un planning fictif, une documentation projet ou une démonstration d\'outil.'
                      : 'The main risk is staying too theoretical. Completing training isn\'t enough if no concrete deliverable proves competence. To become credible, you must build proof: a mini-portfolio, case study, project mockup, fictitious schedule, project documentation or tool demonstration.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Cette trajectoire est donc adaptée aux personnes qui veulent une transition progressive, concrète et orientée action. Elle est particulièrement cohérente pour des profils venant du service, de l\'administration, du commerce ou de secteurs non techniques, ayant besoin d\'une reconversion accessible et valorisante.'
                      : 'This path suits people who want a progressive, concrete, action-oriented transition. It\'s particularly coherent for profiles from service, administration, commerce or non-technical sectors needing an accessible and rewarding career change.'}
                  </p>
                </div>
              </ExSection>

              {/* Pourquoi c'est cohérent */}
              <ExSection title={lang === 'fr' ? 'Pourquoi cette trajectoire est cohérente' : 'Why this path is coherent'} icon={Target}>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(lang === 'fr' ? [
                      { label: 'Transition douce', desc: 'Cette voie ne demande pas de rupture totale. Elle s\'appuie sur des compétences déjà présentes tout en apportant une direction nouvelle.' },
                      { label: 'Accessible progressivement', desc: 'Les premiers jalons peuvent être franchis en quelques semaines, sans attendre une formation complète ou un diplôme.' },
                      { label: 'Marché actif', desc: 'Les entreprises cherchent des profils capables de piloter des projets numériques sans être développeurs. Le marché est peu saturé sur ce segment.' },
                      { label: 'Compétences valorisables', desc: 'Organisation, communication, gestion des délais et rigueur sont directement transférables — pas besoin de tout repartir de zéro.' },
                    ] : [
                      { label: 'Gentle transition', desc: 'This path doesn\'t require a total break. It builds on existing skills while providing a new and more stimulating direction.' },
                      { label: 'Progressively accessible', desc: 'First milestones can be reached within weeks, without waiting for a complete training programme or degree.' },
                      { label: 'Active market', desc: 'Companies are looking for profiles able to manage digital projects without being developers. The market is active on this segment.' },
                      { label: 'Transferable skills', desc: 'Organisation, communication, deadline management and rigour transfer directly — no need to start from scratch.' },
                    ]).map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} strokeWidth={1.5} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-200 mb-0.5">{item.label}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 pt-1 border-t border-dark-700">
                    <div className="bg-green-900/10 border border-green-800/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-400 mb-1">{lang === 'fr' ? 'Recommandé si…' : 'Recommended if…'}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'fr'
                          ? 'Tu veux changer de secteur sans repartir de zéro, et tu es à l\'aise avec les outils digitaux au quotidien.'
                          : 'You want to change sector without starting over, and you\'re comfortable with digital tools in daily life.'}
                      </p>
                    </div>
                    <div className="bg-red-900/10 border border-red-800/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-400 mb-1">{lang === 'fr' ? 'Déconseillé si…' : 'Not recommended if…'}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'fr'
                          ? 'Tu cherches un métier très technique ou artistique. Cette voie est avant tout relationnelle et organisationnelle.'
                          : 'You\'re seeking a highly technical or artistic role. This path is primarily relational and organisational.'}
                      </p>
                    </div>
                  </div>
                </div>
              </ExSection>

              {/* Compétences */}
              <ExSection title={lang === 'fr' ? 'Compétences valorisables et à développer' : 'Transferable and new skills'} icon={Brain}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 size={13} strokeWidth={1.5} />
                      {lang === 'fr' ? 'Déjà valorisables' : 'Already transferable'}
                    </p>
                    <div className="space-y-2.5">
                      {(lang === 'fr' ? [
                        { name: 'Organisation', desc: 'Utile pour suivre les étapes d\'un projet, tenir un planning et structurer les priorités.' },
                        { name: 'Communication', desc: 'Essentielle pour faire le lien entre équipes, clients, prestataires et décideurs.' },
                        { name: 'Rigueur', desc: 'Importante pour suivre les livrables, contrôler l\'avancement et éviter les oublis.' },
                        { name: 'Capacité d\'analyse', desc: 'Utile pour comprendre un besoin, reformuler une demande et proposer une solution adaptée.' },
                        { name: 'Adaptabilité', desc: 'Nécessaire pour évoluer dans des environnements digitaux qui changent vite.' },
                      ] : [
                        { name: 'Organisation', desc: 'Useful for tracking project steps, maintaining schedules and structuring priorities.' },
                        { name: 'Communication', desc: 'Essential for bridging teams, clients, contractors and decision-makers.' },
                        { name: 'Rigour', desc: 'Important for tracking deliverables, monitoring progress and avoiding oversights.' },
                        { name: 'Analytical thinking', desc: 'Useful for understanding needs, reformulating requests and proposing adapted solutions.' },
                        { name: 'Adaptability', desc: 'Needed to evolve in fast-changing digital environments.' },
                      ]).map(skill => (
                        <div key={skill.name} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{skill.name}</span>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{skill.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                      <TrendingUp size={13} strokeWidth={1.5} />
                      {lang === 'fr' ? 'À développer' : 'To develop'}
                    </p>
                    <div className="space-y-2.5">
                      {(lang === 'fr' ? [
                        { name: 'Gestion de projet agile', desc: 'Comprendre les notions de sprint, backlog, priorisation et suivi d\'avancement.' },
                        { name: 'Culture digitale', desc: 'Connaître les bases du web, du SEO, des outils collaboratifs et du no-code.' },
                        { name: 'Outils de pilotage', desc: 'Apprendre à utiliser Notion, Trello, Airtable, Asana ou équivalents.' },
                        { name: 'Suivi de budget', desc: 'Comprendre comment estimer, suivre et ajuster les ressources d\'un projet.' },
                        { name: 'Portfolio projet', desc: 'Construire une preuve concrète de compétence pour rassurer un recruteur.' },
                      ] : [
                        { name: 'Agile project management', desc: 'Understanding sprints, backlogs, prioritisation and progress tracking.' },
                        { name: 'Digital culture', desc: 'Knowing web basics, SEO, collaborative tools and no-code.' },
                        { name: 'Tracking tools', desc: 'Learning to use Notion, Trello, Airtable, Asana or equivalents.' },
                        { name: 'Budget tracking', desc: 'Understanding how to estimate, track and adjust project resources.' },
                        { name: 'Project portfolio', desc: 'Building concrete proof of competence to reassure a recruiter.' },
                      ]).map(skill => (
                        <div key={skill.name} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{skill.name}</span>
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{skill.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ExSection>

              {/* Timeline */}
              <ExSection title={lang === 'fr' ? 'Timeline de transition — 6 à 24 mois' : 'Transition timeline — 6 to 24 months'} icon={CalendarRange}>
                <div className="space-y-2">
                  {EX_TIMELINE.map((period, i) => (
                    <TimelinePeriod key={i} period={period} index={i} />
                  ))}
                </div>
              </ExSection>

              {/* Plan 30 jours */}
              <ExSection title={lang === 'fr' ? 'Plan d\'action 30 jours' : '30-day action plan'} icon={ListChecks}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(lang === 'fr' ? [
                    { week: 1, title: 'Clarification', actions: 'Analyser 10 offres junior, noter les compétences récurrentes, regarder 3 témoignages métier en ligne.', deliverable: 'Fiche de synthèse des compétences attendues sur le marché.' },
                    { week: 2, title: 'Formation ciblée', actions: 'Choisir une formation courte (Notion, gestion de projet, outils agiles), démarrer les bases avec un plan de 4 semaines.', deliverable: 'Plan de formation documenté et première ressource complétée.' },
                    { week: 3, title: 'Preuve concrète', actions: 'Créer un mini-projet documenté : planifier un projet fictif avec objectifs, étapes, livrables et planning.', deliverable: 'Document projet de 2 à 3 pages présentable à un recruteur.' },
                    { week: 4, title: 'Repositionnement', actions: 'Refaire le CV autour des compétences transférables, optimiser le profil LinkedIn avec les bons mots-clés.', deliverable: 'CV et profil LinkedIn repositionnés sur le métier cible.' },
                  ] : [
                    { week: 1, title: 'Clarification', actions: 'Analyse 10 junior job listings, note recurring skills, watch 3 career testimonials.', deliverable: 'Summary sheet of market-expected competencies.' },
                    { week: 2, title: 'Targeted training', actions: 'Choose a short course (Notion, project management, agile tools), start with a 4-week plan.', deliverable: 'Documented training plan and first resource completed.' },
                    { week: 3, title: 'Concrete proof', actions: 'Create a documented mini-project: plan a fictitious project with goals, steps, deliverables and timeline.', deliverable: '2-3 page project document presentable to a recruiter.' },
                    { week: 4, title: 'Repositioning', actions: 'Rebuild CV around transferable skills, optimise LinkedIn profile with relevant keywords.', deliverable: 'CV and LinkedIn profile repositioned on the target role.' },
                  ]).map(w => (
                    <div key={w.week} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                      <p className="text-xs font-bold text-brand-400 mb-1">{lang === 'fr' ? `Semaine ${w.week}` : `Week ${w.week}`} — {w.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{w.actions}</p>
                      <div className="text-xs bg-green-900/20 border border-green-800/30 rounded px-2 py-1.5">
                        <span className="font-semibold text-green-400">{lang === 'fr' ? 'Livrable : ' : 'Deliverable: '}</span>
                        <span className="text-slate-300">{w.deliverable}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ExSection>

              {/* Risques */}
              <ExSection title={lang === 'fr' ? 'Risques et points de vigilance' : 'Risks and watchpoints'} icon={AlertTriangle}>
                <div className="space-y-3">
                  {(lang === 'fr' ? [
                    { title: 'Rester trop théorique', desc: 'Suivre des formations sans projet concret peut rendre la reconversion peu crédible auprès des recruteurs.', solution: 'Produire rapidement un cas pratique ou un mini-projet documenté.' },
                    { title: 'Viser des postes trop seniors', desc: 'Certains intitulés de chef de projet demandent déjà plusieurs années d\'expérience dans le domaine.', solution: 'Cibler d\'abord des postes junior, assistant chef de projet ou coordinateur digital débutant.' },
                    { title: 'Sous-estimer la culture digitale', desc: 'Même sans coder, il faut comprendre les outils, les méthodes et le vocabulaire du secteur.', solution: 'Apprendre les bases du web, du no-code, du SEO et des outils collaboratifs courants.' },
                    { title: 'Mal expliquer la reconversion', desc: 'Un recruteur doit comprendre la cohérence du parcours pour ne pas percevoir le CV comme incohérent.', solution: 'Préparer un pitch clair reliant l\'expérience passée au métier cible de façon logique.' },
                  ] : [
                    { title: 'Staying too theoretical', desc: 'Completing courses without concrete projects can make the career change seem unconvincing to recruiters.', solution: 'Quickly produce a practical case study or documented mini-project.' },
                    { title: 'Targeting too senior roles', desc: 'Some project manager titles already require years of experience in the field.', solution: 'First target junior, assistant project manager or beginner digital coordinator roles.' },
                    { title: 'Underestimating digital culture', desc: 'Even without coding, you must understand tools, methods and sector vocabulary.', solution: 'Learn web basics, no-code, SEO and common collaborative tools.' },
                    { title: 'Poor explanation of career change', desc: 'A recruiter must understand the logic of your background to not perceive the CV as incoherent.', solution: 'Prepare a clear pitch connecting past experience to the target role logically.' },
                  ]).map((risk, i) => (
                    <div key={i} className="bg-dark-800/40 border border-dark-700 rounded-xl p-4">
                      <div className="flex items-start gap-2.5 mb-2">
                        <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-slate-200">{risk.title}</p>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2 ml-[22px]">{risk.desc}</p>
                      <div className="ml-[22px] text-xs bg-blue-900/15 border border-blue-800/20 rounded px-2 py-1.5">
                        <span className="font-semibold text-blue-400">{lang === 'fr' ? 'Solution : ' : 'Solution: '}</span>
                        <span className="text-slate-300">{risk.solution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ExSection>

              {/* Preuves à construire */}
              <ExSection title={lang === 'fr' ? 'Preuves à construire pour devenir crédible' : 'Proofs to build credibility'} icon={FileText}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(lang === 'fr' ? [
                    { title: 'Mini-projet documenté', desc: 'Planifier un projet fictif avec objectifs, étapes, planning et livrables — preuve directe de la compétence organisationnelle.' },
                    { title: 'Portfolio simple', desc: 'Regrouper les cas pratiques et compétences démontrées dans un document clair ou une page Notion présentable.' },
                    { title: 'Analyse de 10 offres d\'emploi', desc: 'Synthétiser les compétences récurrentes du marché — montre une compréhension réelle du métier et de ses attentes.' },
                    { title: 'Refonte du CV', desc: 'Restructurer le CV autour des compétences transférables et des missions liées à la coordination ou la gestion de projet.' },
                    { title: 'Profil LinkedIn repositionné', desc: 'Reformuler le titre et le résumé pour être visible des recruteurs cherchant des profils en transition vers ce métier.' },
                    { title: 'Entretien réseau', desc: 'Contacter 3 professionnels du secteur pour obtenir des informations terrain — développe crédibilité et ancrage réel.' },
                  ] : [
                    { title: 'Documented mini-project', desc: 'Plan a fictitious project with goals, steps, schedule and deliverables — direct proof of organisational competence.' },
                    { title: 'Simple portfolio', desc: 'Gather case studies and demonstrated skills in a clear document or presentable Notion page.' },
                    { title: 'Analysis of 10 job listings', desc: 'Synthesise recurring market skills — shows real understanding of the role and its expectations.' },
                    { title: 'CV overhaul', desc: 'Restructure the CV around transferable skills and missions related to coordination or project management.' },
                    { title: 'Repositioned LinkedIn', desc: 'Rewrite the title and summary to be visible to recruiters seeking transition profiles for this role.' },
                    { title: 'Network interview', desc: 'Contact 3 professionals in the sector for ground-level insights — builds credibility and real anchoring.' },
                  ]).map(proof => (
                    <div key={proof.title} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} strokeWidth={1.5} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 mb-0.5">{proof.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{proof.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ExSection>

              {/* Première action */}
              <div className="bg-gradient-to-r from-brand-900/40 to-purple-900/40 border border-brand-700/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} strokeWidth={1.5} className="text-brand-400" />
                  <p className="text-xs font-bold text-brand-400">
                    {lang === 'fr' ? 'Première action cette semaine' : 'First action this week'}
                  </p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {lang === 'fr'
                    ? 'Cette semaine, commence par analyser 10 offres de chargé de projet digital junior sur LinkedIn ou Indeed. Note les compétences qui reviennent le plus souvent, les outils cités, les niveaux d\'expérience demandés et les missions principales. À la fin de cette analyse, tu dois être capable d\'identifier les 5 compétences prioritaires à travailler.'
                    : 'This week, start by analysing 10 junior digital project manager listings on LinkedIn or Indeed. Note the most frequent skills, tools cited, experience levels required and main missions. At the end of this analysis, you should be able to identify the 5 priority skills to work on.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Ce que contient le rapport complet ───────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Structure du rapport' : 'Report structure'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr'
                ? <>Un rapport complet pour passer <span className="gradient-text">de l'idée à l'action</span></>
                : <>A complete report to go <span className="gradient-text">from idea to action</span></>}
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              {lang === 'fr'
                ? 'OtherMe ne se contente pas de proposer des métiers. Chaque trajectoire est expliquée, justifiée et transformée en plan d\'action concret.'
                : 'OtherMe doesn\'t just suggest careers. Each path is explained, justified and turned into a concrete action plan.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {REPORT_CONTENTS.map((item) => (
              <div key={item.title} className="card p-5 flex items-start gap-3.5 hover:border-white/[0.12] transition-colors duration-300">
                <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.Icon size={17} strokeWidth={1.5} className="text-brand-400" />
                </div>
                <div>
                  <h4 className="text-slate-100 font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OtherMe Reality Score ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Évaluation' : 'Assessment'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              OtherMe <span className="gradient-text">Reality Score</span>
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? 'OtherMe ne cherche pas seulement le métier qui te plaît. Il évalue aussi ce qui est réaliste selon ton niveau actuel, tes contraintes, ton temps disponible et le marché.'
                : 'OtherMe doesn\'t just find a career you\'ll enjoy. It evaluates what\'s realistic given your current level, constraints, available time and the market.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                label: lang === 'fr' ? 'Compatibilité personnelle' : 'Personal compatibility',
                desc: lang === 'fr' ? 'Alignement avec tes valeurs, tes motivations et ton mode de fonctionnement' : 'Alignment with your values, motivations and work style',
                pct: 88, color: 'from-violet-500 to-purple-400',
              },
              {
                label: lang === 'fr' ? 'Faisabilité réelle' : 'Real feasibility',
                desc: lang === 'fr' ? 'Accessibilité selon ton niveau actuel, ton parcours et tes ressources disponibles' : 'Accessibility given your current level, background and available resources',
                pct: 82, color: 'from-blue-500 to-indigo-400',
              },
              {
                label: lang === 'fr' ? 'Opportunité marché' : 'Market opportunity',
                desc: lang === 'fr' ? 'Dynamisme du secteur, demande actuelle et perspectives d\'évolution' : 'Sector dynamism, current demand and growth prospects',
                pct: 74, color: 'from-emerald-500 to-teal-400',
              },
              {
                label: lang === 'fr' ? 'Effort de transition' : 'Transition effort',
                desc: lang === 'fr' ? 'Estimation du temps et des ressources nécessaires pour atteindre ce métier' : 'Estimate of time and resources needed to reach this career',
                pct: 65, color: 'from-amber-500 to-orange-400',
              },
            ].map(dim => (
              <div key={dim.label} className="card p-6 hover:border-white/[0.12] transition-colors duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-slate-100 font-semibold text-sm">{dim.label}</h4>
                  <span className="text-2xl font-black text-slate-200">{dim.pct}%</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{dim.desc}</p>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${dim.color} rounded-full`}
                    style={{ width: `${dim.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi pas un simple test ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Différence' : 'What sets it apart'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr'
                ? <>Pas <span className="gradient-text">un simple test</span> d'orientation</>
                : <>Not <span className="gradient-text">just another quiz</span></>}
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? 'Les tests classiques te disent ce que tu pourrais être. OtherMe te montre comment y arriver.'
                : 'Classic tests tell you what you could be. OtherMe shows you how to get there.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_DIFFERENT.map((d) => (
              <div key={d.fr.title} className="card p-6 flex items-start gap-4 hover:border-white/[0.12] transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <d.Icon size={20} strokeWidth={1.5} className="text-brand-300" />
                </div>
                <div>
                  <h4 className="text-slate-100 font-semibold text-sm mb-1.5">{lang === 'fr' ? d.fr.title : d.en.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{lang === 'fr' ? d.fr.desc : d.en.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Encart crédibilité */}
          <div className="mt-8 card p-5 border-white/[0.05]">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              {(lang === 'fr'
                ? ['Analyse personnalisée à partir de vos réponses', 'CV optionnel pour affiner les résultats', 'Résultat généré en quelques minutes', 'Trajectoires réalistes, pas de promesses magiques']
                : ['Personalised analysis from your answers', 'Optional CV to refine results', 'Result generated in minutes', 'Realistic paths, no magic promises']
              ).map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pour qui ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Audience' : 'Who it\'s for'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr'
                ? <>Pour qui est fait <span className="gradient-text">OtherMe</span> ?</>
                : <>Who is <span className="gradient-text">OtherMe</span> for?</>}
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? 'Pour celles et ceux qui veulent changer de direction professionnelle, mais ne savent pas encore quelle voie est réaliste.'
                : 'For those who want to change career direction, but don\'t yet know which path is realistic.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOR_WHO.map((p) => (
              <div key={p.fr.title} className={`card p-5 flex items-start gap-4 hover:border-white/[0.12] transition-colors duration-300 ${p.featured ? 'border-brand-600/25 bg-brand-600/[0.04]' : ''}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${p.featured ? 'bg-brand-600/15 border border-brand-500/25' : 'bg-violet-600/10 border border-violet-500/20'}`}>
                  <p.Icon size={18} strokeWidth={1.5} className={p.featured ? 'text-brand-300' : 'text-violet-300'} />
                </div>
                <div>
                  <h4 className={`font-semibold text-sm mb-1 ${p.featured ? 'text-brand-300' : 'text-slate-100'}`}>{lang === 'fr' ? p.fr.title : p.en.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{lang === 'fr' ? p.fr.desc : p.en.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ce que ça évite ───────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Clarté' : 'Clarity'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr'
                ? <>Ce qu'OtherMe <span className="gradient-text">aide à éviter</span></>
                : <>What OtherMe <span className="gradient-text">helps you avoid</span></>}
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? 'Parce que les mauvaises décisions de carrière coûtent cher — en temps, en énergie et en confiance.'
                : 'Because bad career decisions are costly — in time, energy and confidence.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {AVOIDS.map((a) => (
              <div key={a.fr} className="card p-4 flex items-start gap-3 hover:border-white/[0.10] transition-colors duration-300">
                <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-[10px] font-bold">✕</span>
                </span>
                <p className="text-slate-400 text-sm leading-relaxed">{lang === 'fr' ? a.fr : a.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exemples de transitions ───────────────────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Trajectoires' : 'Paths'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {t.testiTitle}{' '}<span className="gradient-text">{t.testiAccent}</span>{' '}{t.testiTitle2}
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              {lang === 'fr'
                ? 'Ces exemples illustrent des transitions type. Ton rapport sera entièrement adapté à ton profil spécifique.'
                : 'These examples illustrate typical transitions. Your report will be fully tailored to your specific profile.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {t.testimonials.map((ex, i) => (
              <div key={i} className="card p-6 flex flex-col hover:border-white/[0.12] transition-colors duration-300">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400/70 uppercase tracking-wider">
                    <span className="w-3 h-px bg-brand-600/40" />
                    {lang === 'fr' ? 'Exemple' : 'Example'}
                  </span>
                </div>
                <h4 className="text-slate-100 font-bold text-sm mb-2 leading-snug">{ex.name}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{ex.text}</p>
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="text-brand-400/70 text-xs font-medium">{ex.job}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-4">
            {lang === 'fr' ? 'Prochaine étape' : 'Next step'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
            {t.ctaTitle}{' '}<span className="gradient-text">{t.ctaAccent}</span>{t.ctaTitle2}
          </h2>
          <p className="text-slate-500 mb-10 text-base leading-relaxed">{t.ctaSub}</p>
          {started ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleResume} className="btn-primary text-base py-3.5 px-10">{t.ctaResume}</button>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-3.5 px-8">{t.ctaRestart}</button>
            </div>
          ) : (
            <button onClick={handleStart} className="btn-primary text-base py-3.5 px-10">{t.ctaStart}</button>
          )}
          <p className="text-xs text-dark-500 mt-5">{t.ctaNote}</p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-dark-900/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-slate-100">
              {t.faqTitle}{' '}<span className="gradient-text">{t.faqAccent}</span>
            </h2>
          </div>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <div key={i} className="card p-6 hover:border-white/[0.10] transition-colors duration-300">
                <h3 className="font-semibold text-slate-100 text-sm mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={44} />
          <p className="text-dark-500 text-xs text-center">© {new Date().getFullYear()} OtherMe · {t.footerRights}</p>
          <div className="flex gap-6 text-xs text-dark-500">
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerPrivacy}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerTerms}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerContact}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
