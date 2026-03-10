import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Backend base URL — reads VITE_API_URL (same env var used by the rest of the site)
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'https://api.alpha-tech.live';

interface DisplayPlan {
  id: string;
  productId: string | null;
  name: string;
  features: string[];
  priceILS: number;
  priceUSD: number;
  period: string | null;
  highlight: boolean;
  sortOrder: number;
}

type Lang = 'he' | 'en' | 'ru';

// All plan display data — names/features are hardcoded here so the page
// always looks correct regardless of which backend version is running.
// Only priceILS is overridden by the live API response.
const PLAN_DATA: Record<string, {
  id: string;
  productId: string | null;
  name: Record<Lang, string>;
  features: Record<Lang, string[]>;
  priceILS: number;
  priceUSD: number;
  period: Record<Lang, string> | null;
  highlight: boolean;
  sortOrder: number;
}> = {
  free: {
    id: 'free',
    productId: null,
    name: { he: 'חינמי', en: 'Free', ru: 'Бесплатно' },
    features: {
      he: ['פרסום מכונית אחת', 'חיפוש בסיסי', 'גישה לכל המודעות'],
      en: ['List 1 car', 'Basic search', 'Access to all listings'],
      ru: ['1 объявление', 'Базовый поиск', 'Доступ ко всем объявлениям'],
    },
    priceILS: 0,
    priceUSD: 0,
    period: null,
    highlight: false,
    sortOrder: 0,
  },
  alphacar_basic_tokens: {
    id: 'alphacar_basic_tokens',
    productId: 'alphacar_basic_tokens',
    name: { he: 'בייסיק טוקנים', en: 'Basic Tokens', ru: 'Базовые токены' },
    features: {
      he: ['50 טוקני AI', 'פרסום עד 2 מכוניות', 'חיפוש AI בסיסי'],
      en: ['50 AI tokens', 'Up to 2 listings', 'Basic AI search'],
      ru: ['50 AI-токенов', 'До 2 объявлений', 'Базовый AI-поиск'],
    },
    priceILS: 15,
    priceUSD: 4.1,
    period: null,
    highlight: false,
    sortOrder: 1,
  },
  alphacar_pro_monthly: {
    id: 'alphacar_pro_monthly',
    productId: 'alphacar_pro_monthly',
    name: { he: 'פרו חודשי', en: 'Pro Monthly', ru: 'Про ежемесячно' },
    features: {
      he: ['5 פרסומי מכוניות', 'AI בלתי מוגבל', 'תווית מוכר מאומת', 'עדיפות בתוצאות חיפוש'],
      en: ['5 car listings', 'Unlimited AI chat', 'Verified seller badge', 'Priority in search'],
      ru: ['5 объявлений', 'Безлимитный AI', 'Значок верифицированного продавца', 'Приоритет в поиске'],
    },
    priceILS: 20,
    priceUSD: 5.4,
    period: { he: 'חודש', en: 'month', ru: 'месяц' },
    highlight: true,
    sortOrder: 2,
  },
  alphacar_premium_tokens: {
    id: 'alphacar_premium_tokens',
    productId: 'alphacar_premium_tokens',
    name: { he: 'פרמיום טוקנים', en: 'Premium Tokens', ru: 'Премиум токены' },
    features: {
      he: ['150 טוקני AI', 'פרסום עד 4 מכוניות', 'חיפוש AI מתקדם'],
      en: ['150 AI tokens', 'Up to 4 listings', 'Advanced AI search'],
      ru: ['150 AI-токенов', 'До 4 объявлений', 'Расширенный AI-поиск'],
    },
    priceILS: 30,
    priceUSD: 8.1,
    period: null,
    highlight: false,
    sortOrder: 3,
  },
};

