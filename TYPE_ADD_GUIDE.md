# 🦭 타입 추가 가이드

새로운 Bio-MBTI 타입을 추가할 때 수정해야 할 모든 위치를 정리한 문서입니다.

## 📋 수정해야 할 파일 목록

### 1. **이미지 파일 추가** (필수)
**위치:** `frontend/public/images/types/`
- 파일명: `{타입코드}.png` (예: `ICLG.png`, `ICHR.png`)
- 예시: `ICLG.png`, `ICHR.png` 등

---

### 2. **frontend/src/Result.js** (필수)
**위치:** 5-24번 줄의 `typeData` 객체

```javascript
const typeData = {
  'ICLR': {
    image: '/images/types/ICLR.png',
    keywords: ['#ICLR', '#하프물범', '#높은 적응력'],
    creator: '@Akileox' // 동물별 제작자 설정
  },
  // 새 타입 추가 예시:
  'ICLG': {
    image: '/images/types/ICLG.png',
    keywords: ['#ICLG', '#하프물범', '#키워드1', '#키워드2'],
    creator: 'K-BioX' // 제작자 이름 (선택사항, 없으면 기본값 'K-BioX' 사용)
  },
  // ... 다른 타입들
};
```

**수정 내용:**
- `image`: 이미지 파일 경로
- `keywords`: 해시태그 키워드 배열
- `creator`: 제작자 이름 (선택사항, 없으면 기본값 사용)

---

### 3. **server/index.js** (필수)
**위치 1:** 124-143번 줄의 `typeTitleMap` 객체

```javascript
const typeTitleMap = {
  'ICLR': "당신은 '혼자서도 척척 하프물범'형!",
  'ICLG': "당신은 '혼자서도 척척 하프물범'형!",
  // 새 타입 추가:
  'ICHR': "당신은 '혼자서도 척척 하프물범'형!",
  // ... 다른 타입들
  'default': "당신의 Bio-MBTI 결과"
};
```

**위치 2:** 146-164번 줄의 `typeAnimalMap` 객체

```javascript
const typeAnimalMap = {
  'ICLR': '하프물범',
  'ICLG': '하프물범',
  // 새 타입 추가:
  'ICHR': '하프물범',
  // ... 다른 타입들
  'default': '북극 동물'
};
```

**위치 3:** 486-491번 줄의 `allTypes` 배열 (통계용)

```javascript
const allTypes = [
  'ICLR', 'ICLG', 'ICHR', 'ICHG',
  'IACR', 'IACG', 'IAHR', 'IAHG',
  'ECLR', 'ECLG', 'ECHR', 'ECHG',
  'EACR', 'EACG', 'EAHR', 'EAHG',
  // 새 타입 추가:
  'NEWTYPE' // 여기에 추가
];
```

---

### 4. **frontend/src/App.js** (필수)
**위치:** 21-38번 줄의 `typeImageMap` 객체 (오픈그래프 메타태그용)

```javascript
const typeImageMap = {
  'ICLR': '/images/types/ICLR.png',
  'ICLG': '/images/types/ICLR.png',
  // 새 타입 추가:
  'ICHR': '/images/types/ICHR.png',
  // ... 다른 타입들
};
```

**참고:** 카카오톡 공유 시 사용되는 이미지 경로입니다.

---

### 5. **firestore.rules** (필수)
**위치:** 6번 줄의 정규식 패턴

```javascript
function isValidTypeCode(typeCode) {
  return typeCode.matches('^(ICLR|ICLG|ICHR|ICHG|IACR|IACG|IAHR|IAHG|ECLR|ECLG|ECHR|ECHG|EACR|EACG|EAHR|EAHG|NEWTYPE)$');
  //                                                                                                                      ^^^^^^^^ 새 타입 추가
}
```

**참고:** Firebase Firestore 보안 규칙에서 유효한 타입 코드를 검증하는 정규식입니다.

---

## 📝 체크리스트

새 타입을 추가할 때 다음 항목을 모두 확인하세요:

- [ ] 이미지 파일 추가 (`frontend/public/images/types/{타입코드}.png`)
- [ ] `frontend/src/Result.js`의 `typeData`에 타입 추가
- [ ] `server/index.js`의 `typeTitleMap`에 타입 추가
- [ ] `server/index.js`의 `typeAnimalMap`에 타입 추가
- [ ] `server/index.js`의 `allTypes` 배열에 타입 추가
- [ ] `frontend/src/App.js`의 `typeImageMap`에 타입 추가
- [ ] `firestore.rules`의 정규식에 타입 추가

---

## 💡 예시: ICLG 타입 추가하기

### 1. 이미지 파일
```
frontend/public/images/types/ICLG.png
```

### 2. frontend/src/Result.js
```javascript
'ICLG': {
  image: '/images/types/ICLG.png',
  keywords: ['#ICLG', '#하프물범', '#키워드'],
  creator: 'K-BioX'
},
```

### 3. server/index.js
```javascript
// typeTitleMap
'ICLG': "당신은 '혼자서도 척척 하프물범'형!",

// typeAnimalMap
'ICLG': '하프물범',

// allTypes 배열
'ICLR', 'ICLG', 'ICHR', 'ICHG', // ICLG 추가됨
```

### 4. frontend/src/App.js
```javascript
'ICLG': '/images/types/ICLG.png',
```

### 5. firestore.rules
```javascript
return typeCode.matches('^(ICLR|ICLG|ICHR|...)$');
//                      ^^^^^^^^ ICLG 추가됨
```

---

## ⚠️ 주의사항

1. **타입 코드는 대문자 4글자**여야 합니다 (예: `ICLR`, `ECLG`)
2. **모든 파일에서 동일한 타입 코드**를 사용해야 합니다
3. **이미지 파일명은 타입 코드와 정확히 일치**해야 합니다
4. **firestore.rules 수정 후 Firebase에 배포**해야 합니다:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🔄 빠른 참조: 현재 16개 타입

- ICLR, ICLG, ICHR, ICHG (하프물범)
- IACR, IACG, IAHR, IAHG (하프물범)
- ECLR, ECLG, ECHR, ECHG (북극곰)
- EACR, EACG, EAHR, EAHG (북극곰)

