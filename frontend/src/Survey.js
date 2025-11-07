import React, { useState, useEffect, useRef } from 'react';
import SnowBackground from './SnowBackground';
import GeminiBadge from './GeminiBadge';
import PromoSection from './PromoSection';
import Footer from './Footer';
import './Survey.css';

function Survey({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const surveyContainerRef = useRef(null);
  
  // 컴포넌트 마운트 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 질문이 변경될 때마다 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentQuestionIndex]);

  useEffect(() => {
    // 질문 데이터 로드
    fetch('/data/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setIsLoading(false);

      })
      .catch(err => {
        console.error('질문 데이터 로드 실패:', err);
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
      <div className="survey-container" ref={surveyContainerRef}>
        <div className="loading">질문을 불러오는 중...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="survey-container" ref={surveyContainerRef}>
        <div className="error">질문을 불러올 수 없습니다.</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="survey-container" ref={surveyContainerRef}>
      <SnowBackground />
      <div className="survey-main">
        <div className="survey-header">
          <h1>🦭 Bio-MBTI 테스트</h1>
          <p className="subtitle">당신의 환경 성향을 알아보는 12가지 질문</p>
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

