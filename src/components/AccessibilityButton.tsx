import { Link } from 'react-router-dom';

const WheelchairIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1 7h2v4h3l2 5h-2l-1.5-3.5H13V20h-2v-6H8l-1.5 3.5H4.5L6.5 13H11V9zm-4 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>
  </svg>
);

export default function AccessibilityButton() {
  return (
    <Link
      to="/accessibility"
      aria-label="הצהרת נגישות"
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
        textDecoration: 'none',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <WheelchairIcon />
    </Link>
  );
}
