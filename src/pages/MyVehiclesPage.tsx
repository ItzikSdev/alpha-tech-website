import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, AlertTriangle, Gauge, Users, ShieldCheck, LogIn } from 'lucide-react';

interface MaintenanceVehicle {
  _id: string; plateNumber: string; nickname?: string; brand?: string; vehicleModel?: string;
  year?: number; color?: string; motDate?: string; ownerCount?: number; lastOdometer?: number;
  hasOpenRecalls?: boolean; serviceRecords?: any[];
}

export default function MyVehiclesPage() {
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

  const [vehicles, setVehicles] = useState<MaintenanceVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [plate, setPlate] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicles: MaintenanceVehicle[] }>('/maintenance', { token });
      if (data.success) setVehicles(data.vehicles);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleAdd = async () => {
    const clean = plate.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    setAdding(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicle: MaintenanceVehicle }>('/maintenance', { method: 'POST', body: { plateNumber: clean }, token: token! });
      if (data.success && data.vehicle) { setVehicles((prev) => [data.vehicle, ...prev]); setPlate(''); setShowAdd(false); }
    } catch (err: any) { alert(err?.message || 'Error'); }
    setAdding(false);
  };

  // Login required
  if (!token) {
    return (
      <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: bg, paddingTop: 48, direction: isRTL ? 'rtl' : 'ltr' }}>
        <p style={{ color: textMuted }}>{t('myVehicles.loginRequired') || 'יש להתחבר'}</p>
        <button onClick={() => navigate('/login?from=/my-vehicles')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          <LogIn size={18} />{t('nav.login') || 'כניסה'}
        </button>
      </div>
    );
  }

  // Empty state — plate input
  if (!loading && vehicles.length === 0 && !showAdd) {
    return (
      <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: bg, paddingTop: 48, padding: 32, direction: isRTL ? 'rtl' : 'ltr' }}>
        <Car size={56} color={accent} />
        <h2 style={{ color: text, fontSize: 22, fontWeight: 800, margin: 0 }}>{t('myVehicles.title') || 'הרכבים שלי'}</h2>
        <p style={{ color: textMuted, margin: 0, fontSize: 14 }}>{t('myVehicles.enterPlate') || 'הזן מספר רכב'}</p>
        <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="1234567" style={{
          width: 240, padding: '16px 20px', borderRadius: 16, border: `2px solid ${accent}`, background: card, color: text,
          fontSize: 26, fontWeight: 800, letterSpacing: 5, textAlign: 'center', outline: 'none', fontFamily: 'inherit',
        }} />
        <button onClick={handleAdd} disabled={adding || plate.replace(/[^0-9]/g, '').length < 5} style={{
          width: 240, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: adding ? 0.6 : 1, fontFamily: 'inherit',
        }}>
          {adding ? '...' : (t('myVehicles.addVehicle') || 'הוסף רכב')}
        </button>
      </div>
    );
  }

  // Vehicle list
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: bg, paddingTop: 64, padding: '64px 16px 100px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ color: text, fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>{t('myVehicles.title') || 'הרכבים שלי'}</h2>

        {/* Inline add */}
        {showAdd && (
          <div style={{ padding: 16, borderRadius: 16, border: `2px solid ${accent}`, background: card, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="1234567" autoFocus style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${border}`, background: bg, color: text,
              fontSize: 20, fontWeight: 800, letterSpacing: 4, textAlign: 'center', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }} />
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => { setShowAdd(false); setPlate(''); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t('common.cancel') || 'ביטול'}
              </button>
              <button onClick={handleAdd} disabled={adding} style={{ flex: 2, padding: 10, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: adding ? 0.6 : 1, fontFamily: 'inherit' }}>
                {adding ? '...' : (t('myVehicles.addVehicle') || 'הוסף רכב')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: textMuted }}>{t('common.loading') || 'טוען...'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vehicles.map((v) => {
              const motDays = v.motDate ? Math.ceil((new Date(v.motDate).getTime() - Date.now()) / 86400000) : null;
              return (
                <div key={v._id} onClick={() => navigate(`/my-vehicles/${v._id}`)} style={{
                  padding: 14, borderRadius: 14, border: `1px solid ${border}`, background: card, cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ padding: '3px 8px', borderRadius: 6, background: `${accent}15`, color: accent, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>{v.plateNumber}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: text }}>{v.nickname || `${v.brand ?? ''} ${v.vehicleModel ?? ''}`.trim() || v.plateNumber}</span>
                    <span style={{ color: textMuted, fontSize: 18 }}>‹</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {v.ownerCount != null && <Badge icon={<Users size={11} />} text={`${v.ownerCount} ידיים`} color={accent} />}
                    {v.lastOdometer != null && <Badge icon={<Gauge size={11} />} text={`${v.lastOdometer.toLocaleString()} ק"מ`} color={textMuted} bg={isDark ? '#1E1E1E' : '#F5F5F5'} />}
                    {v.hasOpenRecalls && <Badge icon={<AlertTriangle size={11} />} text="ריקול" color="#EF4444" bg="#EF444415" />}
                    {motDays !== null && <Badge icon={<ShieldCheck size={11} />} text={`טסט: ${new Date(v.motDate!).toLocaleDateString()}`} color={motDays < 30 ? '#EF4444' : textMuted} bg={motDays < 30 ? '#EF444415' : isDark ? '#1E1E1E' : '#F5F5F5'} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {vehicles.length > 0 && !showAdd && (
        <button onClick={() => setShowAdd(true)} style={{
          position: 'fixed', bottom: 24, right: 64, width: 52, height: 52, borderRadius: 26, border: 'none',
          background: 'linear-gradient(135deg, #22D3EE, #0891B2)', color: '#fff', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

function Badge({ icon, text, color, bg }: { icon: React.ReactNode; text: string; color: string; bg?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 6, background: bg || `${color}15`, color, fontSize: 11, fontWeight: 500 }}>
      {icon}{text}
    </span>
  );
}
