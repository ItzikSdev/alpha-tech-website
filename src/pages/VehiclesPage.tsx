import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { apiFetch } from '../lib/api';

interface Vehicle {
  _id: string;
  brand: string;
  vehicleModel: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  photos: string[];
  engineType: string;
  transmission: string;
  previousOwners?: number;
  location?: { address: string };
}

export default function VehiclesPage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12', sortBy: 'createdAt', sortOrder: 'desc' });
      if (search) params.append('search', search);
      const data = await apiFetch<{ success: boolean; vehicles: Vehicle[]; pagination: { pages: number } }>(`/vehicles?${params}`);
      if (data.success) { setVehicles(data.vehicles); setTotalPages(data.pagination.pages); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const fuelLabel: Record<string, string> = { gasoline: 'בנזין', diesel: 'דיזל', electric: 'חשמלי', hybrid: 'היברידי' };
  const transLabel: Record<string, string> = { automatic: 'אוטומטי', manual: 'ידני' };

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="app-search">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('vehicles.search') || 'חפש יצרן, דגם...'}
          />
          <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 20px', fontSize: 14, whiteSpace: 'nowrap' }}>
            {t('vehicles.aiSearch') || 'חיפוש AI'}
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.loading') || 'טוען...'}</p>
        ) : vehicles.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('vehicles.empty') || 'לא נמצאו רכבים'}</p>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <Link key={v._id} to={`/vehicle/${v._id}`} className="vehicle-card">
                <div
                  className="vehicle-card-photo"
                  style={v.photos?.[0] ? { backgroundImage: `url(${v.photos[0]})` } : undefined}
                >
                  {!v.photos?.[0] && <span style={{ fontSize: 40, opacity: 0.2 }}>🚗</span>}
                </div>
                <div className="vehicle-card-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3>{v.brand} {v.vehicleModel}</h3>
                    <span className="vehicle-card-price">₪{v.price?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      v.year && String(v.year),
                      v.mileage && `${v.mileage.toLocaleString()} ק"מ`,
                      v.engineType && fuelLabel[v.engineType],
                      v.transmission && transLabel[v.transmission],
                      v.previousOwners != null && `יד ${v.previousOwners}`,
                    ].filter(Boolean).map((tag, i) => (
                      <span key={i} className="vehicle-tag">{tag}</span>
                    ))}
                  </div>
                  {v.location?.address && (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>📍 {v.location.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={p === page ? 'btn-primary' : 'btn-secondary'}
                style={{ width: 36, height: 36, padding: 0, borderRadius: 10, fontSize: 14 }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
