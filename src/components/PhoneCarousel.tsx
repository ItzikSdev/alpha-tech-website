import { useState, useEffect } from 'react';

const images = [
  '/images/IMG_3631.PNG',
  '/images/IMG_3634.PNG',
  '/images/IMG_3642.PNG',
  '/images/maintenance-0.png',
  '/images/maintenance-1.png',
  '/images/maintenance-2.png',
];

export default function PhoneCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="phone-mockup">
      <div className="phone-screen">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`AlphaCar screenshot ${i + 1}`}
            className={i === current ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
