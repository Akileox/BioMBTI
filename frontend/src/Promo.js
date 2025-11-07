import React from 'react';
import './Promo.css';

function Promo() {
  return (
    <div className="promo-container">
      <div className="promo-content">
        <div className="promo-logo">
          <h2>K-BioX</h2>
        </div>
        <div className="promo-text">
          <h3>환경 보호와 생물 다양성 연구</h3>
          <p>
            K-BioX는 북극 생물과 환경 보호에 대한 연구와 교육을 통해 
            지구의 미래를 함께 만들어갑니다.
          </p>
          <a 
            href="https://kbiox.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="promo-link"
          >
            K-BioX 홈페이지 방문하기 →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Promo;

