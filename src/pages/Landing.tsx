import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const TESTIMONIALS = [
  {
    name: 'Camille R.',
    job: 'Comptable, 34 ans',
    text: "J'avais toujours rêvé de faire autre chose mais je ne savais pas quoi. OtherMe m'a ouvert les yeux sur 3 trajectoires réalistes. J'ai commencé à me former en UX Design.",
    stars: 5,
  },
  {
    name: 'Thomas M.',
    job: 'Développeur, 28 ans',
    text: "Le rapport est bluffant de précision. Il a capté mes valeurs et m'a suggéré une voie entrepreneuriale que j'explore sérieusement.",
    stars: 5,
  },
  {
    name: 'Sophie L.',
    job: 'Infirmière, 41 ans',
    text: "Je pensais qu'il était trop tard pour changer. OtherMe m'a prouvé le contraire avec un plan concret sur 3 ans. Je ne m'attendais pas à un résultat aussi personnalisé.",
    stars: 5,
  },
]

const STEPS = [
  {
    icon: '📋',
    title: 'Tu remplis le formulaire',
    desc: "5 minutes pour décrire ton parcours, tes aspirations et tes atouts. Un CV optionnel pour enrichir l'analyse.",
  },
  {
    icon: '🤖',
    title: "L'IA analyse ton profil",
    desc: "Notre IA entraînée sur des milliers de trajectoires de carrière analyse tes données et identifie tes potentiels cachés.",
  },
  {
    icon: '✨',
    title: 'Tu découvres tes autres vies',
    desc: '3 trajectoires de vie alternatives personnalisées, avec plan d\'action, compétences à développer et score de faisabilité.',
  },
]

const FAQS = [
  {
    q: "À qui s'adresse OtherMe ?",
    a: "À toute personne qui se demande si elle a fait les bons choix, qui cherche un changement de cap, ou qui veut simplement explorer son potentiel inexploité.",
  },
  {
    q: 'Les trajectoires sont-elles vraiment personnalisées ?',
    a: "Oui. L'IA utilise GPT-4o et analyse chaque détail de ton profil : ton parcours, tes valeurs, tes atouts et tes rêves. Deux profils identiques n'auront jamais le même rapport.",
  },
  {
    q: 'Puis-je faire plusieurs analyses ?',
    a: "Oui ! Avec ton abonnement, tu peux générer autant d'analyses que tu veux, à tout moment. Refais-en une après une formation, un changement de situation, ou simplement pour explorer de nouvelles pistes.",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Tes données sont chiffrées et ne sont jamais revendues. Elles sont utilisées uniquement pour générer ton rapport.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
        <Logo size={32} />
        <button
          onClick={() => navigate('/onboarding')}
          className="btn-primary text-sm py-2 px-5"
        >
          Commencer
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        {/* Glow bg */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-700/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-900/20 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            Propulsé par GPT-4o
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Et si tu avais{' '}
            <span className="gradient-text">choisi une autre vie&nbsp;?</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            OtherMe analyse ton parcours et génère <strong className="text-slate-200">3 trajectoires de vie alternatives</strong>{' '}
            que tu aurais pu vivre — ou que tu peux encore emprunter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/onboarding')}
              className="btn-primary text-base py-4 px-8 text-lg w-full sm:w-auto"
            >
              Découvrir mes autres vies →
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400">★★★★★</span>
              4.9/5
            </span>
            <span>·</span>
            <span>+2 400 rapports générés</span>
            <span>·</span>
            <span>⚡ Résultat en 30 sec</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça <span className="gradient-text">fonctionne</span> ?
            </h2>
            <p className="text-slate-400 text-lg">Simple. Rapide. Transformateur.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="card p-8 relative group hover:border-brand-700 transition-colors duration-300">
                <div className="text-4xl mb-5">{step.icon}</div>
                <div className="absolute top-6 right-6 text-6xl font-black text-dark-700 group-hover:text-dark-600 transition-colors">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-100">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example trajectory preview */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Un exemple de <span className="gradient-text">trajectoire</span>
            </h2>
            <p className="text-slate-400">Extrait d'un vrai rapport OtherMe</p>
          </div>

          <div className="card p-8 glow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 rounded-t-2xl" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Trajectoire #1</span>
                <h3 className="text-2xl font-bold mt-1">Consultant en Transformation Digitale</h3>
                <p className="text-slate-400 italic mt-1 text-sm">"Mettre ton expertise au service des entreprises qui en ont besoin"</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-brand-400">82%</div>
                <div className="text-xs text-slate-500">Faisabilité</div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed mb-6 text-sm">
              Fort de tes 7 ans d'expérience dans la tech et de ta capacité d'analyse hors du commun,
              tu peux naturellement pivoter vers le conseil. Les entreprises PME et ETI cherchent
              exactement ce profil hybride : quelqu'un qui comprend à la fois la technique et le business.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {['Gestion de projet', 'Communication', 'Leadership'].map((skill) => (
                <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-brand-600/15 text-brand-300 border border-brand-600/20 text-center">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-dark-700">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-sm">→</div>
              <span className="text-slate-500 text-sm">2 autres trajectoires personnalisées dans ton rapport complet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils ont <span className="gradient-text">découvert</span> leurs autres vies
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6 hover:border-brand-800 transition-colors duration-300">
                <div className="flex mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-slate-200 text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.job}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-dark-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à <span className="gradient-text">te découvrir</span> ?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Réponds à quelques questions et laisse l'IA révéler tes autres vies possibles.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary text-base py-4 px-10 text-lg"
          >
            Commencer maintenant →
          </button>
          <p className="text-sm text-slate-600 mt-4">⚡ Résultat personnalisé en moins de 30 secondes</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions <span className="gradient-text">fréquentes</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-semibold text-slate-100 mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={30} />
          <p className="text-slate-600 text-sm text-center">
            © {new Date().getFullYear()} OtherMe · Tous droits réservés
          </p>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-slate-400 transition-colors">CGV</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
