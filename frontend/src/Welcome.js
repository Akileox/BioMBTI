import React, { useState } from 'react';
import SnowBackground from './SnowBackground';
import Footer from './Footer';
import './Welcome.css';

function Welcome({ onStart }) {
  const [imageErrors, setImageErrors] = useState({
    main: false,
    kbiox: false,
    teamgemini: false,
    gemini: false
  });

  // 이미지 경로 설정 (필요시 수정 가능)
  const logoImages = {
    main: '/images/logos/K-BioX_AI_BioX_logo(WT).png', // 메인 로고
    kbiox: '/images/logos/K-BioX_Logo.png',
    teamgemini: '/images/logos/instagram_logo.png',
    gemini: '/images/logos/gemini_logo.png'
  };

  // 로고 링크 설정
  const logoLinks = {
    kbiox: 'https://kbiox.net/main/',
    teamgemini: 'https://www.instagram.com/kbiox_teamgemini/',
    gemini: 'https://gemini.google.com/'
  };

  // Fallback 이모지
  const fallbackEmojis = {
    main: '🦭',
    kbiox: '🤖',
    teamgemini: '🌟',
    gemini: '✨'
  };

  const handleImageError = (key) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="welcome-container">
      <SnowBackground />
      <div className="welcome-content">
        <div className="welcome-icon">
          {!imageErrors.main && logoImages.main ? (
            <img 
              src={logoImages.main} 
              alt="Bio-MBTI Logo" 
              className="welcome-logo-image"
              onError={() => handleImageError('main')}
            />
          ) : (
            <span className="welcome-icon-fallback">{fallbackEmojis.main}</span>
          )}
        </div>
        <h1 className="welcome-title">Bio-MBTI 테스트</h1>
        <p className="welcome-subtitle">
          당신의 환경 보호 성향을 알아보는<br />
          <strong>12가지 질문</strong>
        </p>
        <p className="welcome-description">
          K-BioX와 Google Gemini AI가 함께 만든<br />
          환경 보호를 테마로 한 특별한 MBTI 테스트입니다.<br />
          당신의 환경 성향을 발견해보세요!
        </p>
        <button className="welcome-start-button" onClick={onStart}>
          테스트 시작하기
        </button>
        <div className="welcome-features">
          <a 
            href={logoLinks.kbiox} 
            target="_blank" 
            rel="noopener noreferrer"
            className="welcome-feature-link"
          >
            <div className="welcome-feature">
              {!imageErrors.kbiox && logoImages.kbiox ? (
                <img 
                  src={logoImages.kbiox} 
                  alt="K-BioX" 
                  className="feature-logo-image"
                  onError={() => handleImageError('kbiox')}
                />
              ) : (
                <span className="feature-icon">{fallbackEmojis.kbiox}</span>
              )}
            </div>
          </a>
          <a 
            href={logoLinks.teamgemini} 
            target="_blank" 
            rel="noopener noreferrer"
            className="welcome-feature-link"
          >
            <div className="welcome-feature">
              {!imageErrors.teamgemini && logoImages.teamgemini ? (
                <img 
                  src={logoImages.teamgemini} 
                  alt="TeamGemini" 
                  className="feature-logo-image"
                  onError={() => handleImageError('teamgemini')}
                />
              ) : (
                <span className="feature-icon">{fallbackEmojis.teamgemini}</span>
              )}
            </div>
          </a>
          <a 
            href={logoLinks.gemini} 
            target="_blank" 
            rel="noopener noreferrer"
            className="welcome-feature-link"
          >
            <div className="welcome-feature">
              {!imageErrors.gemini && logoImages.gemini ? (
                <img 
                  src={logoImages.gemini} 
                  alt="Google Gemini" 
                  className="feature-logo-image"
                  onError={() => handleImageError('gemini')}
                />
              ) : (
                <span className="feature-icon">{fallbackEmojis.gemini}</span>
              )}
            </div>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Welcome;

