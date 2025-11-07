import React, { useState, useEffect } from 'react';
import './PromoCarousel.css';

const carouselItems = [
  {
    id: 1,
    title: 'K-BioX 연구 활동',
    description: '북극 생물과 환경 보호 연구',
    image: '🔬', // 이모티콘 또는 이미지 URL
    imageUrl: null, // 이미지 URL이 있으면 이모티콘 대신 표시
    color: '#4a90e2'
  },
  {
    id: 2,
    title: '크리스마스 씰 캠페인',
    description: '북극 생물 보호를 위한 특별 캠페인',
    image: '❄️',
    imageUrl: null, // 예: '/images/christmas-seal.jpg'
    color: '#87ceeb'
  },
  {
    id: 3,
    title: '환경 교육 프로그램',
    description: '미래 세대를 위한 환경 교육',
    image: '🌍',
    imageUrl: null, // 예: '/images/education.jpg'
    color: '#98d8c8'
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
              <div 
                className="promo-carousel-content"
                style={{ '--accent-color': item.color }}
              >
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="promo-carousel-image"
                  />
                ) : (
                  <div className="promo-carousel-icon">{item.image}</div>
                )}
                <h3 className="promo-carousel-title">{item.title}</h3>
                <p className="promo-carousel-description">{item.description}</p>
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

