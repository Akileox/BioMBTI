import React, { useEffect, useRef, useState } from 'react';
import PromoCarousel from './PromoCarousel';
import './PromoSection.css';

const promoData = [
  {
    id: 1,
    icon: '🔬',
    title: 'K-BioX',
    subtitle: '환경 보호와 생물 다양성 연구',
    description: 'K-BioX는 북극 생물과 환경 보호에 대한 연구와 교육을 통해 지구의 미래를 함께 만들어갑니다.',
    link: 'https://kbiox.org',
    linkText: 'K-BioX 홈페이지 방문하기'
  },
  {
    id: 2,
    icon: '❄️',
    title: '북극 생물 보호 프로젝트',
    subtitle: '크리스마스 씰과 함께하는 캠페인',
    description: '북극 생물들의 서식지 보호를 위한 연구와 캠페인에 참여해보세요. 작은 실천이 큰 변화를 만듭니다.',
    link: '#',
    linkText: '프로젝트 자세히 보기'
  },
  {
    id: 3,
    icon: '🌍',
    title: '환경 교육 프로그램',
    subtitle: '미래 세대를 위한 교육',
    description: '아이들과 청소년들을 위한 환경 교육 프로그램을 운영하고 있습니다. 함께 배우고 실천해요!',
    link: '#',
    linkText: '교육 프로그램 알아보기'
  },
  {
    id: 4,
    icon: '🔬',
    title: '연구 참여하기',
    subtitle: '시민 과학자와 함께',
    description: '일반인도 참여할 수 있는 시민 과학 프로젝트에 참여하여 환경 보호 연구에 기여해보세요.',
    link: '#',
    linkText: '연구 참여 신청하기'
  }
];

function PromoCard({ promo, index }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`promo-card ${isVisible ? 'promo-card-visible' : ''}`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="promo-card-icon">{promo.icon}</div>
      <div className="promo-card-content">
        <h3 className="promo-card-title">{promo.title}</h3>
        <p className="promo-card-subtitle">{promo.subtitle}</p>
        <p className="promo-card-description">{promo.description}</p>
        {promo.link && (
          <a
            href={promo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-card-link"
          >
            {promo.linkText} →
          </a>
        )}
      </div>
    </div>
  );
}

function PromoSection() {
  return (
    <div className="promo-section">
      <PromoCarousel />
      <div className="promo-section-header">
        <h2>🌊 함께 만들어가는 지구의 미래</h2>
        <p>K-BioX와 함께하는 다양한 활동을 소개합니다</p>
      </div>
      <div className="promo-cards-container">
        {promoData.map((promo, index) => (
          <PromoCard key={promo.id} promo={promo} index={index} />
        ))}
      </div>
    </div>
  );
}

export default PromoSection;

