import React from 'react';
import './GeminiBadge.css';

function GeminiBadge() {
  return (
    <div className="gemini-badge-container">
      <div className="gemini-badge">
        <div className="gemini-badge-icon">✨</div>
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

