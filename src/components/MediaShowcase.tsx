import { useLanguage } from '../context/LanguageContext';

interface MediaItem {
  type: 'video' | 'image';
  src: string;
  alt: string;
}

export default function MediaShowcase() {
  const { t } = useLanguage();

  const mediaItems: MediaItem[] = [
    {
      type: 'video',
      src: '/images/preview1.mp4',
      alt: 'Preview 1',
    },
    {
      type: 'image',
      src: '/images/IMG_3631.PNG',
      alt: 'Screenshot 1',
    },
    {
      type: 'video',
      src: '/images/preview2.mp4',
      alt: 'Preview 2',
    },
    {
      type: 'image',
      src: '/images/IMG_3634.PNG',
      alt: 'Screenshot 2',
    },
    {
      type: 'image',
      src: '/images/IMG_3642.PNG',
      alt: 'Screenshot 3',
    },
    {
      type: 'video',
      src: '/images/demo-screen.mp4',
      alt: 'Demo',
    },
  ];

  return (
    <div className="media-showcase-container">
      {/* HEADER */}
      <section className="media-showcase-header">
        <div className="header-content reveal">
          <h2>{t('showcase.media.title')}</h2>
          <p>{t('showcase.media.subtitle')}</p>
        </div>
      </section>

      {/* FULL WIDTH GALLERY */}
      <section className="media-gallery-section">
        <div className="media-gallery">
          {mediaItems.map((item, index) => (
            <div key={index} className="gallery-item reveal">
              {item.type === 'video' ? (
                <video
                  className="gallery-media"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : (
                <img
                  className="gallery-media"
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
