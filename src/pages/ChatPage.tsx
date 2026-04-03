import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import { useSearchParams } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function ChatPage() {
  const { token } = useAuth();
  const { t, lang: language } = useLanguage();
  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');

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
        setMessages(data.session.messages.map((m, i) => ({
          id: String(i),
          role: m.role,
          text: m.text,
        })));
        setSessionId(sessionParam);
      }
    }).catch(() => {});
  }, [sessionParam, token]);

  const saveMessage = useCallback(async (role: 'user' | 'ai', text: string, currentSessionId: string | null) => {
    if (!token) return currentSessionId;
    try {
      if (!currentSessionId) {
        // Create new session
        const data = await apiFetch<{ success: boolean; session: { _id: string } }>(
          '/chat-history', { method: 'POST', body: { message: text, language }, token }
        );
        if (data.success) return data.session._id;
      } else {
        // Add to existing session
        await apiFetch(`/chat-history/${currentSessionId}/messages`, {
          method: 'POST', body: { role, text }, token,
        });
      }
    } catch { /* ignore */ }
    return currentSessionId;
  }, [token, language]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    // Save user message + create session if needed
    const newSessionId = await saveMessage('user', msg, sessionId);
    if (newSessionId && newSessionId !== sessionId) setSessionId(newSessionId);

    try {
      const data = await apiFetch<{ success: boolean; response?: string }>(
        '/search/chat',
        { method: 'POST', body: { message: msg, language }, token: token || undefined }
      );
      const aiText = data.response || t('chat.error') || 'שגיאה';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: aiText }]);

      // Save AI response
      await saveMessage('ai', aiText, newSessionId || sessionId);
    } catch (err: any) {
      const errText = err?.message === 'SESSION_EXPIRED'
        ? (t('chat.loginRequired') || 'יש להתחבר')
        : (t('chat.error') || 'שגיאה');
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: errText }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, token, language, t, sessionId, saveMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <img src="/images/logo.png" alt="AlphaCar" />
            </div>
            <h1>{t('chat.welcome') || 'מה אתה מחפש?'}</h1>
            <p>{t('chat.welcomeSub') || 'חפש רכבים, שאל שאלות, או בדוק פרטי רכב לפי מספר'}</p>
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="chat-suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {msg.text}
            </div>
          ))
        )}

        {loading && (
          <div className="chat-typing">
            <span className="typing-dot" style={{ animationDelay: '0s' }}>●</span>
            <span className="typing-dot" style={{ animationDelay: '0.2s' }}>●</span>
            <span className="typing-dot" style={{ animationDelay: '0.4s' }}>●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-box">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder') || 'כתוב הודעה...'}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <div className="chat-send-border"></div>
            <div className="chat-send-bg"></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="chat-disclaimer">{t('chat.disclaimer') || 'AlphaCar AI — תשובות עשויות להכיל אי-דיוקים'}</p>
      </div>
    </div>
  );
}
