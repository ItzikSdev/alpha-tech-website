import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function DeleteAccountPage() {
  const { t } = useLanguage();

  const dataRows = ['profile', 'vehicles', 'chats', 'leads', 'payments'].map((key) => {
    const parts = t(`delete.data.${key}`).split('|');
    return { data: parts[0], action: parts[1] };
  });

  return (
    <div className="page-container">
      <div className="page-content">
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
          &larr; {t('page.backHome')}
        </Link>
        <h2>{t('delete.title')}</h2>
        <p>{t('delete.subtitle')}</p>

        <div className="delete-warning">{t('delete.warning')}</div>

        {/* Online deletion via website */}
        <h3>{t('delete.methodWeb.title')}</h3>
        <p>{t('delete.methodWeb.text')}</p>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            background: 'var(--gradient)',
            color: 'var(--bg)',
            padding: '12px 28px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            marginTop: 12,
            marginBottom: 24,
          }}
        >
          {t('delete.methodWeb.button')}
        </Link>

        <h3>{t('delete.method1.title')}</h3>
        <ol className="delete-steps">
          <li>{t('delete.method1.step1')}</li>
          <li>{t('delete.method1.step2')}</li>
          <li>{t('delete.method1.step3')}</li>
          <li>{t('delete.method1.step4')}</li>
        </ol>

        <h3>{t('delete.method2.title')}</h3>
        <p>{t('delete.method2.text')}</p>
        <p><a href="mailto:support@alpha-tech.live?subject=Account%20Deletion%20Request" style={{ color: 'var(--accent)' }}>support@alpha-tech.live</a></p>

        <h3>{t('delete.data.title')}</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('delete.data.header.data')}</th>
              <th>{t('delete.data.header.action')}</th>
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, i) => (
              <tr key={i}>
                <td>{row.data}</td>
                <td>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
