import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import LanguageToggle from '../components/LanguageToggle'
import { hasStartedTest, clearProgress } from '../lib/onboardingStorage'
import { useLanguage } from '../contexts/LanguageContext'
import { useTr } from '../lib/i18n/translations'

export default function Landing() {
  const navigate = useNavigate()
  const { lang }  = useLanguage()
  const tr        = useTr(lang)
  const t         = tr.landing

  const [started, setStarted]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => { setStarted(hasStartedTest()) }, [])

  const handleStart  = () => navigate('/onboarding')
  const handleResume = () => navigate('/onboarding')
  const handleConfirmRestart = () => {
    clearProgress(); setStarted(false); setShowConfirm(false); navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
        <Logo size={40} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {started ? (
            <>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-sm py-2 px-4">{tr.nav.restart}</button>
              <button onClick={handleResume} className="btn-primary text-sm py-2 px-5">{tr.nav.resume}</button>
            </>
          ) : (
            <button onClick={handleStart} className="btn-primary text-sm py-2 px-5">{tr.nav.start}</button>
          )}
        </div>
      </nav>

      {/* Modal de confirmation restart */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-dark-600 rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in shadow-2xl">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-slate-100 mb-3">{tr.nav.restartTitle}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{tr.nav.restartMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-3">{tr.c.cancel}</button>
              <button onClick={handleConfirmRestart} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all duration-200 active:scale-95">{tr.nav.restartConfirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-700/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-900/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            {t.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-slate-100">
            {t.heroTitle}{' '}<span className="text-brand-400">{t.heroAccent}</span>{' '}{t.heroTitle2}
          </h1>

          <p
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.heroSub }}
          />

          {started ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button onClick={handleResume} className="btn-primary text-base py-4 px-8 text-lg w-full sm:w-auto">{t.ctaResume}</button>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-4 px-8 w-full sm:w-auto">{t.ctaRestart}</button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button onClick={handleStart} className="btn-primary text-base py-4 px-8 text-lg w-full sm:w-auto">{t.heroCta}</button>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><span className="text-yellow-400">★★★★★</span> {t.statRating}</span>
            <span>·</span><span>{t.statReports}</span>
            <span>·</span><span>{t.statSpeed}</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Bannière de reprise */}
      {started && (
        <section className="px-4 -mt-8 pb-8 relative z-10">
          <div className="max-w-2xl mx-auto bg-[#111111] border border-dark-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-2xl flex-shrink-0">🔄</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 font-semibold text-sm">{tr.nav.resumeBannerTitle}</p>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{tr.nav.resumeBannerSub}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setShowConfirm(true)} className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors">{tr.nav.restart}</button>
              <button onClick={handleResume} className="btn-primary text-xs py-2 px-4">{lang === 'fr' ? 'Reprendre →' : 'Resume →'}</button>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.howTitle} <span className="gradient-text">{t.howAccent}</span> ?
            </h2>
            <p className="text-slate-400 text-lg">{t.howSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {t.steps.map((step, i) => (
              <div key={i} className="card p-8 relative group hover:border-brand-700 transition-colors duration-300">
                <div className="text-4xl mb-5">{step.icon}</div>
                <div className="absolute top-6 right-6 text-6xl font-black text-dark-700 group-hover:text-dark-600 transition-colors">{i + 1}</div>
                <h3 className="text-lg font-semibold mb-3 text-slate-100">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example trajectory */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.exTitle} <span className="gradient-text">{t.exAccent}</span>
            </h2>
            <p className="text-slate-400">{t.exSub}</p>
          </div>
          <div className="card p-8 glow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500 rounded-t-2xl" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{t.exTrajLabel}</span>
                <h3 className="text-2xl font-bold mt-1">{t.exTrajTitle}</h3>
                <p className="text-slate-400 italic mt-1 text-sm">{t.exTrajTagline}</p>
              </div>
              <div className="text-right"><div className="text-3xl font-black text-brand-400">82%</div><div className="text-xs text-slate-500">{tr.paywall.feasibility}</div></div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6 text-sm">{t.exTrajDesc}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {t.exSkills.map((skill) => (
                <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-brand-600/15 text-brand-300 border border-brand-600/20 text-center">{skill}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-dark-700">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-sm">→</div>
              <span className="text-slate-500 text-sm">{t.exMore}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.testiTitle} <span className="gradient-text">{t.testiAccent}</span> {t.testiTitle2}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.map((testi, i) => (
              <div key={i} className="card p-6 hover:border-brand-800 transition-colors duration-300">
                <div className="flex mb-4">{Array.from({ length: testi.stars }).map((_, s) => <span key={s} className="text-yellow-400 text-sm">★</span>)}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">"{testi.text}"</p>
                <div><div className="font-semibold text-slate-200 text-sm">{testi.name}</div><div className="text-slate-500 text-xs">{testi.job}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-dark-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
            {t.ctaTitle} <span className="text-brand-400">{t.ctaAccent}</span>{t.ctaTitle2}
          </h2>
          <p className="text-slate-400 mb-10 text-lg">{t.ctaSub}</p>
          {started ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleResume} className="btn-primary text-base py-4 px-10 text-lg">{t.ctaResume}</button>
              <button onClick={() => setShowConfirm(true)} className="btn-secondary text-base py-4 px-8">{t.ctaRestart}</button>
            </div>
          ) : (
            <button onClick={handleStart} className="btn-primary text-base py-4 px-10 text-lg">{t.ctaStart}</button>
          )}
          <p className="text-sm text-slate-600 mt-4">{t.ctaNote}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t.faqTitle} <span className="gradient-text">{t.faqAccent}</span>
          </h2>
          <div className="space-y-4">
            {t.faqs.map((faq, i) => (
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
          <Logo size={36} />
          <p className="text-slate-600 text-sm text-center">© {new Date().getFullYear()} OtherMe · {t.footerRights}</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerPrivacy}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerTerms}</a>
            <a href="#" className="hover:text-slate-400 transition-colors">{t.footerContact}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
