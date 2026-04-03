import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Upload, LogIn, Check } from 'lucide-react';

interface GovData {
  brand?: string; vehicleModel?: string; year?: number; color?: string;
  engineType?: string; engineVolume?: number; horsepower?: number; doors?: number;
  testUntil?: string; firstRegistration?: string; autoDescription?: string;
}

export default function PublishPage() {
  const { token } = useAuth();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const bg = isDark ? '#0D1117' : '#F8FAFC';
  const card = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#21262D' : '#E2E8F0';
  const text = isDark ? '#F0F6FC' : '#0F172A';
  const textMuted = isDark ? '#8B949E' : '#64748B';
  const accent = '#22D3EE';

  // Check for prefill from MyVehicleDetailPage
  const params = new URLSearchParams(window.location.search);
  const hasPrefill = params.get('prefill') === '1';

  const [step, setStep] = useState<1 | 2>(hasPrefill ? 2 : 1);
  const [plate, setPlate] = useState(params.get('plate') || '');
  const [lookingUp, setLookingUp] = useState(false);
  const [govData, setGovData] = useState<GovData | null>(hasPrefill ? {
    brand: params.get('brand') || undefined,
    vehicleModel: params.get('model') || undefined,
    year: params.get('year') ? Number(params.get('year')) : undefined,
    color: params.get('color') || undefined,
    engineType: params.get('engineType') || undefined,
  } : null);
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState(params.get('mileage') || '');
  const [description, setDescription] = useState('');
  const [transmission, setTransmission] = useState('automatic');
  const [photos, setPhotos] = useState<File[]>([]);
  const [publishing, setPublishing] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${border}`,
    background: bg, color: text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  if (!token) {
    return (
      <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: bg, paddingTop: 48, direction: isRTL ? 'rtl' : 'ltr' }}>
        <p style={{ color: textMuted }}>{t('publish.loginRequired') || 'יש להתחבר כדי לפרסם'}</p>
        <button onClick={() => navigate('/login?from=/publish')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          <LogIn size={18} />{t('nav.login') || 'כניסה'}
        </button>
      </div>
    );
  }

  const handleLookup = async () => {
    const clean = plate.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    setLookingUp(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicleFields?: GovData }>(`/vehicles/lookup/${clean}`, { token });
      if (data.success && data.vehicleFields) setGovData(data.vehicleFields);
    } catch { /* */ }
    setLookingUp(false);
    setStep(2);
  };

  const handlePublish = async () => {
    if (!price || !description) { alert(t('publish.fillRequired') || 'מלא מחיר ותיאור'); return; }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('brand', govData?.brand || '');
      formData.append('vehicleModel', govData?.vehicleModel || '');
      formData.append('year', String(govData?.year || ''));
      formData.append('color', govData?.color || '');
      formData.append('price', price);
      formData.append('mileage', mileage);
      formData.append('description', description);
      formData.append('transmission', transmission);
      formData.append('licensePlate', plate.replace(/[^0-9]/g, ''));
      if (govData?.engineType) formData.append('engineType', govData.engineType);
      photos.forEach((f) => formData.append('photos', f));

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.alpha-tech.live'}/api/v1/vehicles`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      if (data.success) navigate(`/vehicle/${data.vehicle._id}`);
      else alert(data.error?.message || data.message || 'Error');
    } catch (err: any) { alert(err?.message || 'Error'); }
    setPublishing(false);
  };

  // Step 1 — plate input
  if (step === 1) {
    return (
      <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: bg, paddingTop: 48, padding: 32, direction: isRTL ? 'rtl' : 'ltr' }}>
        <Upload size={48} color={accent} />
        <h2 style={{ color: text, fontSize: 22, fontWeight: 800, margin: 0 }}>{t('publish.title') || 'פרסום רכב'}</h2>
        <p style={{ color: textMuted, margin: 0, fontSize: 14, textAlign: 'center' }}>{t('publish.subtitle') || 'הזן מספר רכב ונמלא את הפרטים אוטומטית'}</p>
        <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="1234567" style={{
          width: 240, padding: '16px 20px', borderRadius: 16, border: `2px solid ${accent}`, background: card, color: text,
          fontSize: 26, fontWeight: 800, letterSpacing: 5, textAlign: 'center', outline: 'none', fontFamily: 'inherit',
        }} />
        <button onClick={handleLookup} disabled={lookingUp || plate.replace(/[^0-9]/g, '').length < 5} style={{
          width: 240, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: lookingUp ? 0.6 : 1, fontFamily: 'inherit',
        }}>
          {lookingUp ? '...' : (t('publish.continue') || 'המשך')}
        </button>
        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          {t('publish.skip') || 'דלג — הזן ידנית'}
        </button>
      </div>
    );
  }

  // Step 2 — form
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: bg, paddingTop: 64, padding: '64px 16px 60px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ color: text, fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{t('publish.title') || 'פרסום רכב'}</h2>

        {govData?.brand && (
          <p style={{ color: accent, fontSize: 13, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> {govData.brand} {govData.vehicleModel} {govData.year} — {t('publish.autoFilled') || 'מולא אוטומטית'}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Gov data summary */}
          {govData?.brand && (
            <div style={{ padding: 14, borderRadius: 12, background: card, border: `1px solid ${border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['יצרן', govData.brand], ['דגם', govData.vehicleModel], ['שנה', govData.year], ['צבע', govData.color], ['דלק', govData.engineType], ['נפח', govData.engineVolume ? `${govData.engineVolume} cc` : '']].filter(([, v]) => v).map(([l, v], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: textMuted }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          <Label text={`${t('publish.price') || 'מחיר (₪)'} *`} color={textMuted} />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150,000" type="number" style={inputStyle} />

          <Label text={`${t('publish.mileage') || "קילומטראז'"} *`} color={textMuted} />
          <input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="80,000" type="number" style={inputStyle} />

          <Label text={t('publish.transmission') || 'תיבת הילוכים'} color={textMuted} />
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)} style={inputStyle}>
            <option value="automatic">אוטומטית</option>
            <option value="manual">ידנית</option>
          </select>

          <Label text={`${t('publish.description') || 'תיאור'} *`} color={textMuted} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('publish.descPlaceholder') || 'ספר על הרכב...'} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />

          <Label text={t('publish.photos') || 'תמונות'} color={textMuted} />
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []))} style={inputStyle} />
          {photos.length > 0 && <p style={{ fontSize: 12, color: textMuted, margin: '-8px 0 0' }}>{photos.length} {t('publish.photosSelected') || 'תמונות נבחרו'}</p>}

          <button onClick={handlePublish} disabled={publishing} style={{
            padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: publishing ? 0.6 : 1, marginTop: 4, fontFamily: 'inherit',
          }}>
            {publishing ? '...' : (t('publish.publishBtn') || 'פרסם רכב')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ text, color }: { text: string; color: string }) {
  return <label style={{ fontSize: 12, fontWeight: 600, color, marginBottom: -6 }}>{text}</label>;
}
