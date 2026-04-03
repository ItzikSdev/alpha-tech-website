import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import { Menu, SquarePen, Search, Truck, FileText, PlusCircle, MessageSquare, Settings, UserCircle, Sun, Moon, Languages } from 'lucide-react';

interface ChatSession { _id: string; title: string; }
interface Props { collapsed: boolean; onToggle: () => void; }

export default function AppNavbar({ collapsed, onToggle }: Props) {
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = lang === 'he' || lang === 'ru';
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const bg = isDark ? '#161B22' : '#F0F2F5';
  const bgDeep = isDark ? '#0D1117' : '#E4E6EB';
  const text = isDark ? '#F0F6FC' : '#1A1A1A';
  const textMuted = isDark ? '#8B949E' : '#65676B';
  const border = isDark ? '#21262D' : '#D1D5DB';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const accent = '#22D3EE';

  const isActive = (path: string) => location.pathname.startsWith(path);
  const go = (path: string) => { navigate(path); onToggle(); };

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<{ success: boolean; sessions: ChatSession[] }>('/chat-history', { token });
      if (data.success) setChatHistory(data.sessions || []);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = search ? chatHistory.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())) : chatHistory;
  const open = !collapsed;

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', background: bgDeep, zIndex: 90,
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        <button onClick={onToggle} style={{
          width: 40, height: 40, borderRadius: '50%',
          border: 'none', background: 'transparent', color: textMuted,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Menu size={22} />
        </button>
        <a href="/chat" style={{ fontSize: 18, fontWeight: 700, color: text, textDecoration: 'none' }}>AlphaCar</a>
      </div>

      {/* Mini rail — visible when sidebar is closed (desktop only) */}
      {!open && !isMobile && (
        <div style={{
          position: 'fixed', top: 48, [isRTL ? 'right' : 'left']: 0,
          width: 56, height: 'calc(100vh - 48px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '12px 0', gap: 4, background: bgDeep, zIndex: 80,
        }}>
          <MiniBtn icon={<SquarePen size={20} color={accent} />} onClick={() => navigate('/chat')} tooltip={t('appNav.newChat') || 'שיחה חדשה'} />
          <div style={{ height: 8 }} />
          <MiniBtn icon={<Truck size={20} />} onClick={() => navigate('/vehicles')} active={isActive('/vehicles')} accent={accent} tooltip={t('appNav.vehicles') || 'רכבים'} />
          <MiniBtn icon={<FileText size={20} />} onClick={() => navigate('/my-vehicles')} active={isActive('/my-vehicles')} accent={accent} tooltip={t('appNav.myVehicles') || 'הרכבים שלי'} />
          <MiniBtn icon={<PlusCircle size={20} />} onClick={() => navigate('/publish')} active={isActive('/publish')} accent={accent} tooltip={t('appNav.publish') || 'פרסם רכב'} />
          <div style={{ flex: 1 }} />
          <MiniBtn icon={<Settings size={20} />} onClick={() => navigate('/settings')} tooltip={t('appNav.settings') || 'הגדרות'} />
          {!token && (
            <MiniBtn icon={<UserCircle size={20} />} onClick={() => navigate(`/login?from=${location.pathname}`)} tooltip={t('nav.login') || 'כניסה'} />
          )}
        </div>
      )}

      {/* Overlay */}
      {open && <div onClick={onToggle} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110 }} />}

      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0,
        width: 280, height: '100vh', background: bg, zIndex: 120,
        display: 'flex', flexDirection: 'column', padding: 12, boxSizing: 'border-box',
        transform: open ? 'translateX(0)' : (isRTL ? 'translateX(100%)' : 'translateX(-100%)'),
        transition: 'transform 0.2s ease',
        boxShadow: open ? '0 0 20px rgba(0,0,0,0.3)' : 'none',
        direction: isRTL ? 'rtl' : 'ltr', overflowY: 'auto',
      }}>

        <Btn icon={<SquarePen size={18} color={accent} />} label={t('appNav.newChat') || 'שיחה חדשה'} onClick={() => go('/chat')} colors={{ bg: bgDeep, text, border, hover: hoverBg }} outlined />

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 50, margin: '4px 0 8px', background: bgDeep, border: `1px solid ${border}` }}>
          <Search size={16} color={textMuted} style={{ flexShrink: 0 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('appNav.searchHistory') || 'חפש בשיחות...'}
            style={{ border: 'none', outline: 'none', background: 'transparent', color: text, fontSize: 13, width: '100%', fontFamily: 'inherit', direction: isRTL ? 'rtl' : 'ltr' }} />
        </div>

        {/* Nav */}
        <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: 8, marginBottom: 4 }}>
          <Btn icon={<Truck size={18} />} label={t('appNav.vehicles') || 'לוח מודעות רכבים'} onClick={() => go('/vehicles')} active={isActive('/vehicles')} colors={{ bg, text, border, hover: hoverBg, accent }} />
          <Btn icon={<FileText size={18} />} label={t('appNav.myVehicles') || 'הרכבים שלי'} onClick={() => go('/my-vehicles')} active={isActive('/my-vehicles')} colors={{ bg, text, border, hover: hoverBg, accent }} />
          <Btn icon={<PlusCircle size={18} />} label={t('appNav.publish') || 'פרסם רכב'} onClick={() => go('/publish')} active={isActive('/publish')} colors={{ bg, text, border, hover: hoverBg, accent }} />
        </div>

        {/* Chat history */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, padding: '10px 16px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('appNav.recentChats') || 'שיחות אחרונות'}
          </div>
          {filtered.length === 0 ? (
            <div style={{ fontSize: 12, color: textMuted, padding: '4px 16px', opacity: 0.6 }}>
              {!search && (t('appNav.noChats') || 'אין שיחות עדיין')}
            </div>
          ) : filtered.slice(0, 30).map((chat) => (
            <Btn key={chat._id} icon={<MessageSquare size={14} />} label={chat.title} onClick={() => go(`/chat?session=${chat._id}`)} small colors={{ bg, text, border, hover: hoverBg }} />
          ))}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8, marginTop: 8 }}>
          {/* Settings popup trigger */}
          <Btn icon={<Settings size={18} />} label={t('appNav.settings') || 'הגדרות ועזרה'} onClick={() => setShowSettings(!showSettings)} colors={{ bg, text, border, hover: hoverBg }} />

          {/* Settings popup */}
          {showSettings && (
            <div style={{ padding: '8px 10px', margin: '4px 0', borderRadius: 12, background: bgDeep, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Theme toggle */}
              <button onClick={toggleTheme} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: text, fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', fontFamily: 'inherit', textAlign: 'start' as const,
              }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDark ? (t('appNav.lightMode') || 'מצב בהיר') : (t('appNav.darkMode') || 'מצב כהה')}</span>
              </button>
              {/* Language */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
                <Languages size={16} color={textMuted} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['he', 'en', 'ru'] as const).map((l) => (
                    <button key={l} onClick={() => setLang(l)} style={{
                      padding: '4px 12px', borderRadius: 8, border: `1px solid ${lang === l ? accent : border}`,
                      background: lang === l ? 'rgba(34,211,238,0.12)' : 'transparent',
                      color: lang === l ? accent : textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {l === 'he' ? 'עב' : l === 'en' ? 'EN' : 'РУ'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User */}
          {token ? (
            <Btn
              icon={<div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #22D3EE, #0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>{user?.displayName?.charAt(0)?.toUpperCase() || '?'}</div>}
              label={user?.displayName || t('nav.account') || 'חשבון'}
              onClick={() => go('/settings')}
              colors={{ bg, text, border, hover: hoverBg }}
            />
          ) : (
            <Btn icon={<UserCircle size={18} />} label={t('nav.login') || 'כניסה'} onClick={() => { navigate(`/login?from=${location.pathname}`); onToggle(); }} colors={{ bg, text, border, hover: hoverBg }} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Reusable button ── */
function Btn({ icon, label, onClick, active, outlined, small, colors }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  active?: boolean; outlined?: boolean; small?: boolean;
  colors: { bg: string; text: string; border: string; hover: string; accent?: string };
}) {
  const [hover, setHover] = useState(false);
  const accent = colors.accent || '#22D3EE';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: small ? 10 : 14,
        padding: small ? '8px 16px' : '11px 16px',
        margin: '1px 0', borderRadius: 50, width: '100%', boxSizing: 'border-box',
        border: outlined ? `1px solid ${colors.border}` : 'none',
        background: active ? 'rgba(34,211,238,0.12)' : hover ? colors.hover : outlined ? colors.bg : 'transparent',
        color: active ? accent : hover ? colors.text : '#8B949E',
        fontSize: small ? 13 : 14, fontWeight: active ? 600 : 500, fontFamily: 'inherit',
        cursor: 'pointer', textAlign: 'start' as const, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </button>
  );
}

/* ── Mini icon button (collapsed rail) ── */
function MiniBtn({ icon, onClick, active, accent, tooltip }: {
  icon: React.ReactNode; onClick: () => void; active?: boolean; accent?: string; tooltip?: string;
}) {
  const [hover, setHover] = useState(false);
  const ac = accent || '#22D3EE';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={tooltip}
      style={{
        width: 40, height: 40, borderRadius: 12, border: 'none',
        background: active ? 'rgba(34,211,238,0.12)' : hover ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: active ? ac : hover ? '#F0F6FC' : '#8B949E',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {icon}
    </button>
  );
}
