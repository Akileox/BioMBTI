# Bio-MBTI 프로젝트

북극 생물과 환경 보호를 테마로 한 MBTI 테스트 애플리케이션입니다. Google Gemini AI를 활용하여 사용자의 답변을 분석하고 맞춤형 결과를 제공합니다.

## 📋 목차

- [프로젝트 구조](#프로젝트-구조)
- [환경 설정](#환경-설정)
- [주요 수정 사항](#주요-수정-사항)
- [배포 설정](#배포-설정)

## 📁 프로젝트 구조

```
BioMBTI/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── App.js     # 메인 앱 컴포넌트
│   │   ├── Result.js  # 결과 페이지 (타입별 이미지/키워드 설정)
│   │   └── ...
│   └── public/
│       ├── data/
│       │   └── questions.json  # 질문 데이터
│       └── images/
│           ├── types/           # 타입별 이미지 (수정 필요)
│           └── TeamGemini.png   # 로딩 페이지 이미지
└── server/            # Express 백엔드
    ├── index.js       # 서버 메인 파일 (타입별 제목 매핑)
    └── .env           # 환경 변수 설정
```

## ⚙️ 환경 설정

### 1. 백엔드 서버 설정

`server/` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Gemini API 설정
USE_MOCK=false
GEMINI_API_KEY=your_gemini_api_key_here

# 서버 포트 (선택사항)
PORT=3001

# Gemini 모델 (선택사항)
GEMINI_MODEL=gemini-2.5-flash-preview-09-2025
```

**Gemini API 키 발급:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급
2. 발급한 키를 `GEMINI_API_KEY`에 입력

### 2. 프론트엔드 환경 변수 (선택사항)

로컬 개발 시 `frontend/` 폴더에 `.env` 파일을 생성할 수 있습니다:

```env
# 로컬 개발 시 비워두면 프록시 사용
REACT_APP_API_URL=
```

## 🔧 주요 수정 사항

### 1. 타입별 이미지 추가

**위치:** `frontend/public/images/types/`

각 타입 코드별로 이미지 파일을 추가하세요:
- `ICLR.png`
- `EACL.png`
- `IAGH.png`
- ... (16개 타입)

**설정 위치:** `frontend/src/Result.js`

```javascript
const typeData = {
  'ICLR': {
    image: '/images/types/ICLR.png',
    keywords: ['#ICLR', '#하프물범', '#높은 적응력']
  },
  'EACL': {
    image: '/images/types/EACL.png',
    keywords: ['#EACL', '#키워드1', '#키워드2']
  },
  // 다른 타입들 추가...
};
```

### 2. 타입별 제목 매핑

**위치:** `server/index.js` (48-68줄)

각 타입 코드별 제목을 설정하세요:

```javascript
const typeTitleMap = {
  'ICLR': "당신은 '혼자서도 척척 하프물범'형!",
  'ICLG': "당신은 '혼자서도 척척 하프물범'형!",
  'ECLR': "당신은 '함께하면 더 즐거운 북극곰'형!",
  // 다른 타입들 추가...
  'default': "당신의 Bio-MBTI 결과"
};
```

### 3. 타입별 키워드 설정

**위치:** `frontend/src/Result.js` (5-16줄)

각 타입별로 표시할 해시태그 키워드를 설정하세요:

```javascript
const typeData = {
  'ICLR': {
    image: '/images/types/ICLR.png',
    keywords: ['#ICLR', '#하프물범', '#높은 적응력']
  },
  // 다른 타입들...
};
```

### 4. 질문 데이터 수정

**위치:** `frontend/public/data/questions.json`

질문 내용, 옵션, 축(E/I, A/C, G/L, H/R)을 수정할 수 있습니다.

**데이터 구조:**
```json
{
  "id": 1,
  "axis": "E/I",
  "question": "질문 내용",
  "options": [
    { "text": "옵션 1", "value": "E" },
    { "text": "옵션 2", "value": "I" }
  ]
}
```

### 5. 로딩 메시지 수정

**위치:** `frontend/src/App.js` (17-21줄)

로딩 중 표시되는 플로팅 메시지를 수정할 수 있습니다:

```javascript
const loadingMessages = [
  'Gemini가 답변을 분석하는 중...',
  'Gemini가 올바른 분류를 찾는 중...',
  'Gemini가 이미지 생성 중...'
];
```

### 6. 프로그레스 바 메시지 수정

**위치:** `frontend/src/App.js` (141줄)

프로그레스 바에 표시되는 메시지를 변경할 수 있습니다:

```javascript
const message = 'Merry Christmas';  // 원하는 메시지로 변경
```

## 🚀 배포 설정

### Vercel (프론트엔드) 환경 변수

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

- **Name:** `REACT_APP_API_URL`
- **Value:** `https://your-backend-server.com` (백엔드 서버 URL)
- **Environment:** Production, Preview, Development 모두 선택

### Render (백엔드) 환경 변수

Render 대시보드 → 서비스 → Environment:

- `USE_MOCK=false`
- `GEMINI_API_KEY=your_api_key`
- `PORT=3001` (선택사항)

## 📝 주요 기능

1. **12가지 질문 테스트**
   - 4개 축 (E/I, A/C, G/L, H/R) 기반 분류
   - 질문별 답변 수집

2. **Gemini AI 분석**
   - 사용자 답변을 분석하여 16가지 타입 중 하나로 분류
   - 북극 동물 메타포를 활용한 창의적 설명 생성

3. **결과 표시**
   - 타입별 이미지
   - 해시태그 키워드
   - 상세 설명

4. **로딩 화면**
   - TeamGemini 이미지
   - 플로팅 메시지
   - 글래스모피즘 프로그레스 바

## 🔍 타입 코드 체계

16가지 Bio-MBTI 타입:

- **첫 번째 글자:** E (Together) / I (Alone)
- **두 번째 글자:** A (Active) / C (Cautious)
- **세 번째 글자:** G (Global) / L (Local)
- **네 번째 글자:** H (Heart-driven) / R (Reason-driven)

예시: `ICLR` = 혼자서(I) + 신중하게(C) + 지역적으로(L) + 이성적으로(R)

## 📌 주의사항

1. **이미지 파일명:** 타입 코드와 정확히 일치해야 합니다 (대소문자 구분)
2. **타입 코드:** 4글자 대문자로 작성해야 합니다
3. **환경 변수:** `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
4. **API 키 보안:** 절대 공개 저장소에 API 키를 커밋하지 마세요

## 🛠️ 개발 명령어

### 프론트엔드
```bash
cd frontend
npm install
npm start
```

### 백엔드
```bash
cd server
npm install
npm start
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

