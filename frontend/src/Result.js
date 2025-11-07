import React from 'react';
import './Result.css';

function Result({ result, onRestart }) {
  if (!result) {
    return null;
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <h1>🐾 당신의 Bio-MBTI 결과</h1>
        </div>

        <div className="result-type">
          <div className="type-code">{result.typeCode}</div>
          <h2 className="type-title">{result.title}</h2>
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

