import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { langLabels, langLabelsShort, langFlags, type Language } from '../i18n/translations';

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
  </svg>
);

interface Props {
  variant?: 'full' | 'short';
}

export default function LanguageSwitcher({ variant = 'full' }: Props) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const languages: Language[] = ['he', 'en', 'ru'];

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen(!open)}>
        <GlobeIcon />
        <span>{variant === 'full' ? langLabels[lang] : langLabelsShort[lang]}</span>
      </button>
      <div className={`lang-dropdown ${open ? 'open' : ''}`}>
        {languages.map((l) => (
          <button
            key={l}
            className={`lang-option ${l === lang ? 'active' : ''}`}
            onClick={() => { setLang(l); setOpen(false); }}
          >
            <span className="flag">{langFlags[l]}</span> {langLabels[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
