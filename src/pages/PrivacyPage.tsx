import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="page-content">
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
          &larr; {t('page.backHome')}
        </Link>
        <h2>{t('privacy.title')}</h2>
        <p><strong>{t('privacy.updated')}</strong></p>

        <h3>{t('privacy.s1.title')}</h3>
        <ul>
          {t('privacy.s1.items').split('|').map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        {[2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <h3>{t(`privacy.s${i}.title`)}</h3>
            <p>{t(`privacy.s${i}.text`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
