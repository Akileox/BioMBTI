import React, { useState, useEffect } from 'react';
import './PromoCarousel.css';

const carouselItems = [
  {
    id: 1,
    imageUrl: '/images/summit_example.png'
  },
  {
    id: 2,
    imageUrl: '/images/insta_example.png'
  },
  {
    id: 3,
    imageUrl: '/images/X-mas_seal.png'
  }
];

function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 4000); // 4초마다 변경

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="promo-carousel-container">
      <div className="promo-carousel">
        <div 
          className="promo-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {carouselItems.map((item) => (
            <div key={item.id} className="promo-carousel-slide">
              <div className="promo-carousel-content">
                <img 
                  src={item.imageUrl} 
                  alt={`Carousel ${item.id}`}
                  className="promo-carousel-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="promo-carousel-indicators">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`promo-carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}

export default PromoCarousel;

