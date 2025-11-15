import React, { useState, useEffect, useRef } from 'react';
import './Result.css';

// 타입별 이미지와 키워드 매핑
const typeData = {
  'ICLR': {
    image: '/images/types/ICLR.png',
    keywords: ['#ICLR', '#하프물범', '#높은 적응력'],
    creator: '@Akileox' // 동물별 제작자 설정
  },
  'ICGR': {
    image: '/images/types/ICGR.png',
    keywords: ['#ICGR', '#북극여우', '#고독', '#탐색가', '#에너지효율'],
    creator: '허인영'
  },
  'ECLR': {
    image: '/images/types/ECLR.png',
    keywords: ['#ECLR', '#바다코끼리', '#무리생활', '#신중함', '#이성적'],
    creator: '@Raul'
  },
  'ECLH': {
    image: '/images/types/ECLH.jpg',
    keywords: ['#ECLH', '#나르왈', '#일각고래', '#공동체', '#감성적'],
    creator: '@Blue'
  },
  'ECGR': {
    image: '/images/types/ECGR.png',
    keywords: ['#ECGR', '#북극순록', '#무리생활', '#효율적'],
    creator: '@Jay'
  },
  'EAGR': {
    image: '/images/types/EAGR.jpg',
    keywords: ['#EAGR', '#벨루가', '#소통의 중심', '#바다의 카나리아', '#적극성'],
    creator: '@HWChoi'
  },
  'ICGH': {
    image: '/images/types/ICGH.jpg',
    keywords: ['#ICGH', '#북극곰', '#신중함', '#헌신적', '#기후변화'],
    creator: '@이채원(Lucy)'
  },
  'EAGH': {
    image: '/images/types/EAGH.jpg',
    keywords: ['#EAGH', '#흰올빼미', '#대담함', '#가족', '#하늘'],
    creator: '@이채원(Lucy)'
  },
  'IALR': {
    image: '/images/types/IALR.jpg',
    keywords: ['#IALR', '#그린란드상어', '#고독', '#생존자', '#심해'],
    creator: '@이채원(Lucy)'
  },
  'IAGR': {
    image: '/images/types/IAGR.png',
    keywords: ['#IAGR', '#북극기러기', '#이동', '#행동가', '#효율적'],
    creator: '허인영'
  },
  'IALH': {
    image: '/images/types/IALH.png',
    keywords: ['#IALH', '#북극토끼', '#홀로', '#적극적', '#지역적'],
    creator: '@강세현'
  },
  'IAGH': {
    image: '/images/types/IAGH.jpg',
    keywords: ['#IAGH', '#향유고래', '#외로운', '#사냥꾼', '#심해'],
    creator: '@Ravel'
  },
  'EALR': {
    image: '/images/types/EALR.png',
    keywords: ['#EALR', '#북극늑대', '#무리생활', '#적극적', '#사냥'],
    creator: '@Belle'
  },
  'EALH': {
    image: '/images/types/EALH.jpg',
    keywords: ['#EALH', '#사향소', '#공동체', '#방어', '#유대'],
    creator: '@Hee'
  },
  'ICLH': {
    image: '/images/types/ICLH.png',
    keywords: ['#ICLH', '#북극땅다람쥐', '#신중함', '#감성적', '#사색가'],
    creator: '@Belle'
  },
  'ECGH': {
    image: '/images/types/ECGH.png',
    keywords: ['#ECGH', '#대서양퍼핀', '#군집', '#전략가', '#감성적'],
    creator: '@이승민_K-BioX AI BioX_1185'
  },
  // 다른 타입들도 여기에 추가 가능
  // 예시:
  // 'ICLG': {
  //   image: '/images/types/ICLG.png',
  //   keywords: ['#ICLG', '#하프물범', '#키워드'],
  //   creator: 'K-BioX' // 각 타입별로 다른 제작자 설정 가능
  // },
  // 기본값으로 fallback
  default: {
    image: '/images/types/ICLR.png', // default.png가 없으므로 ICLR.png를 기본값으로 사용
    keywords: [],
    creator: 'K-BioX' // 기본 제작자
  }
};


// 크리스마스 씰 생성 프롬프트 (사용자가 제공할 프롬프트로 교체 필요)
const CHRISTMAS_SEAL_PROMPT = `여기에 크리스마스 씰 생성 프롬프트가 들어갑니다.
프롬프트 내용을 여기에 입력해주세요.`;

