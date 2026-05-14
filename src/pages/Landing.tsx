import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { hasStartedTest, clearProgress } from '../lib/onboardingStorage'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

// ── Données statiques bilingues ───────────────────────────────────────────────

const DELIVERABLES = [
  {
    icon: '🛤️',
    fr: { title: '3 trajectoires personnalisées', desc: 'Chaque voie explore un scénario différent adapté à ton profil, tes envies et ta réalité.' },
    en: { title: '3 personalised paths', desc: 'Each path explores a different scenario tailored to your profile, desires and reality.' },
  },
  {
    icon: '💼',
    fr: { title: 'Métier cible identifié', desc: 'Un poste précis avec description, environnement de travail et secteur de débouché.' },
    en: { title: 'Target job identified', desc: 'A specific role with job description, work environment and industry outlook.' },
  },
  {
    icon: '💰',
    fr: { title: 'Revenu estimé réaliste', desc: 'Fourchette salariale basée sur le marché actuel — pas sur des promesses.' },
    en: { title: 'Realistic salary estimate', desc: 'Salary range based on current market data — not wishful thinking.' },
  },
  {
    icon: '⚡',
    fr: { title: 'Niveau de risque évalué', desc: 'Pour choisir en connaissance de cause, sans te lancer à l\'aveugle.' },
    en: { title: 'Risk level assessed', desc: 'Make informed decisions without leaping blindly into the unknown.' },
  },
  {
    icon: '📅',
    fr: { title: 'Timeline 6 à 24 mois', desc: 'Jalons clairs pour visualiser concrètement chaque étape de ta transition.' },
    en: { title: 'Timeline 6 to 24 months', desc: 'Clear milestones to concretely visualise each step of your transition.' },
  },
  {
    icon: '🎯',
    fr: { title: 'Plan d\'action 30 jours', desc: 'Les premières actions concrètes à lancer dès cette semaine pour amorcer le changement.' },
    en: { title: '30-day action plan', desc: 'Concrete first actions to launch this week to kick off the change.' },
  },
  {
    icon: '🔁',
    fr: { title: 'Compétences transférables', desc: 'Ce que tu as déjà et que tu peux valoriser immédiatement dans une nouvelle voie.' },
    en: { title: 'Transferable skills', desc: 'What you already have and can leverage immediately in a new direction.' },
  },
  {
    icon: '🧠',
    fr: { title: 'Compétences à développer', desc: 'Ce que tu dois acquérir — et comment — pour réussir chaque trajectoire.' },
    en: { title: 'Skills to develop', desc: 'What you need to acquire — and how — to succeed in each path.' },
  },
  {
    icon: '🎓',
    fr: { title: 'Ressources & formations', desc: 'Des pistes concrètes pour te former sans repartir de zéro inutilement.' },
    en: { title: 'Resources & training', desc: 'Concrete leads to upskill without unnecessarily starting from scratch.' },
  },
]

