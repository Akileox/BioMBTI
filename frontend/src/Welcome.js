import React from 'react';
import SnowBackground from './SnowBackground';
import Footer from './Footer';
import './Welcome.css';

function Welcome({ onStart }) {
  return (
    <div className="welcome-container">
      <SnowBackground />
      <div className="welcome-content">
        <div className="welcome-icon">🐾</div>
        <h1 className="welcome-title">Bio-MBTI 테스트</h1>
        <p className="welcome-subtitle">
          당신의 환경 성향을 알아보는<br />
          <strong>12가지 질문</strong>
        </p>
        <p className="welcome-description">
          북극 생물과 환경 보호를 테마로 한<br />
          특별한 MBTI 테스트를 시작해보세요!
        </p>
        <button className="welcome-start-button" onClick={onStart}>
          테스트 시작하기
        </button>
        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="feature-icon">❄️</span>
            <span>크리스마스 씰 테마</span>
          </div>
          <div className="welcome-feature">
            <span className="feature-icon">🔬</span>
            <span>Gemini AI 분석</span>
          </div>
          <div className="welcome-feature">
            <span className="feature-icon">🌍</span>
            <span>환경 보호 성향</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Welcome;

