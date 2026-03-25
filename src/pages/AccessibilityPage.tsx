import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityPage() {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="page-content">
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
          &larr; {t('page.backHome')}
        </Link>
        <h2>{t('accessibility.title')}</h2>
        <p><strong>{t('accessibility.updated')}</strong></p>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <h3>{t(`accessibility.s${i}.title`)}</h3>
            <p>{t(`accessibility.s${i}.text`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
