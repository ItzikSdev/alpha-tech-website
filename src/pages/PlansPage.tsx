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

// Build display plans entirely from API response (server is the source of truth)
// priceUSD comes from backend (uses cached Frankfurter rate)
function buildDisplayPlans(apiProducts: any[]): DisplayPlan[] {
  return apiProducts
    .map((p) => ({
      id: p.id ?? p.productId ?? 'unknown',
      productId: p.productId,
      name: p.name ?? '',
      features: p.features ?? [],
      priceILS: p.priceILS ?? 0,
      priceUSD: p.priceUSD ?? 0,
      period: p.period ?? null,
      highlight: p.highlight ?? false,
      sortOrder: p.sortOrder ?? 99,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function PlansPage() {
  const { t, lang } = useLanguage();
  const containerRef = useScrollReveal();
  const apiLang: Lang = lang === 'he' ? 'he' : lang === 'ru' ? 'ru' : 'en';
  const [displayPlans, setDisplayPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/api/v1/purchases/products?lang=${apiLang}`)
      .then((r) => r.json())
      .catch(() => null)
      .then((d) => {
        const apiProducts = d?.success && d.products?.length ? d.products : [];
        setDisplayPlans(buildDisplayPlans(apiProducts));
      })
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
                    / ~${plan.priceUSD}
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
