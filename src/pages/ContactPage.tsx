import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="page-content">
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 20 }}>
          &larr; {t('page.backHome')}
        </Link>
        <h2>{t('contact.title')}</h2>
        <p>{t('contact.subtitle')}</p>

        <div className="contact-grid">
          <div className="contact-item">
            <div className="icon">📧</div>
            <h4>{t('contact.email')}</h4>
            <p><a href="mailto:support@alpha-tech.live">support@alpha-tech.live</a></p>
          </div>
          <div className="contact-item">
            <div className="icon">💬</div>
            <h4>{t('contact.chat')}</h4>
            <p>{t('contact.chatDesc')}</p>
          </div>
          <div className="contact-item">
            <div className="icon social-icon-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <h4>Facebook</h4>
            <p><a href="https://www.facebook.com/profile.php?id=61588566552220" target="_blank" rel="noopener noreferrer">{t('contact.facebookPage')}</a></p>
          </div>
          <div className="contact-item">
            <div className="icon social-icon-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <h4>Telegram</h4>
            <p><a href="https://t.me/AlphaCar_t" target="_blank" rel="noopener noreferrer">@AlphaCar_t</a></p>
          </div>
          <div className="contact-item">
            <div className="icon">📍</div>
            <h4>{t('contact.location')}</h4>
            <p>{t('contact.locationValue')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
