// 모든 결과 데이터 삭제 스크립트
// 사용법: node server/clear-all-results.js

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Firebase 초기화
const FIREBASE_ENABLED = String(process.env.FIREBASE_ENABLED || 'false').toLowerCase().trim() === 'true';

if (!FIREBASE_ENABLED) {
  console.error('❌ Firebase가 비활성화되어 있습니다. FIREBASE_ENABLED=true로 설정해주세요.');
  process.exit(1);
}

// 서비스 계정 파일 경로 처리
let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                         path.join(__dirname, 'firebase-service-account.json');

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

// 모든 결과 삭제 함수
async function clearAllResults() {
  try {
    console.log('\n🗑️  모든 결과 데이터 삭제 시작...\n');

    // 모든 결과 가져오기
    const resultsSnapshot = await db.collection('results').get();
    const totalCount = resultsSnapshot.size;
    
    console.log(`전체 데이터 수: ${totalCount}개\n`);

    if (resultsSnapshot.empty) {
      console.log('삭제할 데이터가 없습니다.');
      return;
    }

    // 사용자 확인
    console.log('⚠️  모든 결과 데이터를 삭제합니다...\n');

    // 배치로 삭제 (Firestore는 한 번에 최대 500개까지)
    const batchSize = 500;
    let deletedCount = 0;
    
    for (let i = 0; i < resultsSnapshot.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = resultsSnapshot.docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += batchDocs.length;
      console.log(`✓ ${deletedCount}/${totalCount}개 삭제 완료`);
    }

    console.log(`\n✅ 삭제 완료! 총 ${deletedCount}개의 데이터가 삭제되었습니다.`);
    
    // 확인: 다시 조회하여 0개인지 확인
    const verifySnapshot = await db.collection('results').get();
    console.log(`\n📊 확인: 현재 데이터 수: ${verifySnapshot.size}개\n`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
clearAllResults()
  .then(() => {
    console.log('프로세스 완료');
    process.exit(0);
  })
  .catch(error => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  });

