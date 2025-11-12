import React, { useState, useEffect } from 'react';
import SnowBackground from './SnowBackground';
import GeminiBadge from './GeminiBadge';
import PromoSection from './PromoSection';
import Footer from './Footer';
import './Survey.css';

function Survey({ onComplete }) {
  const [logoError, setLogoError] = useState(false);
  
  // 이미지 경로 설정 (필요시 수정 가능)
  const logoImage = '/images/logos/K-BioX_Logo.png';
  const fallbackEmoji = '🦭';
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 질문 데이터 로드
    fetch('/data/questions.json')
      .then(res => res.json())
      .then(data => {
        // id 기준으로 정렬
        const sortedData = [...data].sort((a, b) => a.id - b.id);
        
        // 전체 질문 수
        const totalQuestions = sortedData.length;
        const sectionSize = Math.floor(totalQuestions / 4); // 각 섹션 크기 (120개면 30개씩)
        
        // Fisher-Yates shuffle 함수
        const shuffle = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };
        
        // 4개 섹션으로 나누어 각 섹션에서 3개씩 랜덤 선택
        const selectedQuestions = [];
        
        for (let i = 0; i < 4; i++) {
          const startIdx = i * sectionSize;
          const endIdx = (i === 3) ? totalQuestions : (i + 1) * sectionSize; // 마지막 섹션은 나머지 모두 포함
          const section = sortedData.slice(startIdx, endIdx);
          
          if (section.length > 0) {
            const shuffled = shuffle(section);
            const selected = shuffled.slice(0, Math.min(3, shuffled.length));
            selectedQuestions.push(...selected);
          }
        }
        
        // 최종 선택된 질문들을 다시 섞어서 순서를 랜덤화
        const finalQuestions = shuffle(selectedQuestions);
        setQuestions(finalQuestions);
        setIsLoading(false);

      })
      .catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('질문 데이터 로드 실패:', err);
        }
        setIsLoading(false);
      });
  }, []);

  const handleAnswer = (answerValue) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer = {
      question: currentQuestion.question,
      answerValue: answerValue
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // 마지막 질문이면 결과 전송
    if (currentQuestionIndex === questions.length - 1) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="survey-container">
        <div className="loading">질문을 불러오는 중...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="survey-container">
        <div className="error">질문을 불러올 수 없습니다.</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="survey-container">
      <SnowBackground />
      <div className="survey-main">
        <div className="survey-header">
          <div className="survey-logo-container">
            {!logoError && logoImage ? (
              <img 
                src={logoImage} 
                alt="Bio-MBTI Logo" 
                className="survey-logo-image"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="survey-logo-fallback">{fallbackEmoji}</span>
            )}
          </div>
          <h1>Bio-MBTI 테스트</h1>
          <p className="subtitle">당신의 환경 보호 성향을 알아보는 12가지 질문</p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          {currentQuestionIndex + 1} / {questions.length}
        </p>

        <div className="question-card">
          <div className="question-axis">{currentQuestion.axis}</div>
          <h2 className="question-text">{currentQuestion.question}</h2>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleAnswer(option.value)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <GeminiBadge />
      <PromoSection />
      <Footer />
    </div>
  );
}

export default Survey;

