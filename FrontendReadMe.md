# Bio-MBTI 프론트엔드 기능 설명서

## 📋 목차
1. [메인 앱 구조](#1-메인-앱-구조-appjs)
2. [설문 화면](#2-설문-화면-surveyjs)
3. [로딩 화면](#3-로딩-화면-appjs-내부)
4. [결과 화면](#4-결과-화면-resultjs)
5. [배경 효과](#5-배경-효과-snowbackgroundjs)
6. [전체 배경 테마](#6-전체-배경-테마)
7. [Gemini API 배지](#7-gemini-api-배지-geminibadgejs)
8. [홍보 캐러셀](#8-홍보-캐러셀-promocarouseljs)
9. [홍보 카드 섹션](#9-홍보-카드-섹션-promosectionjs)
10. [Footer](#10-footer-footerjs)
11. [주요 데이터 파일](#주요-데이터-파일)
12. [빠른 수정 가이드](#빠른-수정-가이드)

---

## 1. 메인 앱 구조 (`App.js`)

### 기능
- 전체 앱의 상태 관리 및 라우팅
- 설문 → 로딩 → 결과 화면 전환
- 백엔드 API 호출 및 에러 처리
- 로딩 최소 5초 보장 로직

### 수정 위치
- **`frontend/src/App.js`**: 앱 로직, API 엔드포인트, 로딩 시간 설정
- **`frontend/src/App.css`**: 로딩/에러 화면 스타일

### 주요 코드 위치
- API 호출: `handleSurveyComplete` 함수 (14-79줄)
- 로딩 화면: 86-107줄
- 에러 화면: 109-119줄

---

## 2. 설문 화면 (`Survey.js`)

### 기능
- 12개 질문을 순차적으로 표시
- 진행률 바 표시
- 각 질문마다 2개 선택지 제공
- 질문 데이터는 JSON 파일에서 로드

### 수정 위치
- **`frontend/src/Survey.js`**: 설문 로직, 질문 표시 방식
- **`frontend/src/Survey.css`**: 설문 화면 스타일
- **`frontend/public/data/questions.json`**: 질문 내용 수정

### 질문 데이터 구조
```json
{
  "id": 1,
  "axis": "E/I",
  "question": "질문 내용",
  "options": [
    { "text": "선택지 1", "value": "E" },
    { "text": "선택지 2", "value": "I" }
  ]
}
```

---

## 3. 로딩 화면 (`App.js` 내부)

### 기능
- 분석 중 화면 표시
- 이모티콘 애니메이션 (🔬✨)
- 동적 진행률 표시 (0% → 100%)
- 최소 5초 동안 로딩 화면 유지

### 수정 위치
- **`frontend/src/App.js`** (86-107줄): 로딩 메시지, 이모티콘 변경
- **`frontend/src/App.css`**: 로딩 스타일, 진행률 바 디자인

### 주요 설정
- 최소 로딩 시간: `minLoadingTime = 5000` (20줄)
- 진행률 업데이트 간격: 200ms (28줄)

---

## 4. 결과 화면 (`Result.js`)

### 기능
- Bio-MBTI 결과 표시
  - 4글자 타입 코드 (예: ICLR)
  - 캐릭터 제목
  - 상세 설명
- "다시 테스트하기" 버튼

### 수정 위치
- **`frontend/src/Result.js`**: 결과 표시 구조
- **`frontend/src/Result.css`**: 결과 화면 스타일

---

## 5. 배경 효과 (`SnowBackground.js`)

### 기능
- 눈 내리는 애니메이션 효과
- Canvas 기반 실시간 렌더링
- 모든 페이지에 적용

### 수정 위치
- **`frontend/src/SnowBackground.js`**: 눈 개수, 속도, 크기 조절
- **`frontend/src/SnowBackground.css`**: Canvas 스타일

### 주요 설정
- 눈 개수: `snowflakeCount = 100` (SnowBackground.js)
- 눈 크기: `Math.random() * 3 + 1`
- 눈 속도: `Math.random() * 2 + 0.5`

---

## 6. 전체 배경 테마

### 기능
- 밝은 빙하 느낌의 그라데이션 배경
- 여러 페이지에 통일된 배경 적용
- 반복 패턴 오버레이로 깊이감 연출

### 수정 위치
- **`frontend/src/Survey.css`**: 설문 페이지 배경
- **`frontend/src/Result.css`**: 결과 페이지 배경
- **`frontend/src/App.css`**: 로딩/에러 페이지 배경

### 배경 색상
```css
background: linear-gradient(180deg, 
  #e0f2f7 0%, 
  #b8e0f0 20%,
  #a8d8ea 40%,
  #c5e8f5 60%,
  #b0dde8 80%,
  #d0e8f2 100%
);
```

---

## 7. Gemini API 배지 (`GeminiBadge.js`)

### 기능
- Gemini AI 활용 사실 표시
- 설문 완료 후, 홍보 섹션 위에 배치
- 글래스모피즘 스타일

### 수정 위치
- **`frontend/src/GeminiBadge.js`**: 배지 텍스트 내용
- **`frontend/src/GeminiBadge.css`**: 배지 스타일

---

## 8. 홍보 캐러셀 (`PromoCarousel.js`)

### 기능
- 자동 슬라이드 홍보 이미지
- 3개 슬라이드 자동 전환 (4초 간격)
- 이미지 또는 이모티콘 지원
- 인디케이터로 수동 이동 가능

### 수정 위치
- **`frontend/src/PromoCarousel.js`**: 캐러셀 아이템 데이터 (5-29줄)
  - `imageUrl`: 이미지 경로 (예: `/images/photo.jpg`)
  - `image`: 이모티콘 (이미지가 없을 때 대체)
  - `title`, `description`: 제목과 설명
  - `color`: 그라데이션 색상
- **`frontend/src/PromoCarousel.css`**: 캐러셀 스타일, 전환 속도

### 데이터 구조 예시
```javascript
{
  id: 1,
  title: 'K-BioX 연구 활동',
  description: '북극 생물과 환경 보호 연구',
  image: '🔬',           // 이모티콘
  imageUrl: '/images/research.jpg',  // 이미지 URL (선택)
  color: '#4a90e2'
}
```

### 이미지 추가 방법
1. 이미지를 `frontend/public/images/` 폴더에 저장
2. `PromoCarousel.js`의 `imageUrl` 필드에 경로 입력
   - 예: `imageUrl: '/images/christmas-seal.jpg'`

---

## 9. 홍보 카드 섹션 (`PromoSection.js`)

### 기능
- 스크롤 플로팅 홍보 카드
- 4개 홍보 카드 제공
- 스크롤 시 순차적으로 등장하는 애니메이션
- 각 카드에 링크 포함

### 수정 위치
- **`frontend/src/PromoSection.js`**: 홍보 카드 데이터 (5-41줄)
  - `icon`: 이모티콘
  - `title`: 제목
  - `subtitle`: 부제목
  - `description`: 설명
  - `link`: 링크 URL
  - `linkText`: 링크 텍스트
- **`frontend/src/PromoSection.css`**: 카드 스타일, 애니메이션

### 데이터 구조 예시
```javascript
{
  id: 1,
  icon: '🔬',
  title: 'K-BioX',
  subtitle: '환경 보호와 생물 다양성 연구',
  description: 'K-BioX는 북극 생물과 환경 보호에 대한 연구와 교육을 통해 지구의 미래를 함께 만들어갑니다.',
  link: 'https://kbiox.org',
  linkText: 'K-BioX 홈페이지 방문하기'
}
```

---

## 10. Footer (`Footer.js`)

### 기능
- 저작권 및 제작자 정보 표시
- K-BioX 저작권 표시
- Gemini AI 활용 표시
- 페이지 맨 아래 정적 배치 (스크롤 시 따라오지 않음)

### 수정 위치
- **`frontend/src/Footer.js`**: Footer 텍스트 내용
- **`frontend/src/Footer.css`**: Footer 스타일

---

## 주요 데이터 파일

### 질문 데이터
- **위치**: `frontend/public/data/questions.json`
- **구조**: 12개 질문 객체 배열
  - `id`: 질문 번호
  - `axis`: 축 (E/I, A/C, G/L, H/R)
  - `question`: 질문 내용
  - `options`: 선택지 배열
    - `text`: 선택지 텍스트
    - `value`: 선택지 값 (E, I, A, C, G, L, H, R)

---

## 빠른 수정 가이드

| 수정하고 싶은 것 | 파일 위치 | 구체적 위치 |
|----------------|----------|-----------|
| **질문 내용 변경** | `frontend/public/data/questions.json` | 전체 파일 |
| **홍보 캐러셀 이미지/내용** | `frontend/src/PromoCarousel.js` | 5-29줄 (carouselItems 배열) |
| **홍보 카드 내용** | `frontend/src/PromoSection.js` | 5-41줄 (promoData 배열) |
| **로딩 메시지/이모티콘** | `frontend/src/App.js` | 91-94줄 |
| **로딩 최소 시간** | `frontend/src/App.js` | 20줄 (minLoadingTime) |
| **배경 색상** | `frontend/src/Survey.css`<br>`frontend/src/Result.css`<br>`frontend/src/App.css` | 각 파일의 `.survey-container`, `.result-container`, `.loading-screen` |
| **Footer 텍스트** | `frontend/src/Footer.js` | 전체 파일 |
| **설문 스타일** | `frontend/src/Survey.css` | 전체 파일 |
| **결과 스타일** | `frontend/src/Result.css` | 전체 파일 |
| **눈 내리는 효과** | `frontend/src/SnowBackground.js` | 30줄 (snowflakeCount) |

---

## 파일 구조 요약

```
frontend/src/
├── App.js              # 메인 앱, 라우팅, API 호출
├── App.css             # 로딩/에러 화면 스타일
├── Survey.js           # 설문 화면
├── Survey.css          # 설문 화면 스타일
├── Result.js           # 결과 화면
├── Result.css          # 결과 화면 스타일
├── SnowBackground.js   # 눈 내리는 효과
├── SnowBackground.css  # 눈 효과 스타일
├── GeminiBadge.js      # Gemini API 배지
├── GeminiBadge.css     # 배지 스타일
├── PromoCarousel.js    # 홍보 캐러셀
├── PromoCarousel.css   # 캐러셀 스타일
├── PromoSection.js     # 홍보 카드 섹션
├── PromoSection.css    # 홍보 섹션 스타일
├── Footer.js           # Footer
└── Footer.css          # Footer 스타일

frontend/public/
├── data/
│   └── questions.json  # 질문 데이터
└── images/             # 이미지 파일 저장 위치 (캐러셀용)
```

---

## 주요 기능 흐름

1. **사용자 접속** → 설문 화면 (`Survey.js`)
2. **12개 질문 답변** → 질문 데이터는 `questions.json`에서 로드
3. **마지막 질문 답변** → `App.js`의 `handleSurveyComplete` 호출
4. **로딩 화면** (최소 5초) → 진행률 표시, 이모티콘 애니메이션
5. **API 호출** → `/api/get-result`로 POST 요청
6. **결과 화면** → 타입 코드, 제목, 설명 표시
7. **홍보 섹션** → Gemini 배지 → 캐러셀 → 홍보 카드들
8. **Footer** → 저작권 정보 표시

---

## 스타일 테마

- **배경**: 밝은 빙하 느낌 (하늘색/파란색 그라데이션)
- **카드**: 글래스모피즘 (반투명 + blur 효과)
- **색상**: 파란색 계열 (#4a90e2, #357abd)
- **애니메이션**: 부드러운 전환 효과

---

## 주의사항

1. **이미지 추가 시**: `frontend/public/images/` 폴더에 저장 후 경로는 `/images/파일명` 형식 사용
2. **질문 수정 시**: `questions.json`의 구조를 유지해야 함
3. **API 엔드포인트**: `App.js`의 31줄에서 변경 가능
4. **로딩 시간**: `App.js`의 20줄 `minLoadingTime` 값 변경

---

## 개발 환경 실행

```bash
# 프론트엔드만 실행
cd frontend
npm start

# 전체 프로젝트 실행 (서버 + 프론트)
cd /home/akileo/Project/BioMBTI
npm run dev
```

---

**마지막 업데이트**: 2025.11.07.

