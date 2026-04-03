import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  vehicles?: VehicleCard[];
  followUps?: string[];
}

interface VehicleCard {
  _id: string; brand: string; vehicleModel: string; year: number; price: number;
  mileage: number; photos: string[]; previousOwners?: number;
}

export default function ChatPage() {
  const { token } = useAuth();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const bg = isDark ? '#0D1117' : '#F8FAFC';
  const card = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#21262D' : '#E2E8F0';
  const text = isDark ? '#F0F6FC' : '#0F172A';
  const textMuted = isDark ? '#8B949E' : '#64748B';
  const accent = '#22D3EE';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(sessionParam);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    t('chat.suggestion1') || 'חפש לי רכב עד 100,000 ₪',
    t('chat.suggestion2') || 'מה הרכבים הכי פופולריים?',
    t('chat.suggestion3') || 'אני מחפש רכב משפחתי',
    t('chat.suggestion4') || 'רכבים היברידיים',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing session
  useEffect(() => {
    if (!sessionParam || !token) return;
    apiFetch<{ success: boolean; session: { messages: { role: 'user' | 'ai'; text: string }[] } }>(
      `/chat-history/${sessionParam}`, { token }
    ).then((data) => {
      if (data.success && data.session?.messages) {
        setMessages(data.session.messages.map((m, i) => ({ id: String(i), role: m.role, text: m.text })));
        setSessionId(sessionParam);
      }
    }).catch(() => {});
  }, [sessionParam, token]);

  const saveMessage = useCallback(async (role: 'user' | 'ai', txt: string, sid: string | null) => {
    if (!token) return sid;
    try {
      if (!sid) {
        const data = await apiFetch<{ success: boolean; session: { _id: string } }>('/chat-history', { method: 'POST', body: { message: txt, language: lang }, token });
        if (data.success) return data.session._id;
      } else {
        await apiFetch(`/chat-history/${sid}/messages`, { method: 'POST', body: { role, text: txt }, token });
      }
    } catch { /* */ }
    return sid;
  }, [token, lang]);

  const handleSend = useCallback(async (txt?: string) => {
    const msg = txt || input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    const newSid = await saveMessage('user', msg, sessionId);
    if (newSid && newSid !== sessionId) setSessionId(newSid);

    try {
      const data = await apiFetch<{
        success: boolean; reply?: string; vehicles?: VehicleCard[];
        followUpQuestions?: string[]; sessionId?: string;
      }>('/search/chat', {
        method: 'POST',
        body: { message: msg, lang, sessionId: newSid || sessionId },
        token: token || undefined,
      });

      const aiText = data.reply || t('chat.error') || 'שגיאה';
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: 'ai', text: aiText,
        vehicles: data.vehicles, followUps: data.followUpQuestions,
      }]);

      await saveMessage('ai', aiText, newSid || sessionId);
    } catch (err: any) {
      const errText = err?.message === 'SESSION_EXPIRED' ? (t('chat.loginRequired') || 'יש להתחבר') : (t('chat.error') || 'שגיאה');
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: errText }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, token, lang, t, sessionId, saveMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', background: bg, direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {messages.length === 0 ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #22D3EE, #0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/images/logo.png" alt="" style={{ width: 32, height: 32 }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: text, margin: 0 }}>{t('chat.welcome') || 'מה אתה מחפש?'}</h1>
            <p style={{ fontSize: 14, color: textMuted, margin: 0, textAlign: 'center' }}>{t('chat.welcomeSub') || 'חפש רכבים, שאל שאלות, או בדוק פרטי רכב לפי מספר'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} style={{
                  padding: '10px 18px', borderRadius: 50, border: `1px solid ${border}`, background: card,
                  color: textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {/* Bubble */}
              <div style={{
                padding: '12px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user'
                  ? (isDark ? 'linear-gradient(135deg, #22D3EE, #0891B2)' : '#E0F7FA')
                  : card,
                color: msg.role === 'user'
                  ? (isDark ? '#fff' : '#0F172A')
                  : text,
                fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                border: msg.role === 'ai' ? `1px solid ${border}` : 'none',
              }}>
                {msg.text}
              </div>

              {/* Vehicle cards */}
              {msg.vehicles && msg.vehicles.length > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {msg.vehicles.map((v) => (
                    <Link key={v._id} to={`/vehicle/${v._id}`} style={{
                      minWidth: 200, borderRadius: 12, border: `1px solid ${border}`, background: card,
                      overflow: 'hidden', textDecoration: 'none', color: 'inherit', flexShrink: 0,
                    }}>
                      <div style={{ height: 100, background: border, backgroundImage: v.photos?.[0] ? `url(${v.photos[0]})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{v.brand} {v.vehicleModel}</div>
                        <div style={{ fontSize: 12, color: textMuted }}>{v.year} · {v.mileage?.toLocaleString()} ק"מ</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: accent, marginTop: 4 }}>₪{v.price?.toLocaleString()}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Follow-up questions */}
              {msg.followUps && msg.followUps.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {msg.followUps.map((q, i) => (
                    <button key={i} onClick={() => handleSend(q)} style={{
                      padding: '6px 14px', borderRadius: 50, border: `1px solid ${border}`, background: card,
                      color: accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{q}</button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div style={{ padding: '12px 18px', borderRadius: '20px 20px 20px 4px', background: card, border: `1px solid ${border}`, color: textMuted, fontSize: 14, display: 'flex', gap: 6, alignItems: 'center', alignSelf: 'flex-start' }}>
            <span style={{ animation: 'typingDot 1.4s infinite' }}>●</span>
            <span style={{ animation: 'typingDot 1.4s infinite 0.2s' }}>●</span>
            <span style={{ animation: 'typingDot 1.4s infinite 0.4s' }}>●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px 20px', maxWidth: 800, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: card, border: `1px solid ${border}`, borderRadius: 24, padding: '10px 10px 10px 20px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder') || 'כתוב הודעה...'}
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: text, fontSize: 15, resize: 'none', maxHeight: 120, fontFamily: 'inherit', direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading} style={{
            height: 40, padding: '0 16px', borderRadius: 12, border: 'none', position: 'relative',
            background: 'transparent', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Spinning border */}
            <div style={{ position: 'absolute', inset: -1, borderRadius: 13, overflow: 'hidden', zIndex: 0 }}>
              <div style={{
                position: 'absolute', inset: '-50%', width: '200%', height: '200%',
                background: 'conic-gradient(#22D3EE, #8B5CF6, #EC4899, #F59E0B, #22C55E, #22D3EE)',
                animation: 'spin 2.5s linear infinite',
                opacity: input.trim() && !loading ? 1 : 0.3,
              }} />
            </div>
            <div style={{ position: 'absolute', inset: 1, borderRadius: 11, background: card, zIndex: 1 }} />
            <Send size={18} color={accent} style={{ position: 'relative', zIndex: 2 }} />
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: textMuted, margin: '6px 0 0', opacity: 0.6 }}>
          {t('chat.disclaimer') || 'AlphaCar AI — תשובות עשויות להכיל אי-דיוקים'}
        </p>
      </div>

      <style>{`
        @keyframes typingDot { 0%, 60%, 100% { opacity: 0.3; } 30% { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
