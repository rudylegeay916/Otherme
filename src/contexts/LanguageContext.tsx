import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Lang } from '../lib/i18n/translations'

const STORAGE_KEY = 'otherme_lang'

interface LanguageContextValue {
  lang:    Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({ lang: 'fr', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return (saved === 'en' || saved === 'fr') ? saved : 'fr'
    } catch {
      return 'fr'
    }
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* silencieux */ }
  }

  // Mise à jour de l'attribut html lang pour l'accessibilité
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const { lang, setLang } = useContext(LanguageContext)
  return { lang, setLang }
}