const FOR_WHO = [
  {
    icon: '💼',
    featured: true,
    fr: { title: 'Jeunes actifs (25–35 ans)', desc: 'Tu travailles, mais tu te demandes si tu es vraiment au bon endroit — et tu veux changer sans repartir de zéro.' },
    en: { title: 'Young professionals (25–35)', desc: 'You\'re working but wondering if you\'re in the right place — and want to change without starting over.' },
  },
  {
    icon: '🔄',
    fr: { title: 'Profils en reconversion', desc: 'Tu sais que tu veux changer, mais tu ne sais pas encore vers quoi te diriger ni par où commencer.' },
    en: { title: 'Career changers', desc: 'You know you want to change, but haven\'t found your direction or where to start.' },
  },
  {
    icon: '😔',
    fr: { title: 'Salariés en perte de sens', desc: 'Tu fais bien ton travail, mais il ne te nourrit plus. Tu cherches à te réaligner avec ce qui compte vraiment.' },
    en: { title: 'Employees losing meaning', desc: 'You do your job well, but it no longer fulfils you. You\'re seeking realignment with what truly matters.' },
  },
  {
    icon: '🎓',
    fr: { title: 'Étudiants en questionnement', desc: 'Tu hésites entre plusieurs orientations et tu veux voir plus loin que les débouchés classiques.' },
    en: { title: 'Students at a crossroads', desc: 'Unsure between directions and want to see beyond conventional career paths.' },
  },
  {
    icon: '🎨',
    fr: { title: 'Profils créatifs', desc: 'Tes projets perso méritent peut-être d\'être ton vrai métier — OtherMe l\'explore sérieusement.' },
    en: { title: 'Creative profiles', desc: 'Your personal projects might deserve to become your real job — OtherMe explores it seriously.' },
  },
  {
    icon: '📈',
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

const WHY_DIFFERENT = [
  {
    icon: '📊',
    fr: { title: 'Analyse de ton parcours complet', desc: 'Pas un questionnaire générique. OtherMe prend en compte ton histoire, tes compétences, ton contexte et ton CV si tu le fournis.' },
    en: { title: 'Analysis of your full background', desc: 'Not a generic quiz. OtherMe takes into account your history, skills, context and CV if you provide it.' },
  },
  {
    icon: '🎯',
    fr: { title: 'Résultats vraiment personnalisés', desc: 'Deux profils similaires obtiennent des trajectoires différentes. Il n\'y a pas de réponse standard.' },
    en: { title: 'Truly personalised results', desc: 'Two similar profiles get different paths. There\'s no standard answer.' },
  },
  {
    icon: '📋',
    fr: { title: 'Un plan d\'action concret', desc: 'Chaque trajectoire inclut les premières étapes réalistes à enclencher, pas juste un titre de métier.' },
    en: { title: 'A concrete action plan', desc: 'Each path includes realistic first steps to take, not just a job title.' },
  },
  {
    icon: '🚫',
    fr: { title: 'Sans promesses magiques', desc: 'OtherMe ne remplace pas un conseiller en évolution professionnelle. Il t\'aide à clarifier tes options et à avancer avec une feuille de route structurée.' },
    en: { title: 'No magic promises', desc: 'OtherMe doesn\'t replace a career coach. It helps you clarify your options and move forward with a structured roadmap.' },
  },
]

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
        <Logo size={48} />
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

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300/90 text-xs font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400/80" />
            {t.badge}
          </div>

          {/* Titre hero */}
          <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-bold leading-[1.15] tracking-tight mb-6 text-slate-100">
            {t.heroTitle}{' '}
            <span className="gradient-text">{t.heroAccent}</span>{' '}
            {t.heroTitle2}
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
            {t.steps.map((step, i) => (
              <div key={i} className="card p-7 relative group hover:border-white/[0.12] transition-colors duration-300">
                <div className="absolute top-5 right-5 text-5xl font-black text-dark-700 select-none group-hover:text-dark-600 transition-colors tabular-nums">{i + 1}</div>
                <div className="text-3xl mb-5">{step.icon}</div>
                <h3 className="text-base font-semibold mb-2.5 text-slate-100">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
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
                <span className="text-2xl">{d.icon}</span>
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
              {lang === 'fr' ? 'Aperçu' : 'Preview'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
              {t.exTitle}{' '}<span className="gradient-text">{t.exAccent}</span>
            </h2>
            <p className="text-slate-500">{t.exSub}</p>
          </div>
          <div className="card glow relative overflow-hidden p-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
              <div>
                <span className="text-xs font-semibold text-brand-400/80 uppercase tracking-widest">{t.exTrajLabel}</span>
                <h3 className="text-xl font-bold mt-1.5 text-slate-100">{t.exTrajTitle}</h3>
                <p className="text-slate-500 italic mt-1 text-sm">{t.exTrajTagline}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-black text-brand-400">82%</div>
                <div className="text-xs text-slate-600 mt-0.5">{tr.paywall.feasibility}</div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: lang === 'fr' ? 'Durée estimée' : 'Est. duration', value: lang === 'fr' ? '6 à 9 mois' : '6 to 9 months' },
                { label: lang === 'fr' ? 'Salaire cible' : 'Target salary', value: '30k – 38k €' },
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

            {/* Description */}
            <p className="text-slate-400 leading-relaxed mb-6 text-sm">{t.exTrajDesc}</p>

            {/* Compétences */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xs font-semibold text-green-400/80 uppercase tracking-wider mb-2.5">
                  {lang === 'fr' ? 'Déjà transférables' : 'Already transferable'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.exSkills.map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-green-500/8 text-green-300/70 border border-green-500/15">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2.5">
                  {lang === 'fr' ? 'À développer' : 'To develop'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === 'fr'
                    ? ['Méthodes agiles', 'Outils digitaux', 'Suivi de budget']
                    : ['Agile methods', 'Digital tools', 'Budget tracking']
                  ).map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/8 text-amber-300/70 border border-amber-500/15">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Plan 30 jours */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-brand-400/80 uppercase tracking-wider mb-3">
                {lang === 'fr' ? 'Plan 30 jours' : '30-day plan'}
              </div>
              <div className="space-y-2">
                {(lang === 'fr' ? [
                  { week: 'Sem. 1', text: 'Clarifier le positionnement et analyser 10 offres d\'emploi ciblées' },
                  { week: 'Sem. 2', text: 'Identifier les compétences manquantes et les formations disponibles' },
                  { week: 'Sem. 3', text: 'Créer un mini-projet ou cas pratique démontrant ses capacités' },
                  { week: 'Sem. 4', text: 'Adapter le CV et préparer les premières candidatures' },
                ] : [
                  { week: 'Wk 1', text: 'Clarify positioning and analyse 10 targeted job listings' },
                  { week: 'Wk 2', text: 'Identify missing skills and available training options' },
                  { week: 'Wk 3', text: 'Create a mini-project or case study demonstrating your capabilities' },
                  { week: 'Wk 4', text: 'Update your CV and prepare first applications' },
                ]).map(item => (
                  <div key={item.week} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 text-xs font-semibold text-brand-400/70 w-12 pt-0.5">{item.week}</span>
                    <span className="text-slate-500 leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-brand-600/15 flex items-center justify-center text-brand-400 text-sm">→</div>
              <span className="text-slate-600 text-sm">{t.exMore}</span>
            </div>
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
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center text-xl flex-shrink-0">
                  {d.icon}
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
                <span className="text-2xl flex-shrink-0 mt-0.5">{p.icon}</span>
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
