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
import AnimatedLifePathsBackground from '../components/AnimatedLifePathsBackground'
import OtherMeStoryShowcase from '../components/OtherMeStoryShowcase'
import OtherMeFeatureTabs from '../components/OtherMeFeatureTabs'
import Reveal from '../components/Reveal'
import { hasStartedTest, clearProgress } from '../lib/onboardingStorage'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

// ── Données statiques bilingues ───────────────────────────────────────────────

type IconComponent = React.ComponentType<LucideProps>

const DELIVERABLES: Array<{ Icon: IconComponent; fr: { title: string; desc: string }; en: { title: string; desc: string } }> = [
  {
    Icon: Route,
    fr: { title: '3 trajectoires personnalisées', desc: 'Trois voies professionnelles distinctes adaptées à ton profil : une proche de ton parcours actuel, une progressive alignée sur tes envies, une plus ambitieuse.' },
    en: { title: '3 personalised paths', desc: 'Three distinct professional directions tailored to your profile: one close to your current background, one progressively aligned with your interests, one more ambitious.' },
  },
  {
    Icon: BarChart3,
    fr: { title: 'OtherMe Reality Score', desc: 'Évaluation multi-dimensionnelle de chaque trajectoire : compatibilité personnelle, faisabilité réelle, opportunité marché et effort de transition — pour choisir en connaissance de cause.' },
    en: { title: 'OtherMe Reality Score', desc: 'Multi-dimensional assessment of each path: personal compatibility, real feasibility, market opportunity and transition effort — to make informed decisions.' },
  },
  {
    Icon: ListChecks,
    fr: { title: 'Plan d\'action 30 jours', desc: 'Des actions concrètes semaine par semaine pour ne pas rester bloqué dans la réflexion. Chaque semaine inclut un objectif précis, un livrable attendu et un conseil pratique.' },
    en: { title: '30-day action plan', desc: 'Concrete actions week by week to avoid getting stuck in reflection. Each week includes a precise objective, an expected deliverable and a practical tip.' },
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

// Step icons for "Comment ça fonctionne ?" (indexed 0-3, matches t.steps order)
const STEP_ICONS: IconComponent[] = [ClipboardList, FileText, ScanSearch, Route]

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
    period: '30 jours',
    objective: 'Comprendre précisément ce qu\'est le métier de Product Manager et valider l\'adéquation avec son profil.',
    actions: 'Analyser 15 offres PM sur LinkedIn, Welcome to the Jungle et Otta, lire les fiches métier de Product School et de Reforge, regarder 5 témoignages de PMs en reconversion, identifier 3 entreprises cibles réalistes.',
    deliverable: 'Une fiche de synthèse des compétences attendues, des outils incontournables et des écarts à combler — avec une décision claire : continuer ou pivoter.',
    kpi: 'Pouvoir expliquer la différence entre PM, PO et chef de projet en 3 minutes, et nommer 5 outils produit courants avec leur usage.',
    vigilance: 'Ne pas confondre le rôle de PM en startup early-stage et PM en grande entreprise — les attentes et la culture sont radicalement différentes.',
  },
  {
    period: '1 à 3 mois',
    objective: 'Acquérir les fondamentaux du product management et une première certification reconnue.',
    actions: 'Suivre le cursus CSPO (Certified Scrum Product Owner) ou Product School, apprendre les bases de la discovery produit (interviews utilisateurs, jobs-to-be-done), s\'initier à Jira, Linear et Figma basics.',
    deliverable: 'Certification CSPO obtenue et 5 interviews utilisateurs documentées selon le framework Jobs-to-be-Done, avec insights actionnables.',
    kpi: 'Maîtriser le vocabulaire produit (backlog, épic, sprint, KPI d\'activation), être capable de rédiger une user story complète et défendable.',
    vigilance: 'La certification seule ne suffit pas — il faut l\'accompagner d\'une pratique terrain immédiate pour ne pas rester dans l\'abstraction.',
  },
  {
    period: '3 à 6 mois',
    objective: 'Construire un portfolio produit crédible pour devenir candidatable.',
    actions: 'Réaliser une étude de cas produit complète (product teardown d\'une app du secteur cible), produire une roadmap fictive avec priorisation RICE, créer un document de discovery structuré avec insights et recommandations.',
    deliverable: 'Un case study produit de 10 à 15 slides présentant un problème utilisateur, une solution, une roadmap priorisée et des métriques de succès définies — validé par 2 PMs expérimentés.',
    kpi: 'Recevoir des retours positifs sur le case study et être capable de défendre ses choix de priorisation sous pression en entretien simulé.',
    vigilance: 'Un case study sur une app trop connue (Spotify, Airbnb) manque d\'originalité — choisir un secteur ou un problème moins traité pour se démarquer.',
  },
  {
    period: '6 à 12 mois',
    objective: 'Décrocher un premier rôle PM, Associate PM ou PO et livrer une première fonctionnalité en production.',
    actions: 'Postuler à des offres d\'Associate PM ou PM en startup early-stage, préparer les entretiens produit (product sense, estimation, design sprint), activer son réseau LinkedIn et participer aux événements PM (Product At Heart, Lean Product Meetup).',
    deliverable: 'Première offre signée, avec une fonctionnalité livrée en production et documentée avec son impact mesuré dans le portfolio.',
    kpi: 'Avoir livré un feature en production avec un impact mesurable (taux d\'activation, NPS, temps sur tâche) et être capable de le présenter avec données.',
    vigilance: 'Ne pas surestimer la cible : un poste d\'Associate PM dans une équipe structurée avec un mentor vaut mieux qu\'un PM solo sans cadre ni feedback.',
  },
  {
    period: '12 à 24 mois',
    objective: 'Prendre la responsabilité d\'une feature area et développer une posture stratégique.',
    actions: 'Animer les cérémonies Agile en autonomie (sprint planning, rétro, refinement), conduire les cycles de discovery, commencer à influencer la roadmap produit trimestrielle et présenter les arbitrages à la direction.',
    deliverable: 'Ownership reconnu d\'une feature area, roadmap trimestrielle présentée à la direction, et au moins 2 fonctionnalités majeures livrées avec impact mesuré sur des KPIs business.',
    kpi: 'Être cité comme référent produit sur son périmètre par l\'équipe engineering et design, métriques d\'usage en amélioration continue sur 3 mois consécutifs.',
    vigilance: 'Éviter de rester dans l\'exécution sans développer de vision — la différence entre un bon PO et un vrai PM tient à la capacité à formuler une stratégie.',
  },
  {
    period: '2 à 3 ans',
    objective: 'Prendre la responsabilité d\'une feature area complète et développer une posture stratégique.',
    actions: 'Animer les cérémonies Agile en pleine autonomie (sprint planning, rétro, refinement), conduire les cycles de discovery de manière indépendante, présenter les arbitrages de roadmap à la direction et influencer la stratégie produit.',
    deliverable: 'Ownership reconnu d\'une feature area avec roadmap trimestrielle validée par la direction et 2 fonctionnalités majeures livrées avec impact mesuré.',
    kpi: 'Être cité comme référent produit sur son périmètre par l\'équipe engineering, métriques d\'usage en amélioration continue sur 3 mois.',
    vigilance: 'Éviter de rester dans l\'exécution sans développer de vision — la différence entre un bon PO et un vrai PM tient à la capacité à formuler une stratégie.',
  },
  {
    period: '3 à 5 ans',
    objective: 'Accéder à un rôle de PM Senior ou Lead PM avec impact business direct et responsabilité d\'équipe.',
    actions: 'Piloter une squad produit complète, définir la vision et la stratégie produit à 12 mois, mentorer des profils juniors, contribuer au recrutement et à la culture produit de l\'organisation.',
    deliverable: 'Une product strategy document validée par la direction, 3 fonctionnalités à fort impact livrées, et un profil reconnu dans la communauté PM avec au moins un article ou talk publié.',
    kpi: 'Atteindre 65 000 à 82 000 €/an de rémunération, et être sollicité par des recruteurs de façon entrante — signal de réputation établie.',
    vigilance: 'La montée en séniorité exige de savoir dire non avec méthode — prioriser avec rigueur et défendre ses arbitrages face à la pression commerciale ou technique.',
  },
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
  const dotColors = ['bg-violet-500', 'bg-blue-500', 'bg-indigo-500', 'bg-teal-500', 'bg-green-500', 'bg-emerald-500', 'bg-cyan-500']
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
  const [heroParallax, setHeroParallax] = useState(0)

  useEffect(() => { setStarted(hasStartedTest()) }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const onScroll = () => {
      if (window.innerWidth < 1024) return
      setHeroParallax(Math.min(window.scrollY * 0.055, 36))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleStart          = () => navigate('/onboarding')
  const handleResume         = () => navigate('/onboarding')
  const handleConfirmRestart = () => {
    clearProgress(); setStarted(false); setShowConfirm(false); navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-dark-950">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-dark-950/75 backdrop-blur-xl border-b border-white/[0.06]">
        <Logo size={52} />
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

      {/* ── Hero — image plein écran en fond ──────────────────────── */}
      <section className="relative min-h-screen overflow-hidden bg-dark-950">

        {/* ── Image de fond ─────────────────────────────────────────── */}
        {/* Outer : parallax — dépasse de 60px en haut/bas pour éviter les gaps */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            top: '-60px',
            bottom: '-60px',
            transform: heroParallax ? `translateY(-${heroParallax}px)` : undefined,
          }}
        >
          {/* Inner : zoom-in au chargement (séparé du parallax) */}
          <div className="absolute inset-0 hero-bg-zoom">
            <img
              src="/hero-otherme.png"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-right"
              style={{ filter: 'brightness(1.18) contrast(1.04) saturate(1.10)' }}
            />
          </div>
        </div>

        {/* ── Overlays de lisibilité ─────────────────────────────────── */}
        {/* Couverture sombre globale — 0.30 → 0.20 */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        {/* Gradient gauche — zone texte préservée, centre allégé */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(5,5,9,0.85) 0%, rgba(5,5,9,0.45) 35%, rgba(5,5,9,0.08) 60%, transparent 88%)' }}
        />
        {/* Fondu bas — fusion avec la section suivante */}
        <div className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #050509 0%, rgba(5,5,9,0.50) 50%, transparent 100%)' }}
        />
        {/* Fondu haut — fusion avec la navbar */}
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(5,5,9,0.38) 0%, transparent 100%)' }}
        />

        {/* ── Layers atmosphériques ─────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.08 }}>
          <AnimatedLifePathsBackground />
        </div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 700px 550px at 22% 58%, rgba(109,40,217,0.12) 0%, transparent 70%)' }}
        />

        {/* ── Contenu superposé à gauche ────────────────────────────── */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 sm:px-10 lg:px-16 xl:px-24 pt-28 pb-16">
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-2xl">

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300/90 text-xs font-medium mb-8 tracking-wide animate-slide-up-hero"
                style={{ animationDelay: '0ms' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400/80" />
                {t.badge}
              </div>

              {/* Titre hero */}
              <h1
                className="font-bold tracking-tight mb-7 animate-slide-up-hero"
                style={{ animationDelay: '80ms' }}
              >
                <span className="block text-white text-[2.5rem] sm:text-[3.2rem] md:text-[3.8rem] lg:text-[4.2rem] xl:text-[4.6rem] leading-[1.12]">
                  {t.heroTitle}
                </span>
                <span className="block gradient-text text-[2.1rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[3.9rem] leading-[1.20]">
                  {t.heroAccent}
                </span>
                <span className="block gradient-text text-[2.1rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[3.9rem] leading-[1.20]">
                  {t.heroTitle2}
                </span>
              </h1>

              {/* Sous-titre */}
              <p
                className="text-[1.05rem] text-slate-300/80 mb-10 max-w-md leading-relaxed animate-slide-up-hero"
                style={{ animationDelay: '190ms' }}
                dangerouslySetInnerHTML={{ __html: t.heroSub }}
              />

              {/* CTA */}
              <div
                className="animate-slide-up-hero"
                style={{ animationDelay: '280ms' }}
              >
                {started ? (
                  <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                    <button onClick={handleResume} className="btn-primary text-base py-3.5 px-9 w-full sm:w-auto">{t.ctaResume}</button>
                    <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto">{t.ctaRestart}</button>
                  </div>
                ) : (
                  <div className="mb-10">
                    <button onClick={handleStart} className="btn-primary text-base py-3.5 px-9">{t.heroCta}</button>
                  </div>
                )}
              </div>

              {/* Microcopy */}
              <div
                className="flex items-center gap-3 sm:gap-5 text-xs text-slate-500 flex-wrap animate-slide-up-hero"
                style={{ animationDelay: '370ms' }}
              >
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500/60" />{t.statRating}</span>
                <span className="hidden sm:block w-px h-3 bg-dark-700" />
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-violet-500/60" />{t.statReports}</span>
                <span className="hidden sm:block w-px h-3 bg-dark-700" />
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-500/60" />{t.statSpeed}</span>
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="flex justify-center text-dark-600 animate-bounce">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

      {/* ── Signature showcase: OtherMe story ────────────────────── */}
      <OtherMeStoryShowcase lang={lang} />

      {/* ── Feature tabs: Analyser/Révéler/Comparer/Planifier/Agir ── */}
      <OtherMeFeatureTabs lang={lang} />

      {/* ── Proof bandeau ─────────────────────────────────────────── */}
      <section className="py-10 px-4 border-y border-white/[0.05] bg-dark-800/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-0">
            {t.proofItems.map((item, i) => (
              <div key={i} className="text-center px-8 md:px-12 py-2 relative">
                {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-white/[0.06]" />}
                <div className="text-2xl sm:text-3xl font-black gradient-text tracking-tight">{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça fonctionne ──────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">Processus</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-100">
              {t.howTitle}{' '}<span className="gradient-text">{t.howAccent}</span> ?
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{t.howSub}</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i]
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="card p-5 relative group hover:border-white/[0.12] hover:shadow-[0_0_30px_rgba(109,40,217,0.07)] transition-all duration-300 h-full">
                    <div className="absolute top-4 right-4 text-4xl font-black text-dark-700 select-none group-hover:text-dark-600 transition-colors tabular-nums">{i + 1}</div>
                    <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-3 flex-shrink-0 group-hover:border-violet-500/35 transition-colors duration-300">
                      <StepIcon size={18} strokeWidth={1.5} className="text-violet-300" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1.5 text-slate-100">{step.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Ce que tu découvres ───────────────────────────────────── */}
      <section className="py-10 px-4 bg-dark-900/60">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Les 3 trajectoires' : 'The 3 paths'}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
              {t.pathTypesTitle}{' '}<span className="gradient-text">{t.pathTypesAccent}</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {t.pathTypes.map((pt, i) => {
              const colorMap: Record<string, { bg: string; border: string; badge: string; dot: string; glow: string; num: string }> = {
                emerald: {
                  bg: 'bg-gradient-to-br from-emerald-950/60 to-dark-800',
                  border: 'border-emerald-500/25',
                  badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                  dot: 'bg-emerald-400',
                  glow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.08)]',
                  num: 'text-emerald-800/50',
                },
                violet: {
                  bg: 'bg-gradient-to-br from-violet-950/60 to-dark-800',
                  border: 'border-violet-500/30',
                  badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
                  dot: 'bg-violet-400',
                  glow: 'hover:shadow-[0_0_40px_rgba(124,58,237,0.10)]',
                  num: 'text-violet-800/50',
                },
                amber: {
                  bg: 'bg-gradient-to-br from-amber-950/60 to-dark-800',
                  border: 'border-amber-500/25',
                  badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                  dot: 'bg-amber-400',
                  glow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.08)]',
                  num: 'text-amber-800/50',
                },
              }
              const c = colorMap[pt.color] ?? colorMap.violet
              return (
                <Reveal key={i} delay={i * 90}>
                  <div className={`relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden ${c.border} ${c.bg} ${c.glow}`}>
                    {/* Background number */}
                    <div className={`absolute top-3 right-4 text-5xl font-black select-none ${c.num}`}>{String(i + 1).padStart(2, '0')}</div>
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-3 ${c.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {pt.label}
                    </div>
                    <h3 className="text-slate-100 font-bold text-base mb-1.5 leading-snug">{pt.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{pt.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pas un simple test d'orientation ──────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
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
          </Reveal>

          {/* Comparison table */}
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden mb-8">
            <div className="grid grid-cols-3 border-b border-white/[0.07]">
              <div className="p-4 bg-dark-800/60" />
              <div className="p-4 bg-dark-800/60 border-l border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.compTitle}</span>
              </div>
              <div className="p-4 bg-violet-900/20 border-l border-violet-500/20">
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">{t.compOtherme}</span>
              </div>
            </div>
            {t.compRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm ${i < t.compRows.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="p-4 text-slate-400 font-medium text-xs bg-dark-800/30">{row.label}</div>
                <div className="p-4 text-slate-600 border-l border-white/[0.05] bg-dark-800/20 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 text-[9px] font-bold">✕</span>
                  </span>
                  <span className="text-xs">{row.classic}</span>
                </div>
                <div className="p-4 border-l border-violet-500/15 bg-violet-900/10 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-[9px] font-bold">✓</span>
                  </span>
                  <span className="text-xs text-slate-200">{row.otherme}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ce qu'OtherMe aide à éviter — bande compacte */}
          <div className="card p-5 border-white/[0.05] mb-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-4">
              {lang === 'fr' ? 'Ce qu\'OtherMe aide à éviter' : 'What OtherMe helps you avoid'}
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {AVOIDS.slice(0, 4).map((a) => (
                <div key={a.fr} className="flex items-start gap-2.5 text-xs text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-[9px] font-bold">✕</span>
                  </span>
                  {lang === 'fr' ? a.fr : a.en}
                </div>
              ))}
            </div>
          </div>

          {/* Credibility band */}
          <div className="card p-4 border-white/[0.05]">
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

      {/* ── Ce que tu obtiens ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-dark-900/60">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Livrable' : 'What you get'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {lang === 'fr' ? <>Ce que tu <span className="gradient-text">obtiens</span></> : <>What you <span className="gradient-text">get</span></>}
            </h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto">
              {lang === 'fr'
                ? '3 trajectoires personnalisées, un Reality Score multi-dimensionnel et un plan d\'action concret — pas un test générique.'
                : '3 personalised paths, a multi-dimensional Reality Score and a concrete action plan — not a generic test.'}
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {DELIVERABLES.map((d) => (
              <div key={d.fr.title} className="card p-6 flex flex-col gap-4 hover:border-white/[0.12] transition-colors duration-300">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <d.Icon size={20} strokeWidth={1.5} className="text-violet-300" />
                </div>
                <div>
                  <h4 className="text-slate-100 font-semibold text-sm mb-1.5">{lang === 'fr' ? d.fr.title : d.en.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{lang === 'fr' ? d.fr.desc : d.en.desc}</p>
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
                    ? 'Exemple illustratif. Les résultats réels sont générés selon vos réponses, votre profil et votre CV.'
                    : 'Illustrative example. Real results are generated from your answers, profile and CV.'}
                </span>
              </div>

              <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-semibold text-brand-400/80 uppercase tracking-widest">
                    {lang === 'fr' ? 'Trajectoire 2 / 3 — Fort potentiel' : 'Path 2 / 3 — High potential'}
                  </span>
                  <h3 className="text-xl font-bold mt-1.5 text-slate-100">
                    {lang === 'fr' ? 'Product Manager — Solutions SaaS B2B' : 'Product Manager — B2B SaaS Solutions'}
                  </h3>
                  <p className="text-slate-500 italic mt-1 text-sm">
                    {lang === 'fr'
                      ? 'Pilotage produit numérique pour startups en croissance et entreprises en transformation'
                      : 'Digital product management for growing startups and companies in transformation'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-black text-brand-400">79%</div>
                  <div className="text-xs text-slate-600 mt-0.5">{lang === 'fr' ? 'Faisabilité' : 'Feasibility'}</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: lang === 'fr' ? 'Durée estimée' : 'Est. duration', value: lang === 'fr' ? '12 à 18 mois' : '12 to 18 months' },
                  { label: lang === 'fr' ? 'Salaire cible' : 'Target salary', value: '55 000 – 80 000 €/an' },
                  { label: lang === 'fr' ? 'Niveau de risque' : 'Risk level', value: lang === 'fr' ? 'Modéré' : 'Moderate' },
                  { label: lang === 'fr' ? 'Formation nécessaire' : 'Training needed', value: lang === 'fr' ? 'Certifiante (CSPO)' : 'Certified (CSPO)' },
                  { label: lang === 'fr' ? 'Télétravail' : 'Remote work', value: lang === 'fr' ? 'Très élevé' : 'Very high' },
                ].map(item => (
                  <div key={item.label} className="bg-dark-900/60 border border-white/[0.05] rounded-xl p-3">
                    <div className="text-xs text-slate-600 mb-1">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-200">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* OtherMe Reality Score */}
            <div className="px-6 md:px-8 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 mb-2">OtherMe Reality Score</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700 mb-4">
                {([
                  { label: lang === 'fr' ? 'Compatibilité personnelle' : 'Personal compatibility', score: 88, color: 'bg-violet-500' },
                  { label: lang === 'fr' ? 'Faisabilité réelle' : 'Real feasibility',               score: 82, color: 'bg-blue-500' },
                  { label: lang === 'fr' ? 'Opportunité marché' : 'Market opportunity',             score: 74, color: 'bg-emerald-500' },
                  { label: lang === 'fr' ? 'Effort de transition' : 'Transition effort',            score: 65, color: 'bg-amber-500' },
                ] as { label: string; score: number; color: string }[]).map(s => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{s.label}</span>
                      <span className="text-slate-200 font-semibold">{s.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Key insight */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-blue-300 mb-1">💡 {lang === 'fr' ? 'Insight clé' : 'Key insight'}</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {lang === 'fr'
                    ? 'Le PM n\'a pas besoin d\'être développeur — il a besoin de comprendre les problèmes mieux que quiconque. Les profils issus de secteurs non-tech apportent souvent une perspective terrain unique, et dans les startups B2B, c\'est précisément ce que les ingénieurs qui deviennent PM n\'ont pas.'
                    : 'The PM doesn\'t need to be a developer — they need to understand problems better than anyone. Profiles from non-tech sectors often bring unique ground-level insight, and in B2B startups, that\'s precisely what engineers-turned-PMs often lack.'}
                </p>
              </div>
            </div>

            {/* Accordions */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-3">

              {/* 1. Description complète */}
              <ExSection title={lang === 'fr' ? 'Description complète' : 'Full description'} icon={BriefcaseBusiness} defaultOpen>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    {lang === 'fr'
                      ? 'Le Product Manager est l\'un des métiers les plus recherchés et les mieux rémunérés du secteur tech. Il est responsable de la vision, de la stratégie et de l\'exécution d\'un produit numérique — de la compréhension des besoins utilisateurs jusqu\'à la livraison des fonctionnalités en production. Ce n\'est pas un métier technique : il ne code pas et ne design pas. Il comprend, priorise, aligne et décide.'
                      : 'The Product Manager is one of the most sought-after and well-paid roles in the tech sector. They are responsible for the vision, strategy and execution of a digital product — from understanding user needs to delivering features in production. This is not a technical role: they don\'t code or design. They understand, prioritise, align and decide.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Au quotidien, le PM fait le lien entre trois univers : les utilisateurs (dont il comprend les besoins réels grâce à des interviews structurées), l\'équipe engineering (avec qui il définit ce qui doit être construit et dans quel ordre), et le business (en s\'assurant que chaque décision produit contribue à des métriques clés : rétention, activation, revenu). C\'est un rôle transversal, stratégique et à forte responsabilité.'
                      : 'Day-to-day, the PM bridges three worlds: users (whose real needs they understand through structured interviews), the engineering team (with whom they define what to build and in what order), and the business (ensuring every product decision contributes to key metrics: retention, activation, revenue). It\'s a cross-functional, strategic, high-responsibility role.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Ce qui rend cette trajectoire accessible à des profils en reconversion, c\'est que le PM n\'a pas besoin d\'être développeur. Il a besoin d\'être analytique, curieux, capable d\'écouter sans biais, et à l\'aise avec l\'ambiguïté. Des personnes venant du conseil, du commerce, du marketing ou même de secteurs non-tech réussissent fréquemment cette transition — parce qu\'elles apportent une compréhension terrain et une capacité de communication que les profils purement techniques n\'ont pas toujours.'
                      : 'What makes this path accessible to career changers is that the PM doesn\'t need to be a developer. They need to be analytical, curious, able to listen without bias, and comfortable with ambiguity. People from consulting, sales, marketing or even non-tech sectors frequently succeed in this transition — because they bring a ground-level understanding and communication skills that purely technical profiles don\'t always have.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'La transition vers le product management se structure en deux temps : d\'abord la crédibilisation par la certification et le portfolio (3 à 6 mois), puis l\'entrée sur le marché via des postes d\'Associate PM ou PO en startup (6 à 12 mois). Le premier rôle est décisif — c\'est lui qui détermine la vitesse de montée en séniorité. Un Associate PM dans une structure bien organisée, avec un lead PM pour le mentorer, progressera beaucoup plus vite qu\'un PM solo dans une startup sans process.'
                      : 'The transition to product management is structured in two phases: first building credibility through certification and portfolio (3 to 6 months), then entering the market via Associate PM or PO roles in startups (6 to 12 months). The first role is decisive — it determines the speed of advancement. An Associate PM in a well-organised structure, with a lead PM to mentor them, will progress much faster than a solo PM in a startup without processes.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'La rémunération évolue vite dans ce métier. Un Associate PM démarre souvent entre 42 000 et 52 000 €/an. À 18 mois d\'expérience, un PM confirmé atteint 55 000 à 70 000 €. Un PM Senior dans une scale-up ou une grande tech company dépasse régulièrement les 80 000 à 100 000 €. C\'est l\'une des rares trajectoires où la progression salariale est directement liée à la progression de compétences — et non à l\'ancienneté.'
                      : 'Compensation evolves quickly in this role. An Associate PM often starts at €42,000–52,000/year. After 18 months of experience, a confirmed PM reaches €55,000–70,000. A Senior PM at a scale-up or major tech company regularly exceeds €80,000–100,000. It\'s one of the rare career paths where salary progression is directly tied to skill progression — not seniority.'}
                  </p>
                  <p>
                    {lang === 'fr'
                      ? 'Cette trajectoire est particulièrement adaptée aux personnes qui aiment comprendre les problèmes en profondeur, qui sont à l\'aise avec les données, qui savent naviguer entre des interlocuteurs techniques et non-techniques, et qui veulent un impact visible et mesurable sur un produit concret. Elle exige en revanche une vraie tolérance à l\'ambiguïté et à la prise de décision sous incertitude.'
                      : 'This path is particularly suited to people who enjoy understanding problems in depth, are comfortable with data, can navigate between technical and non-technical stakeholders, and want a visible, measurable impact on a concrete product. It does require a genuine tolerance for ambiguity and decision-making under uncertainty.'}
                  </p>
                  <div className="mt-4 bg-dark-800/60 border border-dark-600 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-1.5">🗓️ {lang === 'fr' ? 'Journée type réaliste' : 'Realistic typical day'}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {lang === 'fr'
                        ? '9h : daily standup de 15 min avec l\'équipe engineering et design. 9h30 : session discovery — review des interviews utilisateurs, identification des patterns comportementaux. 11h : co-rédaction des user stories pour le sprint suivant avec le lead dev. 14h : sync avec les sales sur les retours terrain des dernières démos. 15h30 : analyse des métriques d\'activation sur Amplitude — identification des points de friction dans l\'onboarding. 17h : rédaction du weekly update produit pour la direction. Rythme type sur la semaine : 2 à 3 sessions de discovery, 1 sprint planning, 1 rétro, 2 à 3 syncs cross-fonctionnels.'
                        : '9am: 15-min daily standup with engineering and design. 9:30am: discovery session — user interview review, identify behavioural patterns. 11am: co-write user stories for next sprint with lead dev. 2pm: sync with sales on field feedback from last demos. 3:30pm: analyse activation metrics on Amplitude — identify onboarding friction points. 5pm: write weekly product update for leadership. Typical week rhythm: 2–3 discovery sessions, 1 sprint planning, 1 retro, 2–3 cross-functional syncs.'}
                    </p>
                  </div>
                </div>
              </ExSection>

              {/* 2. Pourquoi cette trajectoire te correspond */}
              <ExSection title={lang === 'fr' ? 'Pourquoi cette trajectoire te correspond' : 'Why this path suits you'} icon={Target}>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(lang === 'fr' ? [
                      { label: 'Profil transversal valorisé', desc: 'Le PM n\'est pas un expert technique. Il comprend les enjeux business, utilisateurs et techniques — accessible à des profils issus de trajectoires très variées.' },
                      { label: 'Marché en tension structurelle', desc: 'Les entreprises tech, startups et directions innovation cherchent des PMs à tous niveaux. La demande dépasse largement l\'offre de profils formés.' },
                      { label: 'Rémunération attractive dès le premier rôle', desc: 'Même en Associate PM, la rémunération dépasse rapidement les 45 000 €/an, avec un potentiel de 75 000 à 95 000 € à 4–5 ans d\'expérience.' },
                      { label: 'Reconversion valorisée dans le secteur', desc: 'Les PMs issus d\'autres secteurs apportent une perspective terrain rare. Les startups le reconnaissent et le recherchent activement.' },
                    ] : [
                      { label: 'Transversal profile valued', desc: 'The PM is not a technical expert. They understand business, user and technical stakes — accessible to profiles from very varied backgrounds.' },
                      { label: 'Structurally tense market', desc: 'Tech companies, startups and innovation departments seek PMs at all levels. Demand far exceeds the supply of trained profiles.' },
                      { label: 'Attractive compensation from the first role', desc: 'Even as an Associate PM, compensation quickly exceeds €45,000/year, with a potential of €75,000–95,000 at 4–5 years of experience.' },
                      { label: 'Career change valued in the sector', desc: 'PMs from other sectors bring rare ground-level perspective. Startups recognise and actively seek this.' },
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
                          ? 'Tu as un esprit analytique, tu aimes comprendre les besoins des utilisateurs et tu te projettes dans un environnement startup ou tech dynamique.'
                          : 'You have an analytical mind, enjoy understanding user needs and see yourself in a dynamic startup or tech environment.'}
                      </p>
                    </div>
                    <div className="bg-red-900/10 border border-red-800/20 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-400 mb-1">{lang === 'fr' ? 'Déconseillé si…' : 'Not recommended if…'}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lang === 'fr'
                          ? 'Tu préfères un rôle opérationnel avec des tâches répétitives et mesurables à court terme. Le PM vit dans l\'ambiguïté permanente.'
                          : 'You prefer an operational role with repetitive, short-term measurable tasks. The PM lives in permanent ambiguity.'}
                      </p>
                    </div>
                  </div>
                </div>
              </ExSection>

              {/* 3. Comment atteindre ce métier */}
              <ExSection title={lang === 'fr' ? 'Comment atteindre ce métier concrètement' : 'How to reach this role concretely'} icon={Compass}>
                <div className="space-y-5">
                  {/* Starting point */}
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-2">
                      {lang === 'fr' ? '✅ Point de départ — ce que tu as déjà' : '✅ Starting point — what you already have'}
                    </p>
                    <ul className="space-y-1.5">
                      {(lang === 'fr' ? [
                        'Expérience professionnelle transférable — tu comprends les organisations, les décideurs et les enjeux business : c\'est exactement ce que les recruteurs PM cherchent chez les reconversions',
                        'Sens analytique et structuré — ta capacité à structurer un problème complexe et à synthétiser des données est directement utilisable dans le rôle de PM',
                        'Réseau professionnel existant — tes contacts actuels (collègues, clients, partenaires) sont tes premiers ambassadeurs dans la communauté product',
                      ] : [
                        'Transferable professional experience — you understand organisations, decision-makers and business stakes: exactly what PM recruiters look for in career changers',
                        'Analytical and structured thinking — your ability to structure complex problems and synthesise data is directly applicable in a PM role',
                        'Existing professional network — your current contacts (colleagues, clients, partners) are your first ambassadors in the product community',
                      ]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-green-900/10 border border-green-800/20 rounded-lg px-3 py-2">
                          <span className="text-green-500 flex-shrink-0 mt-0.5">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Gap to fill */}
                  <div>
                    <p className="text-xs font-semibold text-amber-400 mb-2">
                      {lang === 'fr' ? '⚡ Écart à combler' : '⚡ Gap to fill'}
                    </p>
                    <ul className="space-y-1.5">
                      {(lang === 'fr' ? [
                        'Vocabulaire et pratiques produit — maîtriser user stories, sprint planning, backlog, métriques SaaS (2 à 4 semaines via Formation Product Management sur Reforge ou PM School)',
                        'Portfolio de cas produit — construire 2 à 3 études de cas concrètes montrant ta capacité à prioriser et décider (4 à 6 semaines de travail)',
                        'Réseau product spécifique — rejoindre des communautés PM (Product Alliance, CTO Craft, La Communauté PM) pour sortir de ton réseau actuel',
                      ] : [
                        'Product vocabulary and practices — master user stories, sprint planning, backlog, SaaS metrics (2 to 4 weeks via Reforge or PM School)',
                        'Product case portfolio — build 2 to 3 concrete case studies showing your ability to prioritise and decide (4 to 6 weeks of work)',
                        'Specific product network — join PM communities (Product Alliance, La Communauté PM) to expand beyond your current network',
                      ]).map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-amber-900/10 border border-amber-800/20 rounded-lg px-3 py-2">
                          <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Recommended path */}
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-2">
                      {lang === 'fr' ? '🛤️ Chemin recommandé' : '🛤️ Recommended path'}
                    </p>
                    <ol className="space-y-1.5">
                      {(lang === 'fr' ? [
                        'Semaine 1 à 3 — Suivre une formation certifiante PM (Reforge, PM School ou formation RNCP Bac+5) et compléter le vocabulaire de base',
                        'Semaine 3 à 8 — Construire 2 études de cas produit à partir de ta propre expérience et les publier sur LinkedIn',
                        'Mois 2 à 4 — Candidater à des postes d\'Associate PM ou PO dans des startups Series A ou B',
                        'Mois 4 à 9 — Décrocher le premier rôle PM et se faire mentorer par un lead PM expérimenté',
                        'Mois 9 à 24 — Monter en séniorité, prendre en charge une squad complète et viser PM confirmé',
                      ] : [
                        'Week 1 to 3 — Complete a PM certification course (Reforge, PM School) and build core vocabulary',
                        'Week 3 to 8 — Build 2 product case studies from your own experience and publish on LinkedIn',
                        'Month 2 to 4 — Apply for Associate PM or PO roles at Series A or B startups',
                        'Month 4 to 9 — Land the first PM role and get mentored by an experienced lead PM',
                        'Month 9 to 24 — Advance in seniority, own a full squad and aim for confirmed PM title',
                      ]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          {r}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {/* Priority actions */}
                  <div className="bg-brand-900/20 border border-brand-800/40 rounded-xl p-4">
                    <p className="text-xs font-semibold text-brand-300 mb-3">
                      {lang === 'fr' ? '🎯 5 actions prioritaires' : '🎯 5 priority actions'}
                    </p>
                    <ul className="space-y-2">
                      {(lang === 'fr' ? [
                        '1. Créer un compte sur Reforge ou PM School et commencer le module d\'introduction PM (1h) → impact attendu : maîtrise des concepts de base et crédibilité immédiate',
                        '2. Analyser 3 apps que tu utilises quotidiennement comme un PM (30 min chacune) → impact attendu : développer le réflexe de pensée produit',
                        '3. Rejoindre la communauté Slack "La Communauté PM" et se présenter dans le canal #introductions (15 min) → impact attendu : premier réseau PM actif',
                        '4. Rédiger le résumé d\'un cas produit basé sur ton expérience passée (2h) → impact attendu : première preuve de compétence PM publiable',
                        '5. Contacter 3 PMs sur LinkedIn pour un échange de 20 min sur leur quotidien (1h) → impact attendu : vision réaliste du métier et premières recommandations',
                      ] : [
                        '1. Create an account on Reforge or PM School and start the PM intro module (1h) → expected impact: master core concepts and immediate credibility',
                        '2. Analyse 3 apps you use daily from a PM perspective (30 min each) → expected impact: develop the product thinking reflex',
                        '3. Join the "La Communauté PM" Slack and introduce yourself in #introductions (15 min) → expected impact: first active PM network',
                        '4. Write a product case study summary based on your past experience (2h) → expected impact: first publishable PM competency proof',
                        '5. Contact 3 PMs on LinkedIn for a 20-min chat about their daily work (1h) → expected impact: realistic view of the role and first recommendations',
                      ]).map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-200">
                          <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mistakes to avoid */}
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">
                      {lang === 'fr' ? '🚫 Erreurs à éviter' : '🚫 Mistakes to avoid'}
                    </p>
                    <ul className="space-y-1.5">
                      {(lang === 'fr' ? [
                        'Erreur 1 : Postuler comme PM sans portfolio ni cas produit — Pourquoi ça bloque : sans preuve concrète, le CV est rejeté au premier filtre — Alternative : construire 2 cas produit avant de postuler',
                        'Erreur 2 : Viser directement des postes de PM Senior en grande entreprise — Pourquoi ça bloque : sans expérience PM, ces postes sont inaccessibles — Alternative : cibler des postes Associate PM ou PO en startup où la courbe d\'apprentissage est plus rapide',
                        'Erreur 3 : Sous-estimer la dimension technique du rôle — Pourquoi ça bloque : les PMs qui ne comprennent pas les contraintes techniques perdent la confiance de leur équipe engineering — Alternative : apprendre les bases du cycle de développement (sprints, API, dette technique)',
                      ] : [
                        'Mistake 1: Applying as a PM without portfolio or product cases — Why it blocks: without concrete proof, the CV is rejected at the first filter — Alternative: build 2 product case studies before applying',
                        'Mistake 2: Directly targeting Senior PM roles at large companies — Why it blocks: without PM experience, these roles are inaccessible — Alternative: target Associate PM or PO roles at startups where the learning curve is faster',
                        'Mistake 3: Underestimating the technical dimension of the role — Why it blocks: PMs who don\'t understand technical constraints lose their engineering team\'s trust — Alternative: learn the basics of the development cycle (sprints, API, technical debt)',
                      ]).map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-red-900/10 border border-red-800/20 rounded-lg px-3 py-2">
                          <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ExSection>

              {/* 4. Compétences */}
              <ExSection title={lang === 'fr' ? 'Compétences valorisables et à développer' : 'Transferable and new skills'} icon={Brain}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 size={13} strokeWidth={1.5} />
                      {lang === 'fr' ? 'Déjà valorisables' : 'Already transferable'}
                    </p>
                    <div className="space-y-2.5">
                      {(lang === 'fr' ? [
                        { name: 'Sens de l\'écoute active', desc: 'Indispensable pour conduire des interviews utilisateurs et comprendre les vrais problèmes — pas les fonctionnalités déclarées.' },
                        { name: 'Communication structurée', desc: 'Permet d\'aligner équipe technique, designers, sales et direction sur une vision produit commune sans friction.' },
                        { name: 'Rigueur analytique', desc: 'Utile pour lire des données, identifier des patterns comportementaux et justifier chaque arbitrage de priorisation.' },
                        { name: 'Sens du business', desc: 'Permet de comprendre l\'impact de chaque décision produit sur les métriques clés : revenu, rétention, acquisition.' },
                        { name: 'Gestion des parties prenantes', desc: 'Capacité à naviguer entre des demandes contradictoires et à défendre des arbitrages fondés sur les données.' },
                      ] : [
                        { name: 'Active listening', desc: 'Essential for conducting user interviews and understanding real problems — not just stated feature requests.' },
                        { name: 'Structured communication', desc: 'Allows aligning engineering, design, sales and leadership on a shared product vision without friction.' },
                        { name: 'Analytical rigour', desc: 'Useful for reading data, identifying behavioural patterns and justifying every prioritisation decision.' },
                        { name: 'Business sense', desc: 'Understanding the impact of each product decision on key metrics: revenue, retention, acquisition.' },
                        { name: 'Stakeholder management', desc: 'Navigating contradictory demands and defending data-driven trade-offs.' },
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
                        { name: 'Discovery produit', desc: 'Maîtriser les interviews utilisateurs, le framework Jobs-to-be-Done et les tests d\'hypothèses pour construire des features utiles.' },
                        { name: 'Priorisation et roadmap', desc: 'Apprendre les méthodes RICE, ICE, MoSCoW et construire une roadmap défendable face à la direction et aux équipes.' },
                        { name: 'Outils produit', desc: 'Jira ou Linear (backlog), Figma (bases de lecture de maquettes), Amplitude ou Mixpanel (analytics comportemental).' },
                        { name: 'Métriques SaaS', desc: 'Comprendre et piloter le NPS, le churn, le taux d\'activation, la LTV et le funnel d\'acquisition utilisateur.' },
                        { name: 'Agile / Scrum', desc: 'Maîtriser les cérémonies (sprint planning, daily, rétro, review) et le rôle du Product Owner dans l\'équipe engineering.' },
                      ] : [
                        { name: 'Product discovery', desc: 'Mastering user interviews, Jobs-to-be-Done framework and hypothesis testing to build genuinely useful features.' },
                        { name: 'Prioritisation and roadmap', desc: 'Learning RICE, ICE, MoSCoW methods and building a defensible roadmap for leadership and teams.' },
                        { name: 'Product tools', desc: 'Jira or Linear (backlog), Figma (basic wireframe reading), Amplitude or Mixpanel (behavioural analytics).' },
                        { name: 'SaaS metrics', desc: 'Understanding and tracking NPS, churn, activation rate, LTV and the user acquisition funnel.' },
                        { name: 'Agile / Scrum', desc: 'Mastering ceremonies (sprint planning, daily, retro, review) and the Product Owner role within the engineering team.' },
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

              {/* 5. Timeline sur 5 ans */}
              <ExSection title={lang === 'fr' ? 'Timeline sur 5 ans' : '5-year timeline'} icon={CalendarRange}>
                <div className="space-y-2">
                  {EX_TIMELINE.map((period, i) => (
                    <TimelinePeriod key={i} period={period} index={i} />
                  ))}
                </div>
              </ExSection>

              {/* 6. Plan 30 jours */}
              <ExSection title={lang === 'fr' ? 'Plan d\'action 30 jours' : '30-day action plan'} icon={ListChecks}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(lang === 'fr' ? [
                    { week: 1, title: 'Benchmark marché', actions: 'Analyser 15 offres PM sur LinkedIn et Otta, noter les outils et compétences récurrents, lire les fiches métier de Reforge et de Product School.', deliverable: 'Tableau comparatif des 10 compétences les plus demandées sur le marché PM en France.' },
                    { week: 2, title: 'Immersion produit', actions: 'Lire "Inspired" de Marty Cagan (ou résumé), regarder 5 talks de PMs sur YouTube, rejoindre 2 communautés PM (Slack PM France, Product Hunt).', deliverable: 'Note de 1 page sur ce qui t\'a le plus interpellé et les doutes à lever sur le métier.' },
                    { week: 3, title: 'Première preuve', actions: 'Réaliser un product teardown de 30 minutes sur une app que tu utilises : identifier 3 problèmes utilisateurs et proposer 2 solutions documentées.', deliverable: 'Document de 1 à 2 pages publié sur LinkedIn avec le hashtag #productmanagement.' },
                    { week: 4, title: 'Plan de formation', actions: 'Choisir une certification (CSPO ou Product School), définir un plan d\'apprentissage sur 3 mois, contacter 3 PMs pour des échanges de 20 minutes.', deliverable: 'Calendrier de formation documenté et 2 échanges réseau confirmés.' },
                  ] : [
                    { week: 1, title: 'Market benchmark', actions: 'Analyse 15 PM listings on LinkedIn and Otta, note recurring tools and skills, read role guides from Reforge and Product School.', deliverable: 'Comparative table of the 10 most requested skills in the French PM market.' },
                    { week: 2, title: 'Product immersion', actions: 'Read "Inspired" by Marty Cagan (or summary), watch 5 PM talks on YouTube, join 2 PM communities (Slack PM France, Product Hunt).', deliverable: '1-page note on the most striking insights and open questions about the role.' },
                    { week: 3, title: 'First proof', actions: 'Do a 30-minute product teardown of an app you use: identify 3 user problems and propose 2 documented solutions.', deliverable: '1-2 page document published on LinkedIn with #productmanagement hashtag.' },
                    { week: 4, title: 'Training plan', actions: 'Choose a certification (CSPO or Product School), define a 3-month learning plan, contact 3 PMs for 20-minute conversations.', deliverable: 'Documented training calendar and 2 confirmed network conversations.' },
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

              {/* 7. Cette semaine — actions concrètes */}
              <ExSection title={lang === 'fr' ? 'Cette semaine — actions concrètes' : 'This week — concrete actions'} icon={Zap}>
                <ul className="space-y-2 mb-4">
                  {(lang === 'fr' ? [
                    'Analyser 10 offres PM sur LinkedIn et Otta (2h) — noter les 5 compétences et outils les plus demandés dans les JDs',
                    'Faire un product teardown de 30 minutes sur une app mobile que tu utilises quotidiennement — identifier 3 problèmes et 2 solutions possibles',
                    'Rejoindre Slack PM France et Product Hunt — se présenter dans les channels dédiés aux reconversions en 3 phrases',
                    'Contacter 2 PMs sur LinkedIn pour un échange de 20 minutes — les trouver via le hashtag #productmanager en reconversion',
                  ] : [
                    'Analyse 10 PM listings on LinkedIn and Otta (2h) — note the 5 most requested skills and tools in JDs',
                    'Do a 30-minute product teardown of a mobile app you use daily — identify 3 problems and 2 possible solutions',
                    'Join Slack PM France and Product Hunt — introduce yourself in career-change channels in 3 sentences',
                    'Contact 2 PMs on LinkedIn for a 20-minute chat — find them via the #productmanager career change hashtag',
                  ]).map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2">
                      <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span> {a}
                    </li>
                  ))}
                </ul>
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-400 mb-1">🎯 {lang === 'fr' ? 'Mini-projet à lancer cette semaine' : 'Mini-project to launch this week'}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {lang === 'fr'
                      ? 'Réaliser un product teardown complet sur une app de ton secteur actuel : identifier 3 problèmes utilisateurs concrets avec leurs impacts mesurables, proposer 2 solutions avec des wireframes sur papier ou Figma basics. Publier le résultat en 5 slides sur LinkedIn avec le hashtag #productmanagement. C\'est simultanément ta première preuve de portfolio et ton signal d\'entrée dans la communauté PM.'
                      : 'Complete a product teardown on an app from your current sector: identify 3 concrete user problems with measurable impacts, propose 2 solutions with paper or Figma wireframes. Post the result as 5 slides on LinkedIn with #productmanagement. It\'s simultaneously your first portfolio proof and your entry signal into the PM community.'}
                  </p>
                </div>
              </ExSection>

              {/* 10. Métiers proches à explorer */}
              <ExSection title={lang === 'fr' ? 'Métiers proches à explorer' : 'Related careers to explore'} icon={Route}>
                <div className="flex flex-wrap gap-2">
                  {(lang === 'fr' ? [
                    'Product Owner en équipe Agile — rôle très proche, centré sur l\'exécution et le backlog',
                    'Associate PM — poste d\'entrée conçu pour les reconversions PM',
                    'Growth Product Manager — variante orientée acquisition et activation',
                    'Product Analyst — tremplin pour profils très analytics vers le PM',
                    'UX Researcher → PM — transition naturelle pour profils compréhension utilisateur',
                  ] : [
                    'Product Owner in Agile team — very similar role, execution and backlog focused',
                    'Associate PM — entry-level role designed for PM career changers',
                    'Growth Product Manager — acquisition and activation-oriented variant',
                    'Product Analyst — stepping stone for highly analytical profiles to PM',
                    'UX Researcher → PM — natural transition for user-understanding profiles',
                  ]).map((j, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-dark-700 border border-dark-600 text-slate-300">{j}</span>
                  ))}
                </div>
              </ExSection>

              {/* 12. Pourquoi cette voie plutôt qu'une autre ? */}
              <ExSection title={lang === 'fr' ? 'Pourquoi cette voie plutôt qu\'une autre ?' : 'Why this path over others?'} icon={ArrowRightLeft}>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {lang === 'fr'
                    ? 'Le Product Manager — Solutions SaaS B2B est le meilleur choix pour un profil cherchant un rôle à fort potentiel d\'impact et une rémunération attractive dans un marché en tension structurelle. Cette trajectoire est recommandée si tu as un sens analytique développé et si tu te projettes dans des environnements tech dynamiques avec une vision à 12–18 mois minimum. Elle est déconseillée si tu as besoin de revenus stables dans les 3 prochains mois — la transition vers le premier rôle PM nécessite 6 à 12 mois de préparation active. Par rapport à une trajectoire plus proche du parcours actuel, elle offre un potentiel de progression salariale beaucoup plus fort à 3–5 ans. Par rapport à une trajectoire indépendante ou entrepreneuriale, elle offre une structure d\'apprentissage et un encadrement plus lisible sur le marché du travail.'
                    : 'Product Manager — B2B SaaS Solutions is the best choice for a profile seeking a high-impact role with attractive compensation in a structurally tense market. This path is recommended if you have a developed analytical sense and can project yourself into dynamic tech environments with a minimum 12–18 month horizon. It\'s not recommended if you need stable income in the next 3 months — transitioning to the first PM role requires 6 to 12 months of active preparation. Compared to a path closer to your current background, it offers much stronger salary growth potential at 3–5 years. Compared to an independent or entrepreneurial path, it offers a clearer learning structure and more legible market progression.'}
                </p>
              </ExSection>

              {/* 14. Questions à poser à un PM */}
              <ExSection title={lang === 'fr' ? 'Questions à poser à un PM lors d\'un échange réseau' : 'Questions to ask a PM during a networking call'} icon={Lightbulb}>
                <p className="text-xs text-slate-500 mb-3 italic">
                  {lang === 'fr'
                    ? 'Ces questions t\'aideront à valider la trajectoire et à dépasser le discours officiel sur le métier.'
                    : 'These questions will help you validate the path and go beyond the official narrative about the role.'}
                </p>
                <div className="space-y-2">
                  {(lang === 'fr' ? [
                    { q: 'Comment se passe réellement une semaine type ? Qu\'est-ce qui prend le plus de temps — et que tu n\'aurais pas anticipé ?', why: 'Permet de détecter si le quotidien correspond à ce que l\'on imagine ou s\'il est dominé par des réunions et de la politique interne.' },
                    { q: 'Si tu devais reconseiller ton entrée dans le métier, qu\'est-ce que tu ferais différemment ?', why: 'Révèle les vraies erreurs des débutants — pas celles des livres, celles du terrain.' },
                    { q: 'Quel est le profil de PM qui réussit le mieux dans ton entreprise — et celui qui échoue ?', why: 'Permet d\'identifier les softs skills réellement valorisés vs ceux mis en avant dans les JDs.' },
                    { q: 'Comment as-tu décroché ton premier poste PM, et qu\'est-ce qui t\'a fait sortir du lot ?', why: 'Renseigne sur les vraies stratégies d\'accès au marché — réseau, portfolio, certification — avec les nuances du terrain.' },
                    { q: 'À quel moment as-tu senti que tu devenais vraiment PM — et pas juste PO exécutant ?', why: 'Aide à comprendre la distinction réelle entre Product Owner et Product Manager, et les étapes de maturité du rôle.' },
                  ] : [
                    { q: 'What does a typical week actually look like? What takes the most time — and what didn\'t you anticipate?', why: 'Helps detect if day-to-day reality matches expectations or is dominated by meetings and internal politics.' },
                    { q: 'If you could advise yourself at the start, what would you do differently?', why: 'Reveals real beginner mistakes — not from books, but from the field.' },
                    { q: 'What type of PM succeeds most in your company — and who fails?', why: 'Identifies the soft skills that are actually valued vs. those highlighted in job descriptions.' },
                    { q: 'How did you land your first PM role, and what made you stand out?', why: 'Informs on real market entry strategies — network, portfolio, certification — with real-world nuance.' },
                    { q: 'When did you feel you were really becoming a PM — and not just an executing PO?', why: 'Helps understand the real distinction between Product Owner and Product Manager, and the maturity stages of the role.' },
                  ]).map((item, i) => (
                    <div key={i} className="bg-dark-800/40 border border-dark-700 rounded-xl p-3.5">
                      <div className="flex items-start gap-2.5 mb-1.5">
                        <span className="text-purple-400 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-sm text-slate-200 font-medium leading-snug">{item.q}</p>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed ml-[18px] italic">→ {item.why}</p>
                    </div>
                  ))}
                </div>
              </ExSection>

              {/* 16. Première action — dans les 48h */}
              <div className="bg-gradient-to-r from-brand-900/40 to-purple-900/40 border border-brand-700/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} strokeWidth={1.5} className="text-brand-400" />
                  <p className="text-xs font-bold text-brand-400">
                    {lang === 'fr' ? 'Première action — dans les 48 prochaines heures' : 'First action — in the next 48 hours'}
                  </p>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {lang === 'fr'
                    ? 'Dans les 48 prochaines heures, télécharge une application que tu utilises (ou qui t\'intéresse) et réalise un product teardown en 30 minutes : identifie 3 problèmes utilisateurs concrets, propose 2 solutions possibles et justifie tes choix en 5 bullet points. Publie ce travail sur LinkedIn avec le hashtag #productmanagement. C\'est ton premier signal de crédibilité — et la base de ton futur case study.'
                    : 'In the next 48 hours, download an app you use (or that interests you) and do a 30-minute product teardown: identify 3 concrete user problems, propose 2 possible solutions and justify your choices in 5 bullet points. Post this work on LinkedIn with #productmanagement. It\'s your first credibility signal — and the foundation of your future case study.'}
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
          <Reveal className="text-center mb-16">
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
          </Reveal>
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
          <Reveal className="text-center mb-16">
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
          </Reveal>
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
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-3">
              {lang === 'fr' ? 'Trajectoires' : 'Paths'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {t.testiTitle}{' '}<span className="gradient-text">{t.testiAccent}</span>{t.testiTitle2 ? <>{' '}{t.testiTitle2}</> : null}
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {t.testimonials.map((ex, i) => (
              <div key={i} className="bg-dark-800 border border-white/[0.07] rounded-2xl p-6 flex flex-col hover:border-white/[0.14] hover:shadow-[0_0_30px_rgba(124,58,237,0.06)] transition-all duration-300">
                {/* Profile header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center ring-2 ring-violet-500/20">
                      <span className="text-white font-bold text-base">{ex.name[0]}</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-800" />
                  </div>
                  <div>
                    <div className="text-slate-100 font-semibold text-sm">{ex.name}, {ex.age} {lang === 'fr' ? 'ans' : 'yo'}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{lang === 'fr' ? 'Profil illustratif' : 'Illustrative profile'}</div>
                  </div>
                </div>
                {/* Transition arrow */}
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-dark-900/60 border border-white/[0.05]">
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-500 text-[11px] mb-0.5">{lang === 'fr' ? 'Avant' : 'Before'}</div>
                    <div className="text-slate-300 text-xs font-medium truncate">{ex.from}</div>
                  </div>
                  <div className="text-brand-400 px-1 flex-shrink-0 mt-3">→</div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-brand-400/80 text-[11px] mb-0.5">{lang === 'fr' ? 'Après' : 'After'}</div>
                    <div className="text-brand-300 text-xs font-semibold truncate">{ex.to}</div>
                  </div>
                </div>
                {/* Quote */}
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">
                  <span className="text-violet-400/60 text-lg leading-none font-serif mr-1">"</span>{ex.text}<span className="text-violet-400/60 text-lg leading-none font-serif ml-1">"</span>
                </p>
                {/* Footer */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {ex.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-violet-600/10 border border-violet-500/15 text-violet-300/80 text-[10px] font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="text-slate-600 text-[10px] whitespace-nowrap flex-shrink-0">{ex.duration}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-xs mt-8">{t.testiDisclaimer}</p>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────── */}
      <section className="relative py-36 px-4 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/cta-otherme.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.38) saturate(0.70)' }}
          />
          {/* Global dark overlay */}
          <div className="absolute inset-0" style={{ background: 'rgba(5,5,9,0.62)' }} />
          {/* Violet radial accent */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(109,40,217,0.18) 0%, transparent 70%)' }} />
          {/* Top + bottom fades */}
          <div className="absolute inset-x-0 top-0 h-32" style={{ background: 'linear-gradient(to bottom, #050509 0%, transparent 100%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: 'linear-gradient(to top, #050509 0%, transparent 100%)' }} />
        </div>

        <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-400 mb-4">
            {lang === 'fr' ? 'Prochaine étape' : 'Next step'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
            {t.ctaTitle}{' '}<span className="gradient-text">{t.ctaAccent}</span>{t.ctaTitle2}
          </h2>
          <p className="text-slate-400 mb-10 text-base leading-relaxed">{t.ctaSub}</p>
          {started ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleResume} className="btn-primary text-base py-3.5 px-10">{t.ctaResume}</button>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-3.5 px-8">{t.ctaRestart}</button>
            </div>
          ) : (
            <button onClick={handleStart} className="btn-primary text-base py-3.5 px-10">{t.ctaStart}</button>
          )}
          <p className="text-xs text-dark-500 mt-5">{t.ctaNote}</p>
        </Reveal>
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
