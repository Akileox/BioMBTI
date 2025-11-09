import React, { useState } from 'react';
import './GeminiBadge.css';

function GeminiBadge() {
  const [logoError, setLogoError] = useState(false);
  
  // 이미지 경로 설정 (필요시 수정 가능)
  const logoImage = '/images/logos/gemini_logo.png';
  const fallbackEmoji = '✨';

  return (
    <div className="gemini-badge-container">
      <div className="gemini-badge">
        <div className="gemini-badge-icon">
          {!logoError && logoImage ? (
            <img 
              src={logoImage} 
              alt="Google Gemini" 
              className="gemini-badge-logo"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="gemini-badge-icon-fallback">{fallbackEmoji}</span>
          )}
        </div>
        <div className="gemini-badge-content">
          <p className="gemini-badge-text">
            이 서비스는 <strong>Google Gemini AI</strong>를 활용하여 만들어졌습니다.
          </p>
          <p className="gemini-badge-subtext">
            사용자의 답변을 분석하여 맞춤형 Bio-MBTI 결과를 제공합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GeminiBadge;

