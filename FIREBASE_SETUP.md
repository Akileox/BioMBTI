## ✅ 확인 방법

1. 테스트를 완료하고 결과 페이지로 이동
2. 결과 페이지에 통계가 표시되는지 확인:
   - "지금까지 **X명**이 참여했어요!"
   - "당신은 **상위 X%**의 '하프물범' 유형입니다."

3. Firebase Console → Firestore Database에서 `results` 컬렉션이 생성되고 데이터가 저장되는지 확인

## ⚠️ 문제 해결

### Firebase가 초기화되지 않는 경우

1. `FIREBASE_ENABLED=true`로 설정했는지 확인
2. 서비스 계정 파일 경로가 올바른지 확인
3. 서비스 계정 파일이 JSON 형식인지 확인
4. 서버 로그에서 에러 메시지 확인

### 통계가 표시되지 않는 경우

1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 `/api/get-stats` 요청 확인
3. 서버가 정상적으로 실행 중인지 확인
4. Firebase Firestore에 데이터가 저장되었는지 확인

## 🔒 보안 규칙 (프로덕션 배포 시)

프로덕션 배포 전에 Firestore 보안 규칙을 설정해야 합니다.

### 개발/테스트 환경용 규칙 (현재 사용 중)

1. Firebase Console → Firestore Database → 규칙
2. 다음 규칙 추가 (읽기/쓰기 모두 허용):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /results/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 프로덕션 환경용 규칙 (실제 배포 시)

프로덕션 배포 시에는 다음 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 유효한 Bio-MBTI 타입 코드 검증 함수
    function isValidTypeCode(typeCode) {
      return typeCode.matches('^(ICLR|ICLG|ICHR|ICHG|IACR|IACG|IAHR|IAHG|ECLR|ECLG|ECHR|ECHG|EACR|EACG|EAHR|EAHG)$');
    }
    
    // results 컬렉션 규칙
    match /results/{resultId} {
      // 읽기: 모든 사용자 허용 (통계 조회용)
      allow read: if true;
      
      // 쓰기: 데이터 검증 포함
      allow create: if 
        // typeCode 필수 및 유효성 검증
        request.resource.data.typeCode is string &&
        request.resource.data.typeCode.size() == 4 &&
        isValidTypeCode(request.resource.data.typeCode.toUpperCase()) &&
        // createdAt 필수 (ISO 8601 형식 문자열)
        request.resource.data.createdAt is string &&
        request.resource.data.createdAt.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}') &&
        // timestamp는 서버에서만 자동 설정되므로 클라이언트에서 설정 불가
        !('timestamp' in request.resource.data) &&
        // 추가 필드 제한 (필요한 필드만 허용)
        request.resource.data.keys().hasOnly(['typeCode', 'createdAt']);
      
      // 업데이트 및 삭제는 허용하지 않음 (데이터 무결성 보장)
      allow update, delete: if false;
    }
  }
}
```

### 규칙 설명

1. **읽기 (`allow read`)**: 모든 사용자 허용
   - 통계 조회는 공개되어야 하므로 모든 사용자가 읽을 수 있음

2. **쓰기 (`allow create`)**: 데이터 검증 포함
   - `typeCode`는 반드시 4자리 문자열이어야 함
   - `typeCode`는 유효한 16개 타입 중 하나여야 함
   - `createdAt` 필드는 필수 (ISO 8601 형식)
   - `timestamp`는 서버에서만 설정 (클라이언트에서 설정 불가)
   - 허용된 필드만 저장 가능 (`typeCode`, `createdAt`만 허용)

3. **업데이트/삭제**: 허용하지 않음
   - 데이터 무결성을 위해 생성만 허용

### 규칙 적용 방법

1. Firebase Console → Firestore Database → 규칙 탭
2. 위의 프로덕션 규칙을 복사하여 붙여넣기
3. "게시" 버튼 클릭
4. 규칙이 적용되는 데 몇 초 소요될 수 있음

### 추가 보안 고려사항

Firestore 보안 규칙만으로는 완벽한 스팸 방지가 어렵습니다. 서버 측에서도 다음을 구현하는 것을 권장합니다:

1. **Rate Limiting**: IP 주소별 요청 제한
   ```javascript
   // 예: 같은 IP에서 1분에 최대 10회만 허용
   ```

2. **서버 측 검증 강화**: 백엔드에서 추가 검증
   ```javascript
   // server/index.js의 /api/submit-result에서
   // - typeCode 유효성 재검증
   // - 요청 빈도 제한
   // - 이상 패턴 감지
   ```

3. **모니터링**: Firebase Console에서 비정상적인 트래픽 모니터링

### 보안 규칙 테스트

Firebase Console → Firestore Database → 규칙 탭에서 "규칙 시뮬레이터"를 사용하여 규칙을 테스트할 수 있습니다.

## 📝 참고사항

- Firebase 무료 티어: 일일 읽기 50,000회, 쓰기 20,000회
- 초기에는 충분하지만, 트래픽이 증가하면 유료 플랜 고려 필요
- 서비스 계정 키는 절대 공개 저장소에 커밋하지 마세요!
- server에서 npm run clear 치면 참여 인원 수 초기화 가능
