import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const WheelchairIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 7h2v4h3l2 5h-2l-1.5-3.5H13V20h-2v-6H8l-1.5 3.5H4.5L6.5 13H11V9zm-4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>
  </svg>
);

interface AccessibilityState {
  fontSize: number;       // 0 = normal, 1 = large, 2 = xlarge
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  bigCursor: boolean;
  readableFont: boolean;
}

const DEFAULT_STATE: AccessibilityState = {
  fontSize: 0,
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  bigCursor: false,
  readableFont: false,
};

export default function AccessibilityButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);

  const applyStyles = (newState: AccessibilityState) => {
    const root = document.documentElement;

    // Font size
    const sizes = ['100%', '120%', '140%'];
    root.style.fontSize = sizes[newState.fontSize];

    // High contrast
    if (newState.highContrast) {
      root.style.filter = root.style.filter?.includes('contrast') ? root.style.filter : (root.style.filter || '') + ' contrast(1.5)';
    } else {
      root.style.filter = (root.style.filter || '').replace(/contrast\([^)]+\)/g, '').trim();
    }

    // Grayscale
    if (newState.grayscale) {
      root.style.filter = root.style.filter?.includes('grayscale') ? root.style.filter : (root.style.filter || '') + ' grayscale(1)';
    } else {
      root.style.filter = (root.style.filter || '').replace(/grayscale\([^)]+\)/g, '').trim();
    }

    if (!root.style.filter?.trim()) root.style.filter = '';

    // Underline links
    document.querySelectorAll('a').forEach((a) => {
      (a as HTMLElement).style.textDecoration = newState.underlineLinks ? 'underline' : '';
    });

    // Big cursor
    root.style.cursor = newState.bigCursor ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'%3E%3Ccircle cx=\'16\' cy=\'16\' r=\'10\' fill=\'%2322D3EE\' opacity=\'0.5\'/%3E%3C/svg%3E") 16 16, auto' : '';

    // Readable font
    root.style.fontFamily = newState.readableFont ? 'Arial, Helvetica, sans-serif' : '';
  };

  const toggle = (key: keyof AccessibilityState) => {
    setState((prev) => {
      const newState = { ...prev };
      if (key === 'fontSize') {
        newState.fontSize = ((prev.fontSize + 1) % 3) as 0 | 1 | 2;
      } else {
        (newState as any)[key] = !(prev as any)[key];
      }
      applyStyles(newState);
      return newState;
    });
  };

  const resetAll = () => {
    setState(DEFAULT_STATE);
    applyStyles(DEFAULT_STATE);
  };

  const options = [
    { key: 'fontSize' as const, icon: 'Aa+', label: t('accessibility.btn.fontSize'), active: state.fontSize > 0 },
    { key: 'highContrast' as const, icon: '◐', label: t('accessibility.btn.contrast'), active: state.highContrast },
    { key: 'grayscale' as const, icon: '◑', label: t('accessibility.btn.grayscale'), active: state.grayscale },
    { key: 'underlineLinks' as const, icon: 'U̲', label: t('accessibility.btn.links'), active: state.underlineLinks },
    { key: 'bigCursor' as const, icon: '⊙', label: t('accessibility.btn.cursor'), active: state.bigCursor },
    { key: 'readableFont' as const, icon: 'Aa', label: t('accessibility.btn.font'), active: state.readableFont },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="תפריט נגישות"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'var(--accent, #22D3EE)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <WheelchairIcon />
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: 20,
          width: 280,
          backgroundColor: 'var(--card-bg, #1C2128)',
          border: '1px solid var(--border, #30363D)',
          borderRadius: 16,
          padding: 16,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text, #F0F6FC)' }}>
              {t('accessibility.btn.title')}
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #8B949E)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggle(opt.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 8px',
                  borderRadius: 10,
                  border: opt.active ? '2px solid var(--accent, #22D3EE)' : '1px solid var(--border, #30363D)',
                  backgroundColor: opt.active ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                  color: opt.active ? 'var(--accent, #22D3EE)' : 'var(--text, #F0F6FC)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={resetAll}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: '1px solid var(--border, #30363D)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted, #8B949E)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {t('accessibility.btn.reset')}
            </button>
            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                backgroundColor: 'var(--accent, #22D3EE)',
                color: '#0D1117',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {t('accessibility.btn.statement')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
