import React, { useState, useEffect } from 'react';
import SnowBackground from './SnowBackground';
import Welcome from './Welcome';
import Survey from './Survey';
import Result from './Result';
import Footer from './Footer';
import './App.css';

function App() {
  const [showSurvey, setShowSurvey] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  // 페이지 전환 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showSurvey, result, isLoading, error]);

  const handleSurveyComplete = async (answers) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    const startTime = Date.now();
    const minLoadingTime = 5000; // 최소 5초

    // 진행률 애니메이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return prev; // 95%에서 멈춤
        return prev + Math.random() * 5;
      });
    }, 200);

    try {
      const apiCall = fetch('/api/get-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const [response] = await Promise.all([
        apiCall,
        new Promise(resolve => setTimeout(resolve, minLoadingTime))
      ]);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 오류 (${response.status})`);
      }

      const data = await response.json();
      
      // 응답 데이터 검증
      if (!data.typeCode || !data.title || !data.description) {
        throw new Error('서버에서 올바른 형식의 데이터를 받지 못했습니다.');
      }
      
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setResult(data);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('API 호출 실패:', err);
      // 네트워크 오류인 경우 더 친절한 메시지
      const errorMessage = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
        ? '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
        : err.message || '결과를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setError(null);
    setShowSurvey(false);
  };

  const handleStart = () => {
    setShowSurvey(true);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <SnowBackground />
        <div className="loading-content">
          <div className="loading-emoji">🔬✨</div>
          <div className="loading-spinner"></div>
          <h2>분석 중입니다</h2>
          <p>Gemini AI가 당신의 답변을 분석하여<br />맞춤형 Bio-MBTI 결과를 생성하고 있습니다...</p>
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div 
                className="loading-progress-fill" 
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              ></div>
            </div>
            <p className="loading-progress-text">{Math.round(Math.min(loadingProgress, 100))}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={handleRestart} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <SnowBackground />
      {result ? (
        <>
          <Result result={result} onRestart={handleRestart} />
          <Footer />
        </>
      ) : showSurvey ? (
        <Survey onComplete={handleSurveyComplete} />
      ) : (
        <Welcome onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