function Result({ result, onRestart }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [promptCopySuccess, setPromptCopySuccess] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const savedRef = useRef(new Set()); // 이미 저장한 결과 추적 (타입코드만 저장)
  const savingRef = useRef(false); // 현재 저장 중인지 추적 (동시 요청 방지)
  
  // 공유 페이지인지 확인 (URL 파라미터 또는 result.isShared 플래그)
  const urlParams = new URLSearchParams(window.location.search);
  const isSharedPage = urlParams.get('share') === 'true' || result.isShared;
  
  // 이미지 경로 설정 (필요시 수정 가능)
  const logoImage = '/images/logos/K-BioX_Logo.png';
  const fallbackEmoji = '🦭';

  // 통계 데이터 로드
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API URL 구성: 환경 변수가 있으면 사용, 없으면 상대 경로 사용
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/api/get-stats` : '/api/get-stats';
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch stats:', response.status, response.statusText);
          }
          // 에러가 발생해도 기본값 설정 (통계 섹션은 표시되지만 0명으로 표시)
          setStats({ totalCount: 0, typeCounts: {} });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch stats:', error);
        }
        // 네트워크 에러 등이 발생해도 기본값 설정
        setStats({ totalCount: 0, typeCounts: {} });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 결과 저장 (통계용) - 중복 저장 방지
  useEffect(() => {
    if (!result || !result.typeCode) {
      return;
    }

    // 공유 링크로 접근한 경우 저장하지 않음
    if (result.isShared) {
      return;
    }

    const resultKey = result.typeCode;
    let isCancelled = false; // cleanup 함수에서 취소 플래그

    // 이미 저장 중이면 스킵
    if (savingRef.current) {
      return;
    }

    // 이미 저장한 결과인지 확인 (useRef + localStorage 이중 체크)
    const storageKey = `saved_${resultKey}`;
    const savedInStorage = localStorage.getItem(storageKey);
    const now = Date.now();
    
    // localStorage에서 1분 이내에 저장한 기록이 있으면 스킵
    if (savedInStorage) {
      const savedTime = parseInt(savedInStorage);
      if (now - savedTime < 60000) { // 1분 이내
        savedRef.current.add(resultKey); // 메모리에도 추가
        // 통계만 다시 로드
        const fetchStats = async () => {
          if (isCancelled) return;
          try {
            const baseUrl = process.env.REACT_APP_API_URL || '';
            const statsUrl = baseUrl ? `${baseUrl}/api/get-stats` : '/api/get-stats';
            const statsResponse = await fetch(statsUrl);
            if (statsResponse.ok && !isCancelled) {
              const statsData = await statsResponse.json();
              setStats(statsData);
            }
          } catch (error) {
            if (!isCancelled && process.env.NODE_ENV !== 'production') {
              console.error('Failed to fetch stats:', error);
            }
          }
        };
        fetchStats();
        return;
      }
    }
    
    // 메모리에서도 확인
    if (savedRef.current.has(resultKey)) {
      // 통계만 다시 로드
      const fetchStats = async () => {
        if (isCancelled) return;
        try {
          const baseUrl = process.env.REACT_APP_API_URL || '';
          const statsUrl = baseUrl ? `${baseUrl}/api/get-stats` : '/api/get-stats';
          const statsResponse = await fetch(statsUrl);
          if (statsResponse.ok && !isCancelled) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        } catch (error) {
          if (!isCancelled && process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch stats:', error);
          }
        }
      };
      fetchStats();
      return;
    }

    // 저장 실행 (서버에서도 중복 체크하므로 프론트엔드는 간단하게)
    const saveResult = async () => {
      // 저장 중 플래그 설정 (동시 요청 방지)
      savingRef.current = true;
      // localStorage에도 즉시 플래그 설정 (동시 요청 완전 차단)
      localStorage.setItem(storageKey, now.toString());
      savedRef.current.add(resultKey); // 메모리에도 즉시 추가
      
      try {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/api/submit-result` : '/api/submit-result';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ typeCode: result.typeCode }),
        });
        
        if (isCancelled) {
          savingRef.current = false;
          return;
        }
        
        const responseData = await response.json();
        
        if (response.ok && !isCancelled) {
          // 저장 후 통계 다시 로드
          const baseUrl = process.env.REACT_APP_API_URL || '';
          const statsUrl = baseUrl ? `${baseUrl}/api/get-stats` : '/api/get-stats';
          const statsResponse = await fetch(statsUrl);
          if (statsResponse.ok && !isCancelled) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        } else if (!isCancelled) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to save result:', responseData);
          }
          // 실패한 경우 플래그 제거하여 재시도 가능하게
          savedRef.current.delete(resultKey);
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        if (!isCancelled) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to save result:', error);
          }
          // 에러 발생 시 플래그 제거하여 재시도 가능하게
          savedRef.current.delete(resultKey);
          localStorage.removeItem(storageKey);
        }
      } finally {
        if (!isCancelled) {
          // 저장 완료 후 플래그 해제
          savingRef.current = false;
        }
      }
    };
    
    saveResult();

    // cleanup 함수: 컴포넌트가 언마운트되거나 result가 변경되면 취소
    return () => {
      isCancelled = true;
      savingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.typeCode]); // result.typeCode만 의존성으로 사용 (의도적)

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

  // 링크 복사 기능
  const handleCopyLink = async () => {
    // 프로덕션 URL 우선 사용 (환경 변수로 설정 가능)
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const shareUrl = `${siteUrl}${window.location.pathname}?type=${result.typeCode}&share=true`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        alert('링크 복사에 실패했습니다. 수동으로 복사해주세요: ' + shareUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  // 프롬프트 복사 기능
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(CHRISTMAS_SEAL_PROMPT);
      setPromptCopySuccess(true);
      setTimeout(() => setPromptCopySuccess(false), 2000);
    } catch (err) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = CHRISTMAS_SEAL_PROMPT;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setPromptCopySuccess(true);
        setTimeout(() => setPromptCopySuccess(false), 2000);
      } catch (err) {
        alert('프롬프트 복사에 실패했습니다. 수동으로 복사해주세요.');
      }
      document.body.removeChild(textArea);
    }
  };

  // Gemini 앱 열기
  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/', '_blank', 'noopener,noreferrer');
  };

  // 카카오톡 공유 기능
  const handleKakaoShare = () => {
    // 카카오톡 SDK 초기화 확인
    if (typeof window.Kakao === 'undefined') {
      alert('카카오톡 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const kakaoKey = process.env.REACT_APP_KAKAO_JS_KEY;
    if (!kakaoKey) {
      alert('카카오톡 JavaScript 키가 설정되지 않았습니다.');
      return;
    }

    // 카카오톡 초기화 (이미 초기화되었는지 확인)
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }

    // 프로덕션 URL 우선 사용 (환경 변수로 설정 가능)
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const shareUrl = `${siteUrl}${window.location.pathname}?type=${result.typeCode}&share=true`;
    // 이미지 URL을 절대 경로로 설정 (카카오톡이 크롤링할 수 있도록)
    const imageUrl = `${siteUrl}${typeInfo.image}`;
    
    // 설명 텍스트 최적화 (카카오톡은 200자 제한)
    const description = result.description 
      ? result.description.substring(0, 200) 
      : `나의 Bio-MBTI 결과: ${result.typeCode} - 환경 보호 성향을 알아보는 테스트`;
    
    // 모바일 환경 확인 (카카오톡 공유는 모바일에서만 정상 작동)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 현재 도메인 정보 로깅 (디버깅용)
    const currentDomain = window.location.origin;
    if (process.env.NODE_ENV === 'development') {
      console.log('카카오톡 공유 - 현재 도메인:', currentDomain);
      console.log('카카오톡 공유 - 사용할 URL:', shareUrl);
    }
    
    try {
      // 공유 템플릿 설정 (피드 타입 - 이미지 포함)
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: result.title || `당신의 Bio-MBTI 결과: ${result.typeCode}`,
          description: description,
          imageUrl: imageUrl, // 결과 이미지 포함
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        social: {
          likeCount: stats?.totalCount || 0, // 좋아요 수 (참여자 수)
        },
        buttons: [
          {
            title: '테스트 하러 가기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
        // 성공/실패 콜백 추가
        success: function(response) {
          if (process.env.NODE_ENV === 'development') {
            console.log('카카오톡 공유 성공:', response);
          }
        },
        fail: function(error) {
          // 도메인 불일치 에러 감지
          const errorMsg = error?.msg || error?.message || JSON.stringify(error);
          const isDomainError = errorMsg.includes('domain mismatched') || 
                               errorMsg.includes('domain') || 
                               (error?.code === -401);
          
          if (isDomainError) {
            console.error('카카오톡 도메인 등록 오류:', errorMsg);
            console.error('현재 도메인:', currentDomain);
            console.error('해결 방법: 카카오톡 개발자 콘솔 > 앱 설정 > 플랫폼 > Web 플랫폼에 다음 도메인을 등록하세요:');
            console.error(`  - ${currentDomain}`);
            alert(`카카오톡 공유를 사용하려면 도메인 등록이 필요합니다.\n\n현재 도메인: ${currentDomain}\n\n카카오톡 개발자 콘솔에서 이 도메인을 등록해주세요.\n(앱 설정 > 플랫폼 > Web 플랫폼)`);
          } else {
            // 다른 에러는 기존 로직대로 처리
            if (!isMobile) {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                  alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n링크가 클립보드에 복사되었습니다!');
                }).catch(() => {
                  alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n모바일에서 접속하시면 카카오톡으로 공유할 수 있습니다.');
                });
              } else {
                alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n모바일에서 접속하시면 카카오톡으로 공유할 수 있습니다.');
              }
            }
            if (process.env.NODE_ENV === 'development') {
              console.warn('카카오톡 공유 에러:', errorMsg);
            }
          }
        }
      });
    } catch (error) {
      // 동기적 에러 처리 (kakaolink:// 스킴 에러 등)
      const errorMsg = error?.message || String(error);
      const isSchemeError = errorMsg.includes('kakaolink://') || 
                           errorMsg.includes('scheme does not have a registered handler');
      
      if (isSchemeError) {
        // 데스크톱 브라우저에서 발생하는 kakaolink:// 스킴 에러는 정상적인 동작
        if (!isMobile) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n링크가 클립보드에 복사되었습니다!');
            }).catch(() => {
              alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n모바일에서 접속하시면 카카오톡으로 공유할 수 있습니다.');
            });
          } else {
            alert('데스크톱에서는 카카오톡 공유가 지원되지 않습니다.\n모바일에서 접속하시면 카카오톡으로 공유할 수 있습니다.');
          }
        }
        // 개발 환경에서만 에러 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.warn('카카오톡 공유 에러 (정상 동작 - 데스크톱):', errorMsg);
        }
      } else {
        // 다른 에러는 로깅
        console.error('카카오톡 공유 예상치 못한 에러:', error);
        alert('카카오톡 공유 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };


  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
                      <div className="result-title-container">
                        <div className="result-logo-container">
                          {!logoError && logoImage ? (
                            <img 
                              src={logoImage} 
                              alt="Bio-MBTI Logo" 
                              className="result-logo-image"
                              onError={() => setLogoError(true)}
                            />
                          ) : (
                            <span className="result-logo-fallback">{fallbackEmoji}</span>
                          )}
                        </div>
                        <h1>{isSharedPage ? '친구의' : '당신의'} Bio-MBTI 결과: {result.typeCode}</h1>
                      </div>
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
            <p className="seal-creator-text">
              {typeInfo.creator || 'K-BioX'}님이 제작한 씰이에요!
            </p>
          </div>
          {isSharedPage ? (
            <h2 className="type-title" style={{ textAlign: 'center', lineHeight: '1.6' }}>
              🎯 나도 테스트해보고 싶다면?<br />
              <span style={{ fontSize: '0.9em', fontWeight: 'normal', color: '#666' }}>
                아래 버튼을 눌러 나만의 Bio-MBTI 결과를 확인해보세요!
              </span>
            </h2>
          ) : (
            <h2 className="type-title">{result.title || `당신의 Bio-MBTI 결과: ${result.typeCode}`}</h2>
          )}
          <div className="type-keywords">
            {keywords.map((keyword, index) => (
              <span key={index} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </div>

        <div className="result-description">
          <p>{result.description}</p>
        </div>

        {/* 통계 표시 - 항상 표시 */}
        <div className="stats-section">
          {statsLoading ? (
            <p className="stats-text">통계를 불러오는 중...</p>
          ) : (
            <p className="stats-text">
              지금까지 <strong>{stats?.totalCount ? stats.totalCount.toLocaleString() : 0}명</strong>이 참여했어요! 🎉
            </p>
          )}
        </div>

        {/* 크리스마스 씰 생성 섹션 */}
        <div className="seal-section">
          <h3 className="seal-section-title">나만의 씰을 만들어보고 싶다면?</h3>
          <button 
            className="gemini-prompt-button" 
            onClick={() => setShowPromptModal(true)}
          >
            ✨ Gemini Prompt 받으러가기
          </button>
        </div>

        <div className="button-section">
          <button 
            className="share-button" 
            onClick={handleCopyLink}
            title="결과 링크 복사"
          >
            {copySuccess ? '✓ 링크 복사됨!' : '🔗 링크 공유하기'}
          </button>
          <button 
            className="kakao-share-button" 
            onClick={handleKakaoShare}
            title="카카오톡으로 공유하기"
          >
            💬 카카오톡 공유
          </button>
          <button className="restart-button" onClick={onRestart}>
            {isSharedPage ? '테스트하기' : '다시 테스트하기'}
          </button>
        </div>
      </div>

      {/* 프롬프트 모달 */}
      {showPromptModal && (
        <div className="prompt-modal-overlay" onClick={() => setShowPromptModal(false)}>
          <div className="prompt-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="prompt-modal-close" 
              onClick={() => setShowPromptModal(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <h3 className="prompt-modal-title">프롬프트를 복사하여 Gemini 앱에 붙여넣고 사용해보세요</h3>
            <div className="prompt-code-block">
              <pre><code>{CHRISTMAS_SEAL_PROMPT}</code></pre>
            </div>
            <div className="prompt-modal-buttons">
              <button 
                className="prompt-copy-button" 
                onClick={handleCopyPrompt}
              >
                {promptCopySuccess ? '✓ 복사 완료!' : '📋 프롬프트 복사하기'}
              </button>
              <button 
                className="prompt-gemini-button" 
                onClick={handleOpenGemini}
              >
                ✨ Gemini로 이동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;

