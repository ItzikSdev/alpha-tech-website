import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

interface GovData {
  brand?: string;
  vehicleModel?: string;
  year?: number;
  color?: string;
  engineType?: string;
  engineVolume?: number;
  horsepower?: number;
  doors?: number;
  testUntil?: string;
  firstRegistration?: string;
  autoDescription?: string;
}

export default function PublishPage() {
  const { token } = useAuth();
  const { t, lang: language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isRTL = language === 'he';

  // Step 1: plate input, Step 2: form
  const [step, setStep] = useState<1 | 2>(1);
  const [plate, setPlate] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [govData, setGovData] = useState<GovData | null>(null);

  // Form fields
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [transmission, setTransmission] = useState('automatic');
  const [photos, setPhotos] = useState<File[]>([]);
  const [publishing, setPublishing] = useState(false);

  if (!token) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('publish.loginRequired') || 'יש להתחבר כדי לפרסם'}</p>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
          {t('nav.login') || 'כניסה'}
        </Link>
      </div>
    );
  }

  const handleLookup = async () => {
    const clean = plate.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    setLookingUp(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicleFields?: GovData }>(`/vehicles/lookup/${clean}`, { token });
      if (data.success && data.vehicleFields) {
        setGovData(data.vehicleFields);
      }
    } catch { /* ignore */ }
    setLookingUp(false);
    setStep(2);
  };

  const handlePublish = async () => {
    if (!price || !description) {
      alert(t('publish.fillRequired') || 'מלא מחיר ותיאור');
      return;
    }
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

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.alpha-tech.live'}/api/v1/vehicles`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.success) {
        navigate(`/vehicle/${data.vehicle._id}`);
      } else {
        alert(data.error?.message || data.message || 'Error');
      }
    } catch (err: any) {
      alert(err?.message || 'Error');
    }
    setPublishing(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1px solid ${isDark ? '#333' : '#ddd'}`,
    backgroundColor: isDark ? '#141414' : '#fff',
    color: isDark ? '#fff' : '#111',
    fontSize: 15,
    outline: 'none' as const,
  };

  // Step 1: plate input
  if (step === 1) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
        direction: isRTL ? 'rtl' : 'ltr',
        padding: 32,
      }}>
        <div style={{ fontSize: 56 }}>📝</div>
        <h2 style={{ color: isDark ? '#fff' : '#111', fontSize: 24, fontWeight: 700, margin: 0 }}>
          {t('publish.title') || 'פרסום רכב'}
        </h2>
        <p style={{ color: isDark ? '#888' : '#666', margin: 0, textAlign: 'center' }}>
          {t('publish.subtitle') || 'הזן מספר רכב ונמלא את הפרטים אוטומטית'}
        </p>
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="1234567"
          style={{
            width: 280, padding: '18px 24px', borderRadius: 20, border: '2px solid #3b82f6',
            backgroundColor: isDark ? '#141414' : '#fff', color: isDark ? '#fff' : '#111',
            fontSize: 28, fontWeight: 800, letterSpacing: 6, textAlign: 'center', outline: 'none',
          }}
        />
        <button
          onClick={handleLookup}
          disabled={lookingUp || plate.replace(/[^0-9]/g, '').length < 5}
          style={{
            width: 280, padding: '16px', borderRadius: 14, border: 'none',
            backgroundColor: '#3b82f6', color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', opacity: lookingUp ? 0.6 : 1,
          }}
        >
          {lookingUp ? (t('publish.lookingUp') || 'מאתר פרטי רכב...') : (t('publish.continue') || 'המשך')}
        </button>
        <button
          onClick={() => setStep(2)}
          style={{
            background: 'none', border: 'none', color: isDark ? '#666' : '#999',
            fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          {t('publish.skip') || 'דלג — הזן ידנית'}
        </button>
      </div>
    );
  }

  // Step 2: form
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
      direction: isRTL ? 'rtl' : 'ltr',
      padding: '24px 16px 60px',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ color: isDark ? '#fff' : '#111', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
          {t('publish.title') || 'פרסום רכב'}
        </h2>
        {govData?.brand && (
          <p style={{ color: '#3b82f6', fontSize: 14, margin: '0 0 20px' }}>
            ✅ {govData.brand} {govData.vehicleModel} {govData.year} — {t('publish.autoFilled') || 'מולא אוטומטית'}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Auto-filled fields (read-only) */}
          {govData?.brand && (
            <div style={{
              padding: 16, borderRadius: 14,
              backgroundColor: isDark ? '#141414' : '#fff',
              border: `1px solid ${isDark ? '#222' : '#eee'}`,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['יצרן', govData.brand],
                  ['דגם', govData.vehicleModel],
                  ['שנה', govData.year],
                  ['צבע', govData.color],
                  ['דלק', govData.engineType],
                  ['נפח מנוע', govData.engineVolume ? `${govData.engineVolume} cc` : ''],
                ].filter(([, v]) => v).map(([label, val], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: isDark ? '#666' : '#999' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User fields */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#555', display: 'block', marginBottom: 6 }}>
              {t('publish.price') || 'מחיר (₪)'} *
            </label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150,000" type="number" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#555', display: 'block', marginBottom: 6 }}>
              {t('publish.mileage') || 'קילומטראז\''} *
            </label>
            <input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="80,000" type="number" style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#555', display: 'block', marginBottom: 6 }}>
              {t('publish.transmission') || 'תיבת הילוכים'}
            </label>
            <select value={transmission} onChange={(e) => setTransmission(e.target.value)} style={inputStyle}>
              <option value="automatic">אוטומטית</option>
              <option value="manual">ידנית</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#555', display: 'block', marginBottom: 6 }}>
              {t('publish.description') || 'תיאור'} *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('publish.descPlaceholder') || 'ספר על הרכב...'}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#555', display: 'block', marginBottom: 6 }}>
              {t('publish.photos') || 'תמונות'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files || []))}
              style={inputStyle}
            />
            {photos.length > 0 && (
              <p style={{ fontSize: 12, color: isDark ? '#666' : '#999', margin: '6px 0 0' }}>
                {photos.length} {t('publish.photosSelected') || 'תמונות נבחרו'}
              </p>
            )}
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              padding: '16px', borderRadius: 14, border: 'none',
              backgroundColor: '#3b82f6', color: '#fff', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', opacity: publishing ? 0.6 : 1, marginTop: 8,
            }}
          >
            {publishing ? (t('publish.publishing') || 'מפרסם...') : (t('publish.publishBtn') || 'פרסם רכב')}
          </button>
        </div>
      </div>
    </div>
  );
}
