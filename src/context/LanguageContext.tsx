import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { translations, pageTitles, type Language } from '../i18n/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('alphacar-lang');
    return (saved === 'he' || saved === 'en' || saved === 'ru') ? saved : 'he';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('alphacar-lang', newLang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[lang]?.[key] ?? translations['he']?.[key] ?? key;
  }, [lang]);

  useEffect(() => {
    const html = document.documentElement;
    if (lang === 'he') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'he');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', lang);
    }
    document.title = pageTitles[lang];
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
