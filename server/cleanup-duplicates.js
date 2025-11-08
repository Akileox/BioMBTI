// 중복 데이터 정리 스크립트
// 사용법: node server/cleanup-duplicates.js

const admin = require('firebase-admin');
const path = require('path');
// .env 파일 경로를 명시적으로 지정 (스크립트가 어디서 실행되든 올바른 경로 찾기)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Firebase 초기화
const FIREBASE_ENABLED = String(process.env.FIREBASE_ENABLED || 'false').toLowerCase().trim() === 'true';

if (!FIREBASE_ENABLED) {
  console.error('❌ Firebase가 비활성화되어 있습니다. FIREBASE_ENABLED=true로 설정해주세요.');
  process.exit(1);
}

// 서비스 계정 파일 경로 처리 (상대 경로인 경우 __dirname 기준으로 변환)
let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                         path.join(__dirname, 'firebase-service-account.json');

// 상대 경로인 경우 __dirname 기준으로 변환
if (!path.isAbsolute(serviceAccountPath)) {
  serviceAccountPath = path.join(__dirname, serviceAccountPath);
}

const fs = require('fs');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Firebase 서비스 계정 파일을 찾을 수 없습니다: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin SDK 초기화 완료');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// 중복 데이터 정리 함수
async function cleanupDuplicates() {
  try {
    console.log('\n📊 중복 데이터 정리 시작...\n');

    // 모든 결과 가져오기
    const resultsSnapshot = await db.collection('results').get();
    console.log(`전체 데이터 수: ${resultsSnapshot.size}개\n`);

    if (resultsSnapshot.empty) {
      console.log('정리할 데이터가 없습니다.');
      return;
    }

    // 데이터를 그룹화 (해시된 IP + 타입코드 기준)
    const groups = {};
    const allDocs = [];

    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      const typeCode = data.typeCode || 'UNKNOWN';
      const hashedIp = data.hashedIp || 'unknown'; // 해시된 IP (없으면 unknown)
      const createdAt = data.createdAt || '';
      const timestamp = data.timestamp?.toDate?.() || new Date(createdAt);
      
      allDocs.push({
        id: doc.id,
        typeCode,
        hashedIp,
        createdAt,
        timestamp,
        data
      });

      // 같은 해시된 IP + 타입코드로 그룹화 (실제 중복 판단)
      const groupKey = `${hashedIp}_${typeCode}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({
        id: doc.id,
        createdAt,
        timestamp,
        data
      });
    });

    // 중복 찾기 및 정리
    const duplicatesToDelete = new Set(); // 중복 제거를 위해 Set 사용
    const keepIds = new Set(); // 유지할 ID들

    Object.keys(groups).forEach(typeCode => {
      const group = groups[typeCode];
      
      // 시간순으로 정렬
      group.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // 같은 IP에서 10초 이내에 저장된 것들을 중복으로 간주
      // (같은 IP + 같은 타입코드 = 같은 사용자가 여러 번 저장한 것으로 판단)
      for (let i = 0; i < group.length; i++) {
        const current = group[i];
        
        // 이미 삭제 대상이거나 유지 대상이면 스킵
        if (duplicatesToDelete.has(current.id) || keepIds.has(current.id)) {
          continue;
        }

        // 현재 항목을 유지 대상으로 추가
        keepIds.add(current.id);
        const duplicates = [];

        // 현재 항목과 10초 이내에 저장된 다른 항목들 찾기
        for (let j = i + 1; j < group.length; j++) {
          const next = group[j];
          
          // 이미 삭제 대상이면 스킵
          if (duplicatesToDelete.has(next.id)) {
            continue;
          }
          
          const timeDiff = next.timestamp.getTime() - current.timestamp.getTime();
          
          if (timeDiff <= 10000) { // 10초 = 10000ms (같은 사용자가 빠르게 여러 번 저장한 경우)
            duplicates.push(next);
            duplicatesToDelete.add(next.id); // Set에 추가 (자동 중복 제거)
          } else {
            break; // 정렬되어 있으므로 더 이상 중복 없음
          }
        }
      }
    });

    const duplicatesArray = Array.from(duplicatesToDelete);
    
    if (duplicatesArray.length === 0) {
      console.log('✅ 중복 데이터가 없습니다. 모든 데이터가 정상입니다.\n');
      return;
    }

    // 삭제할 항목 확인
    console.log(`🔍 발견된 중복 데이터: ${duplicatesArray.length}개\n`);
    console.log('삭제할 항목 ID:');
    duplicatesArray.forEach((id, index) => {
      if (index < 10) {
        console.log(`  - ${id}`);
      } else if (index === 10) {
        console.log(`  ... 외 ${duplicatesArray.length - 10}개`);
      }
    });
    console.log('');

    // 사용자 확인 (실제로는 자동 실행)
    console.log('⚠️  중복 데이터를 삭제합니다...\n');

    // 배치로 삭제 (Firestore는 한 번에 최대 500개까지)
    const batchSize = 500;
    for (let i = 0; i < duplicatesArray.length; i += batchSize) {
      const batch = db.batch();
      const batchIds = duplicatesArray.slice(i, i + batchSize);
      
      batchIds.forEach(id => {
        const docRef = db.collection('results').doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
      console.log(`✓ ${Math.min(i + batchSize, duplicatesArray.length)}/${duplicatesArray.length}개 삭제 완료`);
    }

    console.log(`\n✅ 정리 완료! ${duplicatesArray.length}개의 중복 데이터가 삭제되었습니다.`);
    
    // 정리 후 통계
    const afterSnapshot = await db.collection('results').get();
    console.log(`\n📊 정리 후 데이터 수: ${afterSnapshot.size}개`);
    console.log(`   (삭제 전: ${resultsSnapshot.size}개, 삭제: ${duplicatesArray.length}개)\n`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
cleanupDuplicates()
  .then(() => {
    console.log('프로세스 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  });

