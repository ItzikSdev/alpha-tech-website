import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

interface MaintenanceVehicle {
  _id: string;
  plateNumber: string;
  nickname?: string;
  brand?: string;
  vehicleModel?: string;
  year?: number;
  color?: string;
  motDate?: string;
  ownerCount?: number;
  lastOdometer?: number;
  hasOpenRecalls?: boolean;
  serviceRecords?: any[];
}

export default function MyVehiclesPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleAdd = async () => {
    const clean = plate.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    setAdding(true);
    try {
      const data = await apiFetch<{ success: boolean; vehicle: MaintenanceVehicle }>(
        '/maintenance', { method: 'POST', body: { plateNumber: clean }, token: token! }
      );
      if (data.success && data.vehicle) {
        setVehicles((prev) => [data.vehicle, ...prev]);
        setPlate(''); setShowAdd(false);
      }
    } catch (err: any) { alert(err?.message || 'Error'); }
    setAdding(false);
  };

  if (!token) {
    return (
      <div className="plate-input-full">
        <p style={{ color: 'var(--text-secondary)' }}>{t('myVehicles.loginRequired') || 'יש להתחבר כדי לראות את הרכבים שלך'}</p>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
          {t('nav.login') || 'כניסה'}
        </Link>
      </div>
    );
  }

  // Empty state
  if (!loading && vehicles.length === 0 && !showAdd) {
    return (
      <div className="plate-input-full">
        <div style={{ fontSize: 56 }}>🚗</div>
        <h2 style={{ color: 'var(--text)', fontSize: 24, fontWeight: 700, margin: 0 }}>
          {t('myVehicles.title') || 'הרכבים שלי'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          {t('myVehicles.enterPlate') || 'הזן מספר רכב'}
        </p>
        <input
          className="plate-input-field"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="1234567"
        />
        <button
          className="btn-primary"
          onClick={handleAdd}
          disabled={adding || plate.replace(/[^0-9]/g, '').length < 5}
          style={{ width: 280, padding: '16px', fontSize: 16, opacity: adding ? 0.6 : 1 }}
        >
          {adding ? (t('myVehicles.lookingUp') || 'מאתר...') : (t('myVehicles.addVehicle') || 'הוסף רכב')}
        </button>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-page-narrow">
        <h2>{t('myVehicles.title') || 'הרכבים שלי'}</h2>

        {showAdd && (
          <div style={{
            padding: 20, borderRadius: 16, border: '2px solid var(--accent)',
            background: 'var(--bg-card)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
          }}>
            <input
              className="plate-input-field"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="1234567"
              autoFocus
              style={{ width: '100%', fontSize: 22, padding: '14px 18px' }}
            />
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button className="btn-secondary" onClick={() => { setShowAdd(false); setPlate(''); }} style={{ flex: 1, padding: 12 }}>
                {t('common.cancel') || 'ביטול'}
              </button>
              <button className="btn-primary" onClick={handleAdd} disabled={adding} style={{ flex: 2, padding: 12, opacity: adding ? 0.6 : 1 }}>
                {adding ? '...' : (t('myVehicles.addVehicle') || 'הוסף רכב')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{t('common.loading') || 'טוען...'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vehicles.map((v) => {
              const motDays = v.motDate ? Math.ceil((new Date(v.motDate).getTime() - Date.now()) / (86400000)) : null;
              return (
                <div
                  key={v._id}
                  onClick={() => navigate(`/my-vehicles/${v._id}`)}
                  className="vehicle-card"
                  style={{ padding: 16, display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span className="app-badge app-badge-accent" style={{ fontWeight: 800, letterSpacing: 1 }}>{v.plateNumber}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {v.nickname || `${v.brand ?? ''} ${v.vehicleModel ?? ''}`.trim() || v.plateNumber}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>›</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {v.ownerCount != null && <span className="app-badge app-badge-accent">{v.ownerCount} ידיים</span>}
                    {v.lastOdometer != null && <span className="app-badge app-badge-muted">{v.lastOdometer.toLocaleString()} ק"מ</span>}
                    {v.hasOpenRecalls && <span className="app-badge app-badge-danger">⚠ ריקול</span>}
                    {motDays !== null && (
                      <span className={`app-badge ${motDays < 30 ? 'app-badge-danger' : 'app-badge-muted'}`}>
                        טסט: {new Date(v.motDate!).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {vehicles.length > 0 && !showAdd && (
        <button className="app-fab" onClick={() => setShowAdd(true)}>+</button>
      )}
    </div>
  );
}
