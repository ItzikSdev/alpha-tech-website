import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, LogIn, Check, Camera, X, ArrowRight, ArrowLeft } from 'lucide-react';

const TRANSMISSION_OPTIONS = [
  { key: 'automatic', value: 'automatic', label: 'אוטומטי' },
  { key: 'manual', value: 'manual', label: 'ידני' },
  { key: 'semi-automatic', value: 'semi-automatic', label: 'חצי אוטומטי' },
];
const FUEL_OPTIONS = [
  { key: 'gasoline', value: 'gasoline', label: 'בנזין' },
  { key: 'diesel', value: 'diesel', label: 'דיזל' },
  { key: 'hybrid', value: 'hybrid', label: 'היברידי' },
  { key: 'electric', value: 'electric', label: 'חשמלי' },
  { key: 'plugin-hybrid', value: 'plugin-hybrid', label: 'פלאג-אין' },
];
const COLOR_OPTIONS = [
  { key: 'white', hex: '#FFFFFF' }, { key: 'black', hex: '#000000' }, { key: 'silver', hex: '#C0C0C0' },
  { key: 'gray', hex: '#808080' }, { key: 'red', hex: '#FF0000' }, { key: 'blue', hex: '#0000FF' },
  { key: 'green', hex: '#008000' }, { key: 'yellow', hex: '#FFD700' }, { key: 'brown', hex: '#8B4513' },
  { key: 'orange', hex: '#FF8C00' }, { key: 'beige', hex: '#F5F5DC' }, { key: 'champagne', hex: '#F7E7CE' },
];
const OWNERSHIP_OPTIONS = [
  { key: 'private', value: 'private', label: 'פרטי' },
  { key: 'company', value: 'company', label: 'חברה' },
  { key: 'leasing', value: 'leasing', label: 'ליסינג' },
  { key: 'dealer', value: 'dealer', label: 'סוחר' },
];

