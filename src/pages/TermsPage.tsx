import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="page-content">
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
          &larr; {t('page.backHome')}
        </Link>
        <h2>{t('terms.title')}</h2>
        <p><strong>{t('terms.updated')}</strong></p>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <h3>{t(`terms.s${i}.title`)}</h3>
            <p>{t(`terms.s${i}.text`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
