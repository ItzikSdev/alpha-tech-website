import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function MaintenanceCarousel() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const images = [
    { src: '/images/maintenance-0.png', alt: 'Maintenance Overview' },
    { src: '/images/maintenance-1.png', alt: 'Maintenance Detail' },
    { src: '/images/maintenance-2.png', alt: 'Maintenance History' },
    { src: '/images/maintenance-3.png', alt: 'Service Records' },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setAutoPlay(false);
  };

  return (
    <div className="maintenance-carousel">
      <div className="carousel-container">
        <div className="carousel-slides">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          className="carousel-btn carousel-btn-prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          className="carousel-btn carousel-btn-next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
