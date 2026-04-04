import { useState, useEffect, useCallback, useRef } from 'react';
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
  listingType?: 'private' | 'importer';
  importerName?: string;
  horsepower?: number;
  youtubeVideoId?: string;
  importerPhone?: string;
}

export default function VehiclesPage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterFuel, setFilterFuel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string; nameEn: string; logo: string }[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load brands on mount
  useEffect(() => {
    apiFetch<{ success: boolean; brands: { id: string; name: string; nameEn: string; logo: string }[] }>('/vehicles/brands')
      .then((d) => { if (d.success) setBrands(d.brands || []); })
      .catch(() => {});
  }, []);

  const fetchVehicles = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '12', sortBy: 'createdAt', sortOrder: 'desc' });
      if (search) params.append('search', search);
      if (filterBrand) params.append('brand', filterBrand);
      if (filterMinPrice) params.append('minPrice', filterMinPrice);
      if (filterMaxPrice) params.append('maxPrice', filterMaxPrice);
      if (filterFuel) params.append('engineType', filterFuel);
      const data = await apiFetch<{ success: boolean; vehicles: Vehicle[]; pagination: { pages: number; page: number } }>(`/vehicles?${params}`);
      if (data.success) {
        setVehicles(prev => append ? [...prev, ...data.vehicles] : data.vehicles);
        setHasMore(pageNum < data.pagination.pages);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [search, filterBrand, filterMinPrice, filterMaxPrice, filterFuel]);

  // Initial load + search/filter reset
  useEffect(() => { setPage(1); setVehicles([]); setHasMore(true); fetchVehicles(1, false); }, [fetchVehicles]);

  // Load more when page changes (after initial)
  useEffect(() => { if (page > 1) fetchVehicles(page, true); }, [page, fetchVehicles]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) setPage(p => p + 1); },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading]);

  const fuelLabel: Record<string, string> = { gasoline: 'בנזין', diesel: 'דיזל', electric: 'חשמלי', hybrid: 'היברידי', 'plug-in-hybrid': 'פלאג-אין' };
  const transLabel: Record<string, string> = { automatic: 'אוטומטי', manual: 'ידני' };

  return (
    <div className="app-page">
      <div className="app-page-inner">
        {/* Search + filter toggle */}
        <div className="app-search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('vehicles.search') || 'חפש יצרן, דגם...'}
          />
          <button
            onClick={() => setShowFilters(prev => !prev)}
            style={{
              padding: '12px 16px', borderRadius: 12, border: `1px solid var(--border)`,
              background: showFilters ? 'var(--accent)' : 'transparent',
              color: showFilters ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {showFilters ? '✕ סגור' : '⚙ סינון'}
          </button>
        </div>

        {/* AI search link */}
        <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
          <Link to="/chat" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>
            🔍 לחיפוש מיטבי עם AI לחץ כאן
          </Link>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
            padding: 12, borderRadius: 14,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <select
              value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
              style={{ flex: '1 1 140px', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
            >
              <option value="">כל היצרנים</option>
              {brands.map((b) => (
                <option key={b.id} value={b.nameEn}>{b.name} — {b.nameEn}</option>
              ))}
            </select>
            <input
              value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)}
              placeholder="מחיר מינימום" type="number" style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
            />
            <input
              value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)}
              placeholder="מחיר מקסימום" type="number" style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
            />
            <select
              value={filterFuel} onChange={(e) => setFilterFuel(e.target.value)}
              style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }}
            >
              <option value="">סוג דלק</option>
              <option value="gasoline">בנזין</option>
              <option value="diesel">דיזל</option>
              <option value="electric">חשמלי</option>
              <option value="hybrid">היברידי</option>
              <option value="plug-in-hybrid">פלאג-אין</option>
            </select>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('common.loading') || 'טוען...'}</p>
        ) : vehicles.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>{t('vehicles.empty') || 'לא נמצאו רכבים'}</p>
        ) : (
          <div className="vehicle-grid">
            {vehicles.map((v) => {
              const isImporter = v.listingType === 'importer';
              return (
                <Link key={v._id} to={`/vehicle/${v._id}`} className="vehicle-card" style={{ border: 'none' }}>
                  <div className="vehicle-card-photo" style={{ position: 'relative' }}>
                    {v.photos?.[0] ? (
                      <img src={v.photos[0]} alt={`${v.brand} ${v.vehicleModel}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    ) : (
                      <span style={{ fontSize: 40, opacity: 0.2 }}>🚗</span>
                    )}
                    {isImporter && (
                      <span style={{
                        position: 'absolute', top: 8, right: 8,
                        background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 700,
                        padding: '3px 8px', borderRadius: 8,
                      }}>
                        ⭐ חדש מהיבואן
                      </span>
                    )}
                  </div>
                  <div className="vehicle-card-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3>{v.brand} {v.vehicleModel}</h3>
                      <div style={{ textAlign: 'left' }}>
                        {isImporter && <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>מחירון יבואן</div>}
                        <span className="vehicle-card-price">₪{v.price?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        v.year && String(v.year),
                        isImporter ? '0 ק"מ · חדש' : (v.mileage ? `${v.mileage.toLocaleString()} ק"מ` : null),
                        v.engineType && (fuelLabel[v.engineType] || v.engineType),
                        v.horsepower && `${v.horsepower} כ"ס`,
                        !isImporter && v.previousOwners != null && `יד ${v.previousOwners}`,
                      ].filter(Boolean).map((tag, i) => (
                        <span key={i} className="vehicle-tag" style={isImporter && i === 1 ? { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontWeight: 700 } : undefined}>{tag}</span>
                      ))}
                    </div>
                    {isImporter ? (
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: '#3b82f6' }}>
                        🏢 {v.importerName}
                      </p>
                    ) : v.location?.address ? (
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>📍 {v.location.address}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 60 }} />
        {loadingMore && (
          <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>{t('common.loading') || 'טוען...'}</p>
        )}
        {!hasMore && vehicles.length > 0 && (
          <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)', fontSize: 13 }}>
            {vehicles.length} רכבים הוצגו
          </p>
        )}
      </div>
    </div>
  );
}
