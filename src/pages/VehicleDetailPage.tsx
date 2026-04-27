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
  seats?: number;
  testUntil?: string;
  firstRegistration?: string;
  licensePlate?: string;
  location?: { address: string };
  sellerId?: { displayName?: string; profilePicture?: string };
  createdAt: string;
  listingType?: 'private' | 'importer';
  importerName?: string;
  importerPhone?: string;
  importerWebsite?: string;
  youtubeVideoId?: string;
  trimLevel?: string;
  bodyType?: string;
  totalWeight?: number;
  pollutionLevel?: number;
  trims?: Array<{
    name: string;
    price: number;
    horsepower?: number;
    engineVolume?: number;
  }>;
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
  const [showVideo, setShowVideo] = useState(false);

  const isPlateNumber = id ? /^\d{5,8}$/.test(id) : false;
  const appStoreUrl = import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/us/app/alphacar/id6761636676';

  useEffect(() => {
    if (!id) return;
    // If it's a plate number (from maintenance share), try opening the app
    if (isPlateNumber) {
      const appLink = `alphacar://vehicle/${id}`;
      const timer = setTimeout(() => {
        // App didn't open — stay on the web page
        setLoading(false);
      }, 1500);
      window.location.href = appLink;
      return () => clearTimeout(timer);
    }
    // Otherwise load vehicle by _id from API
    apiFetch<{ success: boolean; vehicle: Vehicle }>(`/vehicles/${id}`)
      .then((d) => { if (d.success) setVehicle(d.vehicle); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isPlateNumber]);

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
    // For plate number links — show "Open in App" page
    if (isPlateNumber) {
      return (
        <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: isDark ? '#0a0a0a' : '#fafafa', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🚗</div>
          <h2 style={{ color: isDark ? '#e5e7eb' : '#1a1a1a', margin: 0 }}>רכב {id}</h2>
          <p style={{ color: isDark ? '#888' : '#666', maxWidth: 320 }}>
            כדי לראות את כל פרטי הרכב, טיפולים ותמונות — פתח באפליקציית AlphaCar
          </p>
          <a
            href={`alphacar://vehicle/${id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'linear-gradient(135deg, #0891B2, #06B6D4)', color: '#fff', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 16 }}
          >
            פתח באפליקציה
          </a>
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: isDark ? '#06B6D4' : '#0891B2', textDecoration: 'none', fontSize: 14 }}
          >
            אין לך את האפליקציה? הורד מ-App Store →
          </a>
          <Link to="/" style={{ color: isDark ? '#666' : '#999', textDecoration: 'none', fontSize: 13, marginTop: 8 }}>
            חזרה לאתר
          </Link>
        </div>
      );
    }
    return (
      <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}>
        <div style={{ color: isDark ? '#555' : '#999' }}>{t('vehicles.notFound') || 'רכב לא נמצא'}</div>
      </div>
    );
  }

  const isImporter = vehicle.listingType === 'importer';

  const specs = [
    vehicle.year && ['שנה', String(vehicle.year)],
    !isImporter && vehicle.mileage && ['קילומטראז\'', `${vehicle.mileage.toLocaleString()} ק"מ`],
    isImporter && ['מצב', 'חדש · 0 ק"מ'],
    vehicle.engineType && ['דלק', fuelLabels[vehicle.engineType] || vehicle.engineType],
    vehicle.transmission && ['תיבת הילוכים', transLabels[vehicle.transmission] || vehicle.transmission],
    vehicle.engineVolume && ['נפח מנוע', `${vehicle.engineVolume} סמ"ק`],
    vehicle.horsepower && ['כ"ס', `${vehicle.horsepower}`],
    vehicle.doors && ['דלתות', String(vehicle.doors)],
    vehicle.seats && ['מושבים', String(vehicle.seats)],
    vehicle.color && ['צבע', vehicle.color],
    !isImporter && vehicle.previousOwners != null && ['יד', String(vehicle.previousOwners)],
    vehicle.safetyRating != null && ['בטיחות', `${vehicle.safetyRating}`],
    vehicle.pollutionLevel != null && ['רמת זיהום', `${vehicle.pollutionLevel}`],
    vehicle.trimLevel && ['רמת גימור', vehicle.trimLevel],
    vehicle.bodyType && ['סוג מרכב', vehicle.bodyType],
    vehicle.totalWeight && ['משקל כולל', `${vehicle.totalWeight} ק"ג`],
    vehicle.testUntil && ['תוקף טסט', new Date(vehicle.testUntil).toLocaleDateString()],
    vehicle.firstRegistration && ['עלייה לכביש', new Date(vehicle.firstRegistration).toLocaleDateString()],
    isImporter && vehicle.importerName && ['יבואן', vehicle.importerName],
  ].filter(Boolean) as [string, string][];

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 12px 40px' }}>
        {/* Photo / Video gallery */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 16,
          backgroundColor: isDark ? '#141414' : '#f0f0f0',
          height: window.innerWidth < 480 ? 220 : 400,
        }}>
          {showVideo && vehicle.youtubeVideoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${vehicle.youtubeVideoId}?autoplay=1&rel=0`}
              title={`${vehicle.brand} ${vehicle.vehicleModel}`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : vehicle.photos?.length > 0 ? (
            <>
              <img
                src={vehicle.photos[activePhoto]}
                alt={`${vehicle.brand} ${vehicle.vehicleModel}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
              {/* Play button for YouTube — styled */}
              {isImporter && vehicle.youtubeVideoId && (
                <button
                  onClick={() => setShowVideo(true)}
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: 64, height: 64, borderRadius: 32,
                    backgroundColor: 'rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.8)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)')}
                >
                  <span style={{ fontSize: 28, color: '#fff', marginLeft: 4 }}>▶</span>
                </button>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: 0.2 }}>🚗</div>
          )}

          {/* Importer badge */}
          {isImporter && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 700,
              padding: '5px 12px', borderRadius: 10,
            }}>
              ⭐ חדש מהיבואן
            </span>
          )}

          {/* Photo dots */}
          {!showVideo && vehicle.photos?.length > 1 && (
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
                    backgroundColor: i === activePhoto ? (isImporter ? '#3b82f6' : '#3b82f6') : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'width 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer below image for importer */}
        {isImporter && (vehicle.photos?.length > 0 || vehicle.youtubeVideoId) && (
          <p style={{ textAlign: 'center', fontSize: 11, color: isDark ? '#555' : '#999', margin: '6px 0 0' }}>
            התמונה/סרטון להמחשה בלבד ואינם מייצגים את הרכב הספציפי
          </p>
        )}

        {/* Title + price */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16, gap: 8 }}>
          <div style={{ flex: '1 1 200px' }}>
            <h1 style={{ margin: 0, fontSize: window.innerWidth < 480 ? 20 : 26, fontWeight: 800, color: isDark ? '#fff' : '#111' }}>
              {vehicle.brand} {vehicle.vehicleModel}
            </h1>
            {isImporter ? (
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#3b82f6' }}>
                🏢 {vehicle.importerName}
                {vehicle.location?.address && ` · ${vehicle.location.address}`}
              </p>
            ) : vehicle.location?.address ? (
              <p style={{ margin: '4px 0 0', fontSize: 13, color: isDark ? '#666' : '#999' }}>
                📍 {vehicle.location.address}
              </p>
            ) : null}
          </div>
          <div style={{ textAlign: 'left' }}>
            {isImporter && <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, marginBottom: 2 }}>מחירון יבואן</div>}
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: isImporter ? '#3b82f6' : '#3b82f6',
              whiteSpace: 'nowrap',
            }}>
              ₪{vehicle.price?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          {isImporter && vehicle.importerPhone ? (
            <a
              href={`tel:${vehicle.importerPhone}`}
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
              📞 {vehicle.importerPhone}
            </a>
          ) : null}
          {isImporter && vehicle.importerWebsite && (
            <a
              href={vehicle.importerWebsite}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 20px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: isDark ? '#fff' : '#111',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              🌐 אתר היבואן
            </a>
          )}
          {!isImporter && (
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
          )}
        </div>

        {/* Trim levels */}
        {isImporter && vehicle.trims && vehicle.trims.length > 1 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#111', margin: '0 0 12px' }}>
              רמות גימור ({vehicle.trims.length})
            </h3>
            <div style={{
              borderRadius: 16, border: `1px solid ${isDark ? '#222' : '#eee'}`,
              backgroundColor: isDark ? '#141414' : '#fff', overflow: 'hidden',
            }}>
              {vehicle.trims.map((trim, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px',
                    borderTop: i > 0 ? `1px solid ${isDark ? '#1e1e1e' : '#f5f5f5'}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>
                      {trim.name || 'סטנדרט'}
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? '#888' : '#666', marginTop: 2, display: 'flex', gap: 10 }}>
                      {trim.horsepower && <span>⚡ {trim.horsepower} כ"ס</span>}
                      {trim.engineVolume && <span>🔧 {trim.engineVolume} סמ"ק</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                    ₪{trim.price?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
