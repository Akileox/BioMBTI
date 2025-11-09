import React, { useEffect, useRef, useState } from 'react';
import PromoCarousel from './PromoCarousel';
import './PromoSection.css';

const promoData = [
  {
    id: 1,
    icon: '🤖',
    image: '/images/logos/K-BioX_Logo.png', // 로고 이미지 경로
    title: 'K-BioX',
    subtitle: '환경 보호와 생물 다양성 연구',
    description: 'K-BioX는 정기적인 온오프라인 SUMMIT 행사, 멘토링 프로그램, 기관 협력 프로그램, 학술 자료 공유 플랫폼 등을 통해 전세계를 향한 생명과학 지식 나눔을 지속해 나가고 있습니다. 환경 보호와 생물 다양성 연구에 관심이 있으시다면 홈페이지에서 더 자세한 정보를 확인해보세요.',
    link: 'https://kbiox.net/main/',
    linkText: 'K-BioX 홈페이지 방문하기'
  },
  {
    id: 2,
    icon: '🌟',
    image: '/images/logos/instagram_logo.png', // 로고 이미지 경로
    title: 'K-BioX TeamGemini',
    subtitle: '인스타그램에서 만나보세요',
    description: 'K-BioX TeamGemini의 최신 소식과 활동을 인스타그램에서 확인하실 수 있습니다. 다양한 연구 활동, 이벤트 정보, 그리고 환경 보호 관련 콘텐츠를 만나보세요. 함께 지구의 미래를 만들어가는 여정에 참여해보세요!',
    link: 'https://www.instagram.com/kbiox_teamgemini/',
    linkText: '인스타그램 방문하기'
  },
  {
    id: 3,
    icon: '✨',
    image: '/images/logos/gemini_logo.png', // 로고 이미지 경로
    title: 'Google Gemini',
    subtitle: 'AI와 함께하는 미래',
    description: '이 서비스는 Google Gemini AI를 활용하여 만들어졌습니다. 사용자의 답변을 분석하여 맞춤형 Bio-MBTI 결과를 제공합니다. 최첨단 AI 기술로 당신의 환경 보호 성향을 정확하게 파악하고, 의미 있는 결과를 제공합니다.',
    link: 'https://gemini.google.com/',
    linkText: 'Gemini 알아보기'
  }
];

function PromoCard({ promo, index }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`promo-card ${isVisible ? 'promo-card-visible' : ''}`}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="promo-card-icon">
        {promo.image && !imageError ? (
          <img 
            src={promo.image} 
            alt={promo.title}
            className="promo-card-logo"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="promo-card-icon-fallback">{promo.icon}</span>
        )}
      </div>
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
        <h2>함께 만들어가는 지구의 미래</h2>
        <p>K-BioX AI BioX와 함께하는 다양한 활동을 소개합니다</p>
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

