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
  const [floatingMessage, setFloatingMessage] = useState(0);
  const [loadingImageError, setLoadingImageError] = useState(false);

  // 오픈그래프 메타태그 동적 업데이트 (카카오톡 공유용)
  const updateOpenGraphMeta = (resultData) => {
    // 타입별 이미지 경로 (Result.js의 typeData와 동일하게 유지)
    const typeImageMap = {
      'ICLR': '/images/types/ICLR.png',
      'ICLG': '/images/types/ICLR.png',
      'ICHR': '/images/types/ICLR.png',
      'ICHG': '/images/types/ICLR.png',
      'IACR': '/images/types/ICLR.png',
      'IACG': '/images/types/ICLR.png',
      'IAHR': '/images/types/ICLR.png',
      'IAHG': '/images/types/ICLR.png',
      'ECLR': '/images/types/ICLR.png',
      'ECLG': '/images/types/ICLR.png',
      'ECHR': '/images/types/ICLR.png',
      'ECHG': '/images/types/ICLR.png',
      'ECGR': '/images/types/ECGR.png',
      'EACR': '/images/types/ICLR.png',
      'EACG': '/images/types/ICLR.png',
      'EAHR': '/images/types/ICLR.png',
      'EAHG': '/images/types/ICLR.png',
    };
    
    // 프로덕션 URL 우선 사용 (환경 변수로 설정 가능)
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const imagePath = typeImageMap[resultData.typeCode] || '/images/types/ICLR.png';
    const imageUrl = `${siteUrl}${imagePath}`;
    const shareUrl = `${siteUrl}${window.location.pathname}?type=${resultData.typeCode}&share=true`;
    const description = resultData.description ? resultData.description.substring(0, 200) : '나의 환경 보호 성향을 알아보는 Bio-MBTI 테스트';

    // 기존 메타태그 제거
    const existingOgTags = document.querySelectorAll('meta[property^="og:"]');
    existingOgTags.forEach(tag => tag.remove());

    // 새로운 오픈그래프 메타태그 추가
    const ogTags = [
      { property: 'og:title', content: resultData.title || `당신의 Bio-MBTI 결과: ${resultData.typeCode}` },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: shareUrl },
      { property: 'og:type', content: 'website' },
    ];

    ogTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });
  };

  // URL 파라미터에서 결과 로드 (공유 링크용)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeCode = urlParams.get('type');
    const share = urlParams.get('share');
    
    if (typeCode && share === 'true') {
      // 공유 링크로 접근한 경우, 결과를 표시하기 위해 API 호출
      // typeCode만으로는 전체 결과를 알 수 없으므로, 간단한 결과 객체 생성
      // 또는 서버에서 typeCode로 결과를 조회하는 API를 만들 수도 있음
      // 지금은 기본 정보만 표시
      const mockResult = {
        typeCode: typeCode.toUpperCase(),
        title: `당신의 Bio-MBTI 결과: ${typeCode.toUpperCase()}`,
        description: '공유 링크로 접근하셨습니다. 정확한 결과를 보려면 테스트를 다시 진행해주세요!',
        keywords: [`#${typeCode.toUpperCase()}`],
        isShared: true // 공유 링크로 접근한 경우 플래그 추가
      };
      setResult(mockResult);
      // 공유 링크로 접근한 경우에도 오픈그래프 메타태그 업데이트
      updateOpenGraphMeta(mockResult);
    }
  }, []);

  const loadingMessages = [
    'Gemini가 답변을 분석하는 중...',
    'Gemini가 올바른 분류를 찾는 중...',
    'Gemini가 이미지 생성 중...'
  ];

  const handleSurveyComplete = async (answers) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingImageError(false); // 이미지 에러 상태 초기화

    const startTime = Date.now();
    const minLoadingTime = 5000; // 최소 5초

    // 진행률 애니메이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return prev; // 95%에서 멈춤
        return prev + Math.random() * 5;
      });
    }, 200);

    // 플로팅 메시지 애니메이션
    const messageInterval = setInterval(() => {
      setFloatingMessage(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    try {
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/get-result`;
      const apiCall = fetch(apiUrl, {
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
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      // 프로그레스 바가 다 채워지고 3초 기다린 후 결과창으로 이동
      setTimeout(() => {
        setIsLoading(false);
        setResult(data);
        // URL에 결과 파라미터 추가 (공유 링크용)
        // 브라우저 URL은 현재 도메인 유지, 공유 링크는 프로덕션 URL 사용
        const newUrl = `${window.location.origin}${window.location.pathname}?type=${data.typeCode}&share=true`;
        window.history.pushState({}, '', newUrl);
        // 동적 오픈그래프 메타태그 업데이트 (카카오톡 공유용)
        updateOpenGraphMeta(data);
      }, 3000);
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      if (process.env.NODE_ENV !== 'production') {
        console.error('API 호출 실패:', err);
      }
      // 네트워크 오류인 경우 더 친절한 메시지
      const errorMessage = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
        ? '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
        : err.message || '결과를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setError(null);
    setShowSurvey(false);
    // URL 파라미터 제거
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleStart = () => {
    setShowSurvey(true);
  };

  if (isLoading) {
    // 로딩 이미지 설정 (이미지 경로를 변경하려면 여기를 수정)
    const loadingImageUrl = '/images/TeamGemini.png';
    const loadingImageFallback = '✨'; // 이미지가 없을 때 표시할 이모지
    
    return (
      <div className="loading-screen">
        <SnowBackground />
        <div className="loading-content">
          <div className="loading-image-container">
            {!loadingImageError && loadingImageUrl ? (
              <img 
                src={loadingImageUrl} 
                alt="Gemini AI" 
                className="loading-image"
                onError={() => {
                  setLoadingImageError(true);
                }}
              />
            ) : (
              <div className="loading-image-fallback" style={{ fontSize: '6rem' }}>
                {loadingImageFallback}
              </div>
            )}
          </div>
          <div className="floating-message-container">
            <p className="floating-message">{loadingMessages[floatingMessage]}</p>
          </div>
          <div className="loading-progress-container">
            <div className="loading-progress-bar-glass">
              <div 
                className="loading-progress-fill-glass" 
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              ></div>
              {(() => {
                const message = 'K-BioX AI BioX';
                const totalChars = message.length;
                const visibleChars = Math.floor((loadingProgress / 100) * totalChars);
                return visibleChars > 0 ? (
                  <span className="progress-message">
                    {message.substring(0, visibleChars)}
                  </span>
                ) : null;
              })()}
            </div>
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