// Build display plans, merging live prices from API with static display data
function buildDisplayPlans(lang: Lang, apiProducts?: any[]): DisplayPlan[] {
  // Index API products by id (new format) or productId (old format)
  const apiMap: Record<string, any> = {};
  for (const p of apiProducts ?? []) {
    const id = p.id ?? p.productId;
    if (id) apiMap[id] = p;
  }

  return Object.values(PLAN_DATA)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((plan) => {
      const api = apiMap[plan.id];
      return {
        id: plan.id,
        productId: plan.productId,
        name: plan.name[lang],
        features: plan.features[lang],
        priceILS: api?.priceILS ?? plan.priceILS,
        // Use priceUSD from API (which includes live exchange rate) when available
        priceUSD: api?.priceUSD ?? plan.priceUSD,
        period: plan.period ? plan.period[lang] : null,
        highlight: plan.highlight,
        sortOrder: plan.sortOrder,
      };
    });
}

export default function PlansPage() {
  const { t, lang } = useLanguage();
  const containerRef = useScrollReveal();
  const apiLang: Lang = lang === 'he' ? 'he' : lang === 'ru' ? 'ru' : 'en';
  const [displayPlans, setDisplayPlans] = useState<DisplayPlan[]>(() => buildDisplayPlans(apiLang));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always show fallback immediately on lang change
    setDisplayPlans(buildDisplayPlans(apiLang));
    setLoading(true);

    fetch(`${API_BASE}/api/v1/purchases/products?lang=${apiLang}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.products?.length) {
          // Merge: use hardcoded names/features, override prices from API
          setDisplayPlans(buildDisplayPlans(apiLang, d.products));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <div ref={containerRef}>
      {/* ── HERO ── */}
      <section className="page-container reveal" style={{ paddingTop: 100, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(34,211,238,.12)', border: '1px solid rgba(34,211,238,.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
          <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>⚡ {t('plans.badge')}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, marginBottom: 16 }}>
          {t('plans.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 60px' }}>
          {t('plans.subtitle')}
        </p>

        {/* ── PLAN CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          maxWidth: 1100,
          margin: '0 auto',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity .3s',
        }}>
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className="reveal"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${plan.highlight ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 20,
                padding: 28,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: plan.highlight ? '0 0 30px rgba(34,211,238,.12)' : undefined,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform .2s, box-shadow .2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = plan.highlight
                  ? '0 8px 40px rgba(34,211,238,.22)'
                  : '0 8px 30px rgba(0,0,0,.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = plan.highlight ? '0 0 30px rgba(34,211,238,.12)' : '';
              }}
            >
              {/* Recommended badge */}
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--accent)', color: '#000',
                  fontSize: 11, fontWeight: 700,
                  padding: '4px 14px',
                  borderBottomLeftRadius: 12,
                }}>
                  {t('plans.recommended')}
                </div>
              )}

              {/* Plan name */}
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text)',
                textAlign: 'right' as const,
                marginBottom: 12,
              }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)' }}>
                  {plan.priceILS === 0 ? t('plans.free') : `₪${plan.priceILS}`}
                </span>
                {plan.priceILS > 0 && (
                  <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                    / ${plan.priceUSD}
                  </span>
                )}
                {plan.period && (
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    /{plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', color: 'var(--text)', fontSize: 14 }}>
                    <span style={{ order: 1 }}>{f}</span>
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.productId ? (
                <a
                  href="#download"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    background: plan.highlight ? 'var(--accent)' : 'transparent',
                    color: plan.highlight ? '#000' : 'var(--accent)',
                    border: plan.highlight ? 'none' : '1px solid var(--accent)',
                    textDecoration: 'none',
                    transition: 'opacity .2s',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '0.85')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '1')}
                >
                  {plan.id === 'alphacar_pro_monthly' ? t('plans.subscribe') : t('plans.purchase')}
                </a>
              ) : (
                <div style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}>
                  {t('plans.currentFree')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 700, margin: '80px auto 0', textAlign: 'right' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>{t('plans.faq.title')}</h2>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
              <h4 style={{ color: 'var(--text)', marginBottom: 8 }}>{t(`plans.faq.q${n}`)}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t(`plans.faq.a${n}`)}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ marginTop: 60, marginBottom: 40 }}>
          <a href="#download" className="btn-primary">{t('plans.downloadCta')}</a>
        </div>

        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14 }}>
          &larr; {t('page.backHome')}
        </Link>
      </section>
    </div>
  );
}
