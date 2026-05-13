import { useLanguage } from '../contexts/LanguageContext'

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  return (
    <button
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-600 bg-dark-800/60 hover:bg-dark-700 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all duration-200"
    >
      <span className="text-base leading-none">{lang === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
      <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  )
}
