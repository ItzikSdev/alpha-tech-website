import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import PhoneCarousel from '../components/PhoneCarousel';
import MediaShowcase from '../components/MediaShowcase';
import MaintenanceCarousel from '../components/MaintenanceCarousel';

export default function HomePage() {
  const { t } = useLanguage();
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef}>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <div className="pulse" />
              <span>{t('hero.badge')}</span>
            </div>
            <h1>
              <span>{t('hero.title1')}</span><br />
              <span className="gradient-text">{t('hero.title2')}</span>
            </h1>
            <p>{t('hero.subtitle')}</p>
            <div className="hero-buttons">
              <a href="#download" className="btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{t('hero.downloadBtn')}</span>
              </a>
              <a href="/chat" className="btn-ai-chat">
                <div className="btn-ai-chat-border"></div>
                <div className="btn-ai-chat-bg"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{t('hero.tryAIChat')}</span>
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card floating-card-1">
              <div className="card-icon" style={{ background: 'rgba(34,211,238,0.15)' }}>&#129302;</div>
              <div className="card-title">{t('hero.floatingAgent')}</div>
              <div className="card-subtitle">{t('hero.floatingChats')}</div>
            </div>
            <PhoneCarousel />
            <div className="floating-card floating-card-2">
              <div className="card-icon" style={{ background: 'rgba(76,175,80,0.15)' }}>&#10003;</div>
              <div className="card-title">{t('hero.floatingLead')}</div>
              <div className="card-subtitle">{t('hero.floatingBuyer')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-inner reveal">
          <div className="stat-item">
            <h3>24/7</h3>
            <p>{t('stats.available')}</p>
          </div>
          <div className="stat-item">
            <h3>3</h3>
            <p>{t('stats.languages')}</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>{t('stats.automatic')}</p>
          </div>
          <div className="stat-item">
            <h3>&lt;1min</h3>
            <p>{t('stats.response')}</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-header reveal">
            <h2>{t('features.title')}</h2>
            <p>{t('features.subtitle')}</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '🤖', titleKey: 'features.ai.title', descKey: 'features.ai.desc' },
              { icon: '📷', titleKey: 'features.publish.title', descKey: 'features.publish.desc' },
              { icon: '🔒', titleKey: 'features.secure.title', descKey: 'features.secure.desc' },
              { icon: '🌐', titleKey: 'features.multi.title', descKey: 'features.multi.desc' },
              { icon: '📈', titleKey: 'features.leads.title', descKey: 'features.leads.desc' },
              { icon: '🔔', titleKey: 'features.notifications.title', descKey: 'features.notifications.desc' },
              { icon: '🔧', titleKey: 'features.maintenance.title', descKey: 'features.maintenance.desc' },
            ].map((f) => (
              <div className="feature-card reveal" key={f.titleKey}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{t(f.titleKey)}</h3>
                <p>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="ai-section" id="ai">
        <div className="section-inner">
          <div className="ai-grid">
            <div className="ai-text reveal">
              <h2>{t('ai.title')}</h2>
              <p>{t('ai.subtitle')}</p>
              <div className="ai-features">
                {[
                  { icon: '💬', titleKey: 'ai.answers.title', descKey: 'ai.answers.desc' },
                  { icon: '💰', titleKey: 'ai.negotiation.title', descKey: 'ai.negotiation.desc' },
                  { icon: '📅', titleKey: 'ai.meetings.title', descKey: 'ai.meetings.desc' },
                ].map((f) => (
                  <div className="ai-feature" key={f.titleKey}>
                    <div className="ai-feature-icon">{f.icon}</div>
                    <div>
                      <h4>{t(f.titleKey)}</h4>
                      <p>{t(f.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ai-chat-demo reveal">
              <div className="ai-chat-header">
                <div className="ai-avatar">&#129302;</div>
                <div>
                  <div className="name">{t('ai.chatAgent')}</div>
                  <div className="status">{t('ai.chatStatus')}</div>
                </div>
              </div>
              <div className="chat-messages">
                <div className="chat-bubble ai">{t('ai.chat1')}</div>
                <div className="chat-bubble user">{t('ai.chat2')}</div>
                <div className="chat-bubble ai">{t('ai.chat3')}</div>
                <div className="chat-bubble user">{t('ai.chat4')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUYER AI SEARCH SECTION */}
      <section className="buyer-ai-section" id="buyer-search">
        <div className="section-inner">
          <div className="buyer-ai-badge reveal">
            <span className="badge-pill">✨ {t('buyerAI.badge')}</span>
          </div>
          <div className="buyer-ai-grid">
            <div className="buyer-ai-chat-demo reveal">
              <div className="ai-chat-header">
                <div className="ai-avatar" style={{ background: 'linear-gradient(135deg, #22D3EE, #0ea5e9)' }}>🔍</div>
                <div>
                  <div className="name">{t('buyerAI.chatAgent')}</div>
                  <div className="status">{t('buyerAI.chatStatus')}</div>
                </div>
              </div>
              <div className="chat-messages">
                <div className="chat-bubble user">{t('buyerAI.chatUser1')}</div>
                <div className="chat-bubble ai" style={{ whiteSpace: 'pre-line' }}>{t('buyerAI.chatAI1')}</div>
                <div className="chat-bubble user">{t('buyerAI.chatUser2')}</div>
                <div className="chat-bubble ai">{t('buyerAI.chatAI2')}</div>
              </div>
            </div>
            <div className="buyer-ai-text reveal">
              <h2>{t('buyerAI.title')}</h2>
              <p>{t('buyerAI.subtitle')}</p>
              <div className="ai-features">
                {[
                  { icon: '🗣️', titleKey: 'buyerAI.feature1.title', descKey: 'buyerAI.feature1.desc' },
                  { icon: '🎯', titleKey: 'buyerAI.feature2.title', descKey: 'buyerAI.feature2.desc' },
                  { icon: '❤️', titleKey: 'buyerAI.feature3.title', descKey: 'buyerAI.feature3.desc' },
                ].map((f) => (
                  <div className="ai-feature" key={f.titleKey}>
                    <div className="ai-feature-icon">{f.icon}</div>
                    <div>
                      <h4>{t(f.titleKey)}</h4>
                      <p>{t(f.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAINTENANCE SECTION */}
      <section className="maintenance-section" id="maintenance">
        <div className="section-inner">
          <div className="buyer-ai-badge reveal">
            <span className="badge-pill">🔧 {t('maintenance.badge')}</span>
          </div>
          <div className="maintenance-grid">
            <div className="maintenance-text reveal">
              <h2>{t('maintenance.sectionTitle')}</h2>
              <p>{t('maintenance.sectionSubtitle')}</p>
              <div className="ai-features">
                {[
                  { icon: '🔍', titleKey: 'maintenance.feat1.title', descKey: 'maintenance.feat1.desc' },
                  { icon: '📋', titleKey: 'maintenance.feat2.title', descKey: 'maintenance.feat2.desc' },
                  { icon: '⚠️', titleKey: 'maintenance.feat3.title', descKey: 'maintenance.feat3.desc' },
                ].map((f) => (
                  <div className="ai-feature" key={f.titleKey}>
                    <div className="ai-feature-icon">{f.icon}</div>
                    <div>
                      <h4>{t(f.titleKey)}</h4>
                      <p>{t(f.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="maintenance-carousel-wrapper reveal">
              <MaintenanceCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA SHOWCASE - Full Width Apple-Style */}
      <MediaShowcase />

      {/* CTA */}
      <section className="cta" id="download">
        <div className="section-inner reveal">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.subtitle')}</p>
          <div className="store-buttons">
            <a href="#" className="store-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="store-text">
                <small>{t('cta.comingSoon')}</small>
                <strong>Google Play</strong>
              </div>
            </a>
            <a href="#" className="store-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.5 17,21.41 15.88,21.43C14.76,21.45 14.37,20.77 13.1,20.77C11.83,20.77 11.39,21.41 10.34,21.45C9.26,21.48 8.26,20.45 7.42,19.48C5.71,17.5 4.39,13.87 6.15,11.38C7.01,10.15 8.38,9.37 9.86,9.35C10.94,9.33 11.96,10.08 12.63,10.08C13.3,10.08 14.54,9.18 15.83,9.32C16.39,9.34 17.88,9.55 18.83,10.94C18.75,10.99 16.95,12.05 16.97,14.24C17,16.83 19.27,17.69 19.3,17.7C19.27,17.76 18.93,18.89 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="store-text">
                <small>{t('cta.comingSoon')}</small>
                <strong>App Store</strong>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