export default function PublishPage() {
  const { token } = useAuth();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDark = theme === 'dark';
  const isRTL = lang === 'he';

  const bg = isDark ? '#0D1117' : '#F8FAFC';
  const card = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#21262D' : '#E2E8F0';
  const text = isDark ? '#F0F6FC' : '#0F172A';
  const textMuted = isDark ? '#8B949E' : '#64748B';
  const accent = '#22D3EE';
  const accentBg = isDark ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.06)';

  const hasPrefill = searchParams.get('prefill') === '1';
  const [step, setStep] = useState<1 | 2>(hasPrefill ? 2 : 1);
  const [plate, setPlate] = useState(searchParams.get('plate') || '');
  const [lookingUp, setLookingUp] = useState(false);
  const [isGovPrefilled, setIsGovPrefilled] = useState(hasPrefill);

  // Form
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [mileage, setMileage] = useState(searchParams.get('mileage') || '');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [transmission, setTransmission] = useState('automatic');
  const [fuelType, setFuelType] = useState(searchParams.get('engineType') || '');
  const [description, setDescription] = useState('');
  const [previousOwners, setPreviousOwners] = useState(searchParams.get('owners') || '');
  const [engineVolume, setEngineVolume] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [doors, setDoors] = useState('');
  const [currentOwnership, setCurrentOwnership] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${border}`,
    background: card, color: text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', direction: isRTL ? 'rtl' : 'ltr',
  };

  if (!token) {
    return (
      <Center bg={bg} isRTL={isRTL}>
        <p style={{ color: textMuted }}>יש להתחבר כדי לפרסם</p>
        <button onClick={() => navigate('/login?from=/publish')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          <LogIn size={18} />כניסה
        </button>
      </Center>
    );
  }

  const handleLookup = async () => {
    const clean = plate.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    setLookingUp(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicleFields?: any }>(`/vehicles/lookup/${clean}`, { token });
      if (data.success && data.vehicleFields) {
        const vf = data.vehicleFields;
        if (vf.brand) setBrand(vf.brand);
        if (vf.vehicleModel) setModel(vf.vehicleModel);
        if (vf.year) setYear(String(vf.year));
        if (vf.color) setColor(vf.color);
        if (vf.engineType) setFuelType(vf.engineType);
        if (vf.engineVolume) setEngineVolume(String(vf.engineVolume));
        if (vf.horsepower) setHorsepower(String(vf.horsepower));
        if (vf.doors) setDoors(String(vf.doors));
        setIsGovPrefilled(true);
      }
    } catch { /* */ }
    setLookingUp(false);
    setStep(2);
  };

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 10));
    setPhotoUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 10));
  };

  const handleRemovePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePublish = async () => {
    if (!price || !description || !brand || !model) { alert('מלא שדות חובה'); return; }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('brand', brand); formData.append('vehicleModel', model);
      formData.append('year', year); formData.append('color', color);
      formData.append('price', price); formData.append('mileage', mileage);
      formData.append('description', description); formData.append('transmission', transmission);
      formData.append('fuelType', fuelType); formData.append('licensePlate', plate.replace(/[^0-9]/g, ''));
      if (previousOwners) formData.append('previousOwners', previousOwners);
      if (engineVolume) formData.append('engineVolume', engineVolume);
      if (horsepower) formData.append('horsepower', horsepower);
      if (doors) formData.append('doors', doors);
      if (currentOwnership) formData.append('currentOwnership', currentOwnership);
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
      <Center bg={bg} isRTL={isRTL}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 60, [isRTL ? 'right' : 'left']: 16, border: 'none', background: 'none', cursor: 'pointer', color: textMuted, display: 'flex' }}>
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <Upload size={48} color={accent} />
        <h2 style={{ color: text, fontSize: 22, fontWeight: 800, margin: 0 }}>פרסום רכב</h2>
        <p style={{ color: textMuted, margin: 0, fontSize: 14, textAlign: 'center' }}>הזן מספר רכב ונמלא את הפרטים אוטומטית</p>
        <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="1234567" style={{
          width: 240, padding: '16px 20px', borderRadius: 16, border: `2px solid ${accent}`, background: card, color: text,
          fontSize: 26, fontWeight: 800, letterSpacing: 5, textAlign: 'center', outline: 'none', fontFamily: 'inherit',
        }} />
        <button onClick={handleLookup} disabled={lookingUp || plate.replace(/[^0-9]/g, '').length < 5} style={{
          width: 240, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: lookingUp ? 0.6 : 1, fontFamily: 'inherit',
        }}>
          {lookingUp ? '...' : 'המשך'}
        </button>
        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          דלג — הזן ידנית
        </button>
      </Center>
    );
  }

  // Step 2 — full form (like app)
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: bg, paddingTop: 56, direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: textMuted, display: 'flex' }}>
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h2 style={{ color: text, fontSize: 20, fontWeight: 700, margin: 0 }}>פרסום רכב</h2>
        </div>
        {isGovPrefilled && brand && (
          <p style={{ color: accent, fontSize: 13, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> {brand} {model} {year} — מולא אוטומטית
          </p>
        )}

        {/* ── AI Banner ── */}
        <div style={{ padding: 12, borderRadius: 12, background: accentBg, border: `1px solid ${accent}30`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <span style={{ fontSize: 13, color: text }}>המערכת תבדוק את התמונות והפרטים באמצעות AI לפני הפרסום</span>
        </div>

        {/* ── Photos ── */}
        <SectionTitle text="תמונות" />
        <p style={{ fontSize: 12, color: textMuted, margin: '-4px 0 8px' }}>{photoUrls.length}/10</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {photoUrls.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden' }}>
              <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => handleRemovePhoto(i)} style={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, borderRadius: 11, background: bg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#EF4444" />
              </button>
            </div>
          ))}
          {photoUrls.length < 10 && (
            <label style={{ width: 80, height: 80, borderRadius: 12, border: `2px dashed ${border}`, background: card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
              <Camera size={24} color={accent} />
              <span style={{ fontSize: 11, color: accent }}>הוסף</span>
              <input type="file" accept="image/*" multiple onChange={handleAddPhotos} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* ── Specs ── */}
        <SectionTitle text="מפרט" />

        <Label text="יצרן *" color={textMuted} />
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" style={inputStyle} />

        <Label text="דגם *" color={textMuted} />
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" style={inputStyle} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><Label text="שנה *" color={textMuted} /><input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" type="number" style={inputStyle} /></div>
          <div><Label text="קילומטראז' *" color={textMuted} /><input value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="50,000" type="number" style={inputStyle} /></div>
        </div>

        <Label text="מחיר (₪) *" color={textMuted} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150,000" type="number" style={inputStyle} />

        {/* Color chips */}
        <Label text="צבע *" color={textMuted} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {COLOR_OPTIONS.map((c) => (
            <button key={c.key} onClick={() => setColor(color === c.key ? '' : c.key)} style={{
              width: 36, height: 36, borderRadius: 18, background: c.hex, border: color === c.key ? `3px solid ${accent}` : `2px solid ${border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {color === c.key && <Check size={16} color={c.key === 'white' || c.key === 'yellow' ? '#000' : '#fff'} />}
            </button>
          ))}
        </div>

        {/* Transmission chips */}
        <Label text="תיבת הילוכים *" color={textMuted} />
        <ChipRow options={TRANSMISSION_OPTIONS} selected={transmission} onSelect={setTransmission} accent={accent} card={card} border={border} textMuted={textMuted} accentBg={accentBg} />

        {/* Fuel chips */}
        <Label text="סוג דלק *" color={textMuted} />
        <ChipRow options={FUEL_OPTIONS} selected={fuelType} onSelect={setFuelType} accent={accent} card={card} border={border} textMuted={textMuted} accentBg={accentBg} />

        {/* Description */}
        <Label text="תיאור *" color={textMuted} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 1000))} placeholder="ספר על הרכב..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        <p style={{ fontSize: 11, color: textMuted, margin: '-4px 0 8px', textAlign: 'left' }}>{description.length}/1000</p>

        {/* ── Additional ── */}
        <SectionTitle text="פרטים נוספים" />

        <Label text="מספר ידיים *" color={textMuted} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button key={n} onClick={() => setPreviousOwners(String(n))} style={{
              width: 36, height: 36, borderRadius: 10, border: previousOwners === String(n) ? `2px solid ${accent}` : `1px solid ${border}`,
              background: previousOwners === String(n) ? accentBg : card, color: previousOwners === String(n) ? accent : textMuted,
              fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{n}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><Label text="נפח מנוע *" color={textMuted} /><input value={engineVolume} onChange={(e) => setEngineVolume(e.target.value)} placeholder="1600" type="number" style={inputStyle} /></div>
          <div><Label text="כוח סוס *" color={textMuted} /><input value={horsepower} onChange={(e) => setHorsepower(e.target.value)} placeholder="150" type="number" style={inputStyle} /></div>
        </div>

        <Label text="דלתות *" color={textMuted} />
        <ChipRow options={[{key:'2',value:'2',label:'2'},{key:'3',value:'3',label:'3'},{key:'4',value:'4',label:'4'},{key:'5',value:'5',label:'5'}]} selected={doors} onSelect={setDoors} accent={accent} card={card} border={border} textMuted={textMuted} accentBg={accentBg} />

        <Label text="סוג בעלות *" color={textMuted} />
        <ChipRow options={OWNERSHIP_OPTIONS} selected={currentOwnership} onSelect={setCurrentOwnership} accent={accent} card={card} border={border} textMuted={textMuted} accentBg={accentBg} />

        {/* Submit */}
        <button onClick={handlePublish} disabled={publishing} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: publishing ? 0.6 : 1,
          marginTop: 20, fontFamily: 'inherit',
        }}>
          {publishing ? 'מפרסם...' : 'פרסם רכב'}
        </button>
      </div>
    </div>
  );
}

function Center({ children, bg, isRTL }: { children: React.ReactNode; bg: string; isRTL: boolean }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: bg, paddingTop: 48, padding: 32, direction: isRTL ? 'rtl' : 'ltr' }}>
      {children}
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '20px 0 10px' }}>{text}</h3>;
}

function Label({ text, color }: { text: string; color: string }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color, margin: '10px 0 4px' }}>{text}</label>;
}

function ChipRow({ options, selected, onSelect, accent, card, border, textMuted, accentBg }: {
  options: { key: string; value: string; label: string }[]; selected: string;
  onSelect: (v: string) => void; accent: string; card: string; border: string; textMuted: string; accentBg: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
      {options.map((o) => (
        <button key={o.key} onClick={() => onSelect(o.value)} style={{
          padding: '8px 16px', borderRadius: 50,
          border: selected === o.value ? `2px solid ${accent}` : `1px solid ${border}`,
          background: selected === o.value ? accentBg : card,
          color: selected === o.value ? accent : textMuted,
          fontSize: 13, fontWeight: selected === o.value ? 600 : 400,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>{o.label}</button>
      ))}
    </div>
  );
}
