import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { ArrowRight, ArrowLeft, Tag, Pencil, Trash2, RefreshCw, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface Vehicle {
  _id: string; plateNumber: string; nickname?: string; brand?: string; vehicleModel?: string;
  year?: number; color?: string; motDate?: string; lastMotDate?: string; engineType?: string;
  engineVolume?: number; horsepower?: number; doors?: number; fuelType?: string; safetyRating?: number;
  pollutionLevel?: number; firstRegistration?: string; trimLevel?: string;
  ownerCount?: number; ownershipHistory?: { date: string; ownershipType: string }[];
  lastOdometer?: number; hasStructuralChanges?: boolean;
  structuralChanges?: { colorChange?: boolean; tireChange?: boolean; lpgConversion?: boolean };
  hasOpenRecalls?: boolean; openRecalls?: { recallId: number; faultCategory?: string; faultDescription?: string }[];
  govDataLastUpdated?: string; photos?: string[]; serviceRecords?: any[];
}

export default function MyVehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'info' | 'service'>('info');
  const [editNickname, setEditNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  const fetchVehicle = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await apiFetch<{ success: boolean; vehicle: Vehicle }>(`/maintenance/${id}`, { token });
      if (data.success) setVehicle(data.vehicle);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [token, id]);

  useEffect(() => { fetchVehicle(); }, [fetchVehicle]);

  const handleRefresh = async () => {
    if (!token || !id) return;
    setRefreshing(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicle: Vehicle }>(`/maintenance/${id}/refresh`, { method: 'POST', token });
      if (data.success) setVehicle(data.vehicle);
    } catch { /* */ }
    setRefreshing(false);
  };

  const handleDelete = async () => {
    const name = vehicle?.nickname || `${vehicle?.brand ?? ''} ${vehicle?.vehicleModel ?? ''}`.trim() || vehicle?.plateNumber;
    if (!confirm(`להסיר את ${name} מהרשימה?`)) return;
    try {
      await apiFetch(`/maintenance/${id}`, { method: 'DELETE', token: token! });
      navigate('/my-vehicles');
    } catch { /* */ }
  };

  const handleSaveNickname = async () => {
    try {
      const data = await apiFetch<{ success: boolean; vehicle: Vehicle }>(`/maintenance/${id}`, { method: 'PUT', body: { nickname: nicknameInput.trim() }, token: token! });
      if (data.success) setVehicle(data.vehicle);
    } catch { /* */ }
    setEditNickname(false);
  };

  const handleSell = () => {
    if (!vehicle) return;
    const params = new URLSearchParams({
      plate: vehicle.plateNumber,
      brand: vehicle.brand || '',
      model: vehicle.vehicleModel || '',
      year: String(vehicle.year || ''),
      color: vehicle.color || '',
      engineType: vehicle.engineType || '',
      mileage: String(vehicle.lastOdometer || ''),
      owners: String(vehicle.ownerCount || ''),
    });
    navigate(`/publish?prefill=1&${params}`);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: textMuted }}>טוען...</div>;
  if (!vehicle) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: textMuted }}>לא נמצא</div>;

  const motDays = vehicle.motDate ? Math.ceil((new Date(vehicle.motDate).getTime() - Date.now()) / 86400000) : null;
  const vehicleName = vehicle.nickname || `${vehicle.brand ?? ''} ${vehicle.vehicleModel ?? ''}`.trim() || vehicle.plateNumber;

  const specs: [string, string][] = [
    vehicle.brand ? ['יצרן', vehicle.brand] : null,
    vehicle.vehicleModel ? ['דגם', vehicle.vehicleModel] : null,
    vehicle.year ? ['שנה', String(vehicle.year)] : null,
    vehicle.color ? ['צבע', vehicle.color] : null,
    vehicle.engineType ? ['דלק', vehicle.engineType] : null,
    vehicle.engineVolume ? ['נפח מנוע', `${vehicle.engineVolume} cc`] : null,
    vehicle.horsepower ? ['כוח סוס', `${vehicle.horsepower} KW`] : null,
    vehicle.doors ? ['דלתות', String(vehicle.doors)] : null,
    vehicle.safetyRating != null ? ['בטיחות', String(vehicle.safetyRating)] : null,
    vehicle.trimLevel ? ['רמת גימור', vehicle.trimLevel] : null,
    vehicle.firstRegistration ? ['עלייה לכביש', new Date(vehicle.firstRegistration).toLocaleDateString()] : null,
    vehicle.ownerCount != null ? ['ידיים', String(vehicle.ownerCount)] : null,
    vehicle.lastOdometer != null ? ["ק\"מ בטסט אחרון", vehicle.lastOdometer.toLocaleString()] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: bg, paddingTop: 48, direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate('/my-vehicles')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: textMuted, display: 'flex' }}>
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: text }}>{vehicleName}</h2>
            <span style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: 1 }}>{vehicle.plateNumber}</span>
          </div>
          <button onClick={handleDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
            <Trash2 size={20} />
          </button>
        </div>

        {/* Top actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={handleSell} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px', borderRadius: 12, border: '1px solid #22C55E40', background: '#22C55E15',
            color: '#22C55E', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Tag size={16} /> מכור רכב זה
          </button>
          <button onClick={() => { setNicknameInput(vehicle.nickname || ''); setEditNickname(!editNickname); }} style={{
            width: 40, height: 40, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent',
            color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pencil size={16} />
          </button>
        </div>

        {/* Nickname edit */}
        {editNickname && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} placeholder="כינוי..." style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${accent}`, background: bg, color: text, fontSize: 14, outline: 'none', fontFamily: 'inherit',
            }} />
            <button onClick={handleSaveNickname} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: accent, color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>שמור</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${border}`, marginBottom: 16 }}>
          {(['info', 'service'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
              borderBottom: tab === t ? `2px solid ${accent}` : '2px solid transparent',
              color: tab === t ? accent : textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {t === 'info' ? 'פרטים' : 'טיפולים'}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <>
            {/* Specs table */}
            <div style={{ borderRadius: 14, border: `1px solid ${border}`, background: card, overflow: 'hidden', marginBottom: 12 }}>
              {specs.map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: i > 0 ? `1px solid ${border}` : 'none' }}>
                  <span style={{ fontSize: 12, color: textMuted }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* MOT card */}
            {vehicle.motDate && (
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${motDays !== null && motDays < 30 ? '#EF4444' : accent + '40'}`, background: motDays !== null && motDays < 30 ? '#EF444412' : card, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <ShieldCheck size={18} color={motDays !== null && motDays < 30 ? '#EF4444' : accent} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: motDays !== null && motDays < 30 ? '#EF4444' : text }}>תוקף טסט</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: motDays !== null && motDays < 30 ? '#EF4444' : text }}>{new Date(vehicle.motDate).toLocaleDateString()}</div>
                {motDays !== null && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: motDays < 30 ? '#EF4444' : motDays < 60 ? '#F59E0B' : '#22C55E' }}>
                    {motDays < 0 ? 'פג תוקף!' : `${motDays} ימים`}
                  </span>
                )}
              </div>
            )}

            {/* Recalls */}
            {vehicle.hasOpenRecalls && (
              <div style={{ padding: 12, borderRadius: 12, background: '#EF444412', border: '1px solid #EF444430', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ShieldAlert size={16} color="#EF4444" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>קריאות תיקון פתוחות!</span>
                </div>
                {vehicle.openRecalls?.map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>{r.faultCategory}: {r.faultDescription}</div>
                ))}
              </div>
            )}
            {vehicle.hasOpenRecalls === false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: '#22C55E12', border: '1px solid #22C55E30', marginBottom: 10 }}>
                <CheckCircle size={14} color="#22C55E" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E' }}>אין קריאות תיקון פתוחות</span>
              </div>
            )}

            {/* Structural changes */}
            {vehicle.hasStructuralChanges && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: '#F59E0B12', border: '1px solid #F59E0B30', marginBottom: 10 }}>
                <AlertTriangle size={14} color="#F59E0B" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>
                  שינויי מבנה: {[vehicle.structuralChanges?.colorChange && 'צבע', vehicle.structuralChanges?.tireChange && 'צמיגים', vehicle.structuralChanges?.lpgConversion && 'גפ"מ'].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Refresh */}
            <button onClick={handleRefresh} disabled={refreshing} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: 10, borderRadius: 10,
              border: `1px solid ${border}`, background: 'transparent', color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> רענן נתונים
            </button>
          </>
        )}

        {/* Service tab */}
        {tab === 'service' && (
          <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
            {vehicle.serviceRecords && vehicle.serviceRecords.length > 0 ? (
              vehicle.serviceRecords.map((rec: any, i: number) => (
                <div key={i} style={{ padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: card, marginBottom: 8, textAlign: 'start' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{rec.type}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>{new Date(rec.date).toLocaleDateString()}{rec.mileage ? ` · ${rec.mileage.toLocaleString()} ק"מ` : ''}{rec.cost ? ` · ₪${rec.cost}` : ''}</div>
                  {rec.description && <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>{rec.description}</div>}
                </div>
              ))
            ) : (
              <p>אין טיפולים מתועדים עדיין</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
