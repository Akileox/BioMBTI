import React from 'react';
import './Result.css';

// 타입별 이미지와 키워드 매핑
const typeData = {
  'ICLR': {
    image: '/images/types/ICLR.png',
    keywords: ['#ICLR', '#하프물범', '#높은 적응력']
  },
  // 다른 타입들도 여기에 추가 가능
  // 기본값으로 fallback
  default: {
    image: '/images/types/default.png',
    keywords: []
  }
};

function Result({ result, onRestart }) {
  if (!result) {
    return null;
  }

  const typeInfo = typeData[result.typeCode] || typeData.default;
  // Gemini에서 받은 keywords를 우선 사용, 없으면 기본값 사용
  const keywords = result.keywords && result.keywords.length > 0
    ? result.keywords
    : (typeInfo.keywords.length > 0 
        ? typeInfo.keywords 
        : [`#${result.typeCode}`]);

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
                      <h1>🦭 당신의 Bio-MBTI 결과: {result.typeCode}</h1>
        </div>

        <div className="result-type">
          <div className="type-image-container">
            <img 
              src={typeInfo.image} 
              alt={result.typeCode}
              className="type-image"
              onError={(e) => {
                // 이미지 로드 실패 시 기본 이미지 또는 타입 코드 표시
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="type-code-fallback" style={{ display: 'none' }}>
              {result.typeCode}
            </div>
          </div>
          <h2 className="type-title">{result.title || `당신의 Bio-MBTI 결과: ${result.typeCode}`}</h2>
          <div className="type-keywords">
            {keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </div>

        <div className="result-description">
          <p>{result.description}</p>
        </div>

        <button className="restart-button" onClick={onRestart}>
          다시 테스트하기
        </button>
      </div>
    </div>
  );
}

export default Result;

