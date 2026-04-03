import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  engineVolume?: number;
  horsepower?: number;
  transmission: string;
  previousOwners?: number;
  description: string;
  features: string[];
  safetyRating?: number;
  doors?: number;
  testUntil?: string;
  firstRegistration?: string;
  licensePlate?: string;
  location?: { address: string };
  sellerId?: { displayName?: string; profilePicture?: string };
  createdAt: string;
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang: language } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isDark = theme === 'dark';
  const isRTL = language === 'he';

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    apiFetch<{ success: boolean; vehicle: Vehicle }>(`/vehicles/${id}`)
      .then((d) => { if (d.success) setVehicle(d.vehicle); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fuelLabels: Record<string, string> = {
    gasoline: 'בנזין', diesel: 'דיזל', electric: 'חשמלי', hybrid: 'היברידי', 'plug-in-hybrid': 'פלאג-אין',
  };
  const transLabels: Record<string, string> = {
    automatic: 'אוטומטית', manual: 'ידנית', 'semi-automatic': 'חצי אוטומטית',
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
        <div style={{ color: isDark ? '#555' : '#999' }}>{t('common.loading') || 'טוען...'}</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
        <div style={{ color: isDark ? '#555' : '#999' }}>{t('vehicles.notFound') || 'רכב לא נמצא'}</div>
      </div>
    );
  }

  const specs = [
    vehicle.year && ['שנה', String(vehicle.year)],
    vehicle.mileage && ['קילומטראז\'', `${vehicle.mileage.toLocaleString()} ק"מ`],
    vehicle.engineType && ['דלק', fuelLabels[vehicle.engineType] || vehicle.engineType],
    vehicle.transmission && ['תיבת הילוכים', transLabels[vehicle.transmission] || vehicle.transmission],
    vehicle.engineVolume && ['נפח מנוע', `${vehicle.engineVolume} cc`],
    vehicle.horsepower && ['כוח סוס', `${vehicle.horsepower} KW`],
    vehicle.doors && ['דלתות', String(vehicle.doors)],
    vehicle.color && ['צבע', vehicle.color],
    vehicle.previousOwners != null && ['יד', String(vehicle.previousOwners)],
    vehicle.safetyRating != null && ['בטיחות', `${vehicle.safetyRating}/5`],
    vehicle.testUntil && ['תוקף טסט', new Date(vehicle.testUntil).toLocaleDateString()],
    vehicle.firstRegistration && ['עלייה לכביש', new Date(vehicle.firstRegistration).toLocaleDateString()],
  ].filter(Boolean) as [string, string][];

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' }}>
        {/* Photo gallery */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 16,
          backgroundColor: isDark ? '#141414' : '#f0f0f0',
          height: 400,
        }}>
          {vehicle.photos?.length > 0 ? (
            <img
              src={vehicle.photos[activePhoto]}
              alt={`${vehicle.brand} ${vehicle.vehicleModel}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.2 }}>🚗</div>
          )}

          {/* Photo dots */}
          {vehicle.photos?.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}>
              {vehicle.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  style={{
                    width: i === activePhoto ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: i === activePhoto ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'width 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: isDark ? '#fff' : '#111' }}>
              {vehicle.brand} {vehicle.vehicleModel}
            </h1>
            {vehicle.location?.address && (
              <p style={{ margin: '4px 0 0', fontSize: 13, color: isDark ? '#666' : '#999' }}>
                📍 {vehicle.location.address}
              </p>
            )}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#3b82f6',
            whiteSpace: 'nowrap',
          }}>
            ₪{vehicle.price?.toLocaleString()}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Link
            to={`/chat?vehicle=${vehicle._id}`}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 14,
              backgroundColor: '#3b82f6',
              color: '#fff',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            💬 {t('vehicle.chatWithAI') || 'שוחח עם סוכן AI'}
          </Link>
          <button
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              border: `1px solid ${isDark ? '#333' : '#ddd'}`,
              backgroundColor: 'transparent',
              color: isDark ? '#fff' : '#111',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ❤️
          </button>
        </div>

        {/* Specs table */}
        <div style={{
          marginTop: 24,
          borderRadius: 16,
          border: `1px solid ${isDark ? '#222' : '#eee'}`,
          backgroundColor: isDark ? '#141414' : '#fff',
          overflow: 'hidden',
        }}>
          {specs.map(([label, value], i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: i > 0 ? `1px solid ${isDark ? '#1e1e1e' : '#f5f5f5'}` : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: isDark ? '#888' : '#666' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {vehicle.description && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#111', margin: '0 0 8px' }}>
              {t('vehicle.description') || 'תיאור'}
            </h3>
            <p style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: isDark ? '#aaa' : '#444',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}>
              {vehicle.description}
            </p>
          </div>
        )}

        {/* Features */}
        {vehicle.features?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#111', margin: '0 0 10px' }}>
              {t('vehicle.features') || 'אבזור'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vehicle.features.map((f, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 10,
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#aaa' : '#555',
                    fontSize: 13,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
