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
    period: '12 à 18 mois',
    objective: 'Prendre la responsabilité d\'une feature area et développer une posture stratégique.',
    actions: 'Animer les cérémonies Agile en autonomie (sprint planning, rétro, refinement), conduire les cycles de discovery, commencer à influencer la roadmap produit trimestrielle et présenter les arbitrages à la direction.',
    deliverable: 'Ownership reconnu d\'une feature area, roadmap trimestrielle présentée à la direction, et au moins 2 fonctionnalités majeures livrées avec impact mesuré sur des KPIs business.',
    kpi: 'Être cité comme référent produit sur son périmètre par l\'équipe engineering et design, métriques d\'usage en amélioration continue sur 3 mois consécutifs.',
    vigilance: 'Éviter de rester dans l\'exécution sans développer de vision — la différence entre un bon PO et un vrai PM tient à la capacité à formuler une stratégie.',
  },
  {
    period: '18 à 36 mois',
    objective: 'Accéder à un rôle de PM Senior ou Lead PM avec impact business direct et responsabilité d\'équipe.',
    actions: 'Piloter une squad produit complète, définir la vision et la stratégie produit à 12 mois, mentorer des profils juniors, contribuer au recrutement et à la culture produit de l\'organisation.',
    deliverable: 'Une product strategy document validée par la direction, 3 fonctionnalités à fort impact livrées, et un profil reconnu dans la communauté PM avec au moins un article ou talk publié.',
    kpi: 'Atteindre 65 000 à 82 000 €/an de rémunération, et être sollicité par des recruteurs de façon entrante — signal de réputation établie.',
    vigilance: 'La montée en séniorité exige de savoir dire non avec méthode — prioriser avec rigueur et défendre ses arbitrages face à la pression commerciale ou technique.',
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

            {/* Accordions */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-3">

              {/* Description */}
              <ExSection title={lang === 'fr' ? 'Description du métier' : 'Job description'} icon={BriefcaseBusiness} defaultOpen>
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
                </div>
              </ExSection>

              {/* Pourquoi c'est cohérent */}
              <ExSection title={lang === 'fr' ? 'Pourquoi cette trajectoire est cohérente' : 'Why this path is coherent'} icon={Target}>
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

              {/* Risques */}
              <ExSection title={lang === 'fr' ? 'Risques et points de vigilance' : 'Risks and watchpoints'} icon={AlertTriangle}>
                <div className="space-y-3">
                  {(lang === 'fr' ? [
                    { title: 'Marché compétitif sans portfolio', desc: 'Les offres PM sont très courtisées. Sans case study produit solide, il est difficile de sortir du lot face à des candidats avec de l\'expérience.', solution: 'Construire un case study original sur un secteur sous-représenté, et le faire valider par 2 PMs expérimentés avant de postuler.' },
                    { title: 'Manque de légitimité initiale', desc: 'Les grandes entreprises restent souvent fermées aux profils sans expérience produit directe — même avec une certification.', solution: 'Cibler en priorité des startups early-stage (Seed à Série A) ou des scale-ups qui valorisent la diversité des parcours.' },
                    { title: 'Rôle très dépendant du contexte', desc: 'Le PM en startup de 15 personnes n\'a rien à voir avec le PM dans un grand groupe. Le premier rôle détermine toute la suite de la trajectoire.', solution: 'Bien cibler dès le départ le type d\'entreprise (startup, scale-up, ETI, corporate) dans lequel on veut évoluer.' },
                    { title: 'Glissement vers l\'exécution pure', desc: 'Sans vision claire et sans développer la posture stratégique, le PM risque de devenir un PO exécutant sans réelle influence sur la direction produit.', solution: 'Se former dès le début aux frameworks de discovery et de stratégie produit (Reforge, Shape Up, Continuous Discovery Habits).' },
                  ] : [
                    { title: 'Competitive market without a portfolio', desc: 'PM roles are highly contested. Without a solid product case study, it\'s hard to stand out against candidates with direct experience.', solution: 'Build an original case study on an under-represented sector, validated by 2 experienced PMs before applying.' },
                    { title: 'Initial legitimacy gap', desc: 'Large companies often remain closed to profiles without direct product experience — even with certifications.', solution: 'Prioritise early-stage startups (Seed to Series A) or scale-ups that value diverse backgrounds.' },
                    { title: 'Role highly context-dependent', desc: 'A PM at a 15-person startup has nothing in common with a PM at a large corporation. The first role determines your entire trajectory.', solution: 'Define from the start which type of company (startup, scale-up, SME, corporate) you want to grow in.' },
                    { title: 'Sliding into pure execution', desc: 'Without a clear vision and strategic posture, the PM risks becoming a PO executing without real influence on product direction.', solution: 'Learn discovery and product strategy frameworks from the start (Reforge, Shape Up, Continuous Discovery Habits).' },
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
                    { title: 'Case study produit (10–15 slides)', desc: 'Analyse d\'un problème utilisateur réel, proposition de solution, roadmap priorisée et métriques de succès définies. Preuve centrale de la capacité à raisonner en product management.' },
                    { title: '5 user interviews documentées', desc: 'Interviews structurées selon le framework Jobs-to-be-Done, avec synthèse et insights actionnables. Prouve la capacité à conduire la discovery sans biais.' },
                    { title: 'Roadmap fictive avec priorisation RICE', desc: 'Backlog de features priorisées avec justification claire de chaque arbitrage. Démontre la rigueur méthodologique et la capacité à décider sous contraintes.' },
                    { title: 'Certification CSPO ou Product School', desc: 'Certification reconnue qui légitime le changement de posture vers le product management — attendue par la majorité des recruteurs.' },
                    { title: 'Profil LinkedIn repositionné PM', desc: 'Titre, résumé et expériences reformulés avec les mots-clés produit (discovery, backlog, roadmap, Agile) pour apparaître dans les recherches recruteur.' },
                    { title: '2–3 articles LinkedIn PM', desc: 'Publications courtes sur le product management (retour sur un teardown, analyse d\'un feature, insight discovery) — développe la visibilité et la crédibilité communautaire.' },
                  ] : [
                    { title: 'Product case study (10–15 slides)', desc: 'Analysis of a real user problem, solution proposal, prioritised roadmap and defined success metrics. The central proof of product management thinking ability.' },
                    { title: '5 documented user interviews', desc: 'Structured interviews using the Jobs-to-be-Done framework, with synthesis and actionable insights. Proves the ability to conduct unbiased discovery.' },
                    { title: 'Fictitious roadmap with RICE prioritisation', desc: 'Feature backlog with clear justification for each trade-off. Demonstrates methodological rigour and ability to decide under constraints.' },
                    { title: 'CSPO or Product School certification', desc: 'Recognised certification that legitimises the shift to product management — expected by the majority of recruiters.' },
                    { title: 'Repositioned PM LinkedIn profile', desc: 'Title, summary and experiences reformulated with product keywords (discovery, backlog, roadmap, Agile) to appear in recruiter searches.' },
                    { title: '2–3 PM LinkedIn articles', desc: 'Short posts on product management (teardown review, feature analysis, discovery insight) — builds community visibility and credibility.' },
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
                    ? 'Cette semaine, télécharge une application que tu utilises (ou qui t\'intéresse) et réalise un product teardown en 30 minutes : identifie 3 problèmes utilisateurs concrets, propose 2 solutions possibles et justifie tes choix en 5 bullet points. Publie ce travail sur LinkedIn avec le hashtag #productmanagement. C\'est ton premier signal de crédibilité — et la base de ton futur case study.'
                    : 'This week, download an app you use (or that interests you) and do a 30-minute product teardown: identify 3 concrete user problems, propose 2 possible solutions and justify your choices in 5 bullet points. Post this work on LinkedIn with #productmanagement. It\'s your first credibility signal — and the foundation of your future case study.'}
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
