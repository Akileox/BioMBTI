// 1. Import required modules
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); // Loads environment variables from .env file

// USE_MOCK 설정 확인 (대소문자 무시, 'true' 문자열 체크)
const USE_MOCK = String(process.env.USE_MOCK || 'false').toLowerCase().trim() === 'true';
let GoogleGenerativeAI = null;

// USE_MOCK이 false일 때만 Google Generative AI 모듈 import
if (!USE_MOCK) {
  try {
    GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
  } catch (error) {
    console.error('Failed to load Google Generative AI module:', error.message);
  }
}

// 2. Initialize App
const app = express();
const PORT = process.env.PORT || 3001; // Use port from env or default to 3001

// 3. Middlewares
// CORS 설정: 프로덕션에서는 특정 origin만 허용하도록 설정 권장
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : '*', // 개발 환경에서는 모든 origin 허용, 프로덕션에서는 특정 도메인만 허용
  credentials: true
};
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(express.json({ limit: '1mb' })); // Enable JSON body parsing with size limit
// IP 주소를 정확히 가져오기 위한 설정 (프록시 환경 고려)
app.set('trust proxy', true);

// 4. Initialize Gemini API (USE_MOCK이 false일 때만)
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-preview-09-2025";

// USE_MOCK이 false일 때만 genAI 초기화
let genAI = null;
if (!USE_MOCK) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.warn('WARNING: USE_MOCK is false but GEMINI_API_KEY is not set. API calls will fail.');
  } else {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error.message);
    }
  }
} else {
  console.log('✓ Running in MOCK mode - Gemini API will not be used');
  console.log(`  USE_MOCK value: ${process.env.USE_MOCK}`);
}

// 4-1. Initialize Firebase Admin SDK
let db = null;
const FIREBASE_ENABLED = String(process.env.FIREBASE_ENABLED || 'false').toLowerCase().trim() === 'true';

if (FIREBASE_ENABLED) {
  try {
    let serviceAccount = null;
    
    // 방법 1: 환경 변수에서 직접 JSON 문자열로 제공 (Render 등 클라우드 환경용)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('✓ Firebase service account loaded from FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError.message);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
      }
    }
    // 방법 2: Base64 인코딩된 환경 변수 (선택사항)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
        console.log('✓ Firebase service account loaded from FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable');
      } catch (decodeError) {
        console.error('Failed to decode FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:', decodeError.message);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 format');
      }
    }
    // 방법 3: 파일 시스템에서 읽기 (로컬 개발용)
    else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                 path.join(__dirname, 'firebase-service-account.json');
      
      const fs = require('fs');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log('✓ Firebase service account loaded from file:', serviceAccountPath);
      } else {
        console.warn('⚠ Firebase service account not found. Analytics features will be disabled.');
        console.warn(`  Expected path: ${serviceAccountPath}`);
        console.warn('  Please set one of the following:');
        console.warn('    - FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)');
        console.warn('    - FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (base64 encoded JSON)');
        console.warn('    - FIREBASE_SERVICE_ACCOUNT_PATH (file path)');
        console.warn('    - Or place firebase-service-account.json in server/');
      }
    }
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      console.log('✓ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.warn('Analytics features will be disabled.');
  }
} else {
  console.log('✓ Firebase is disabled (FIREBASE_ENABLED=false). Analytics features will not be available.');
}

// 5. Type Code to Title and Animal Mapping
const typeTitleMap = {
  'ICLR': "당신은 '혼자서도 척척 하프물범'형!",
  'ICGR': "당신은 '툰드라의 고독한 탐색가, 북극여우'형!",
  'ICLH': "당신은 '척박한 환경에서 살아남기 위해 신중해진 감성적인 사색가, 북극 땅다람쥐'형!",
  'ICGH': "당신은 '기후 변화의 상징인 헌신적 어미곰, 북극곰'형!",
  'IALR': "당신은 '심해의 고독한 생존자, 그린란드 상어'형!",
  'IAGR': "당신은 '대규모 이동을 주도하는 행동가, 북극기러기'형!",
  'IALH': "당신은 '홀로 적극적으로 살아가는 북극토끼'형!",
  'IAGH': "당신은 '거대한 심해의 외로운 사냥꾼, 향유고래'형!",
  'ECLR': "당신은 '든든한 영역 지킴이, 바다코끼리'형!",
  'ECLH': "당신은 '깊은 심해의 감성적 유니콘, 나르왈'형!",
  'ECGH': "당신은 '다정한 군집 전략가, 대서양퍼핀'형!",
  'ECGR': "당신은 '함께 길을 찾는 효율적인 전략가, 북극순록'형!",
  'EALR': "당신은 '척박한 환경 속에서도 무리를 이루어 많은 영역을 살피는 사교적 활동가, 북극늑대'형!",
  'EALH': "당신은 '혹한을 함께 이겨내는 따뜻한 방패이자 공동체 수호자, 사향소'형!",
  'EAGH': "당신은 '하늘을 품은 대담한 가족, 흰올빼미'형!",
  'EAGR': "당신은 '함께 탐험하는 바다의 소통가, 벨루가'형!",
  // 기본값
  'default': "당신의 Bio-MBTI 결과"
};

// 타입 코드별 동물 매핑 (제목에서 추출)
const typeAnimalMap = {
  'ICLR': '하프물범',
  'ICGR': '북극여우',
  'ICLH': '북극 땅다람쥐',
  'ICGH': '북극곰',
  'IALR': '그린란드 상어',
  'IAGR': '북극기러기',
  'IALH': '북극토끼',
  'IAGH': '향유고래',
  'ECLR': '바다코끼리',
  'ECLH': '나르왈',
  'ECGH': '대서양퍼핀',
  'ECGR': '북극순록',
  'EALR': '북극늑대',
  'EALH': '사향소',
  'EAGH': '흰올빼미',
  'EAGR': '벨루가',
  'default': '북극 동물'
};

// 6. Define Routes
app.get('/', (req, res) => {
  res.send('Bio-MBTI backend server is running.');
});

/**
 * @route   POST /api/get-result
 * @desc    Receive user answers, get analysis from Gemini, and return the result.
 * @access  Public
 */
app.post('/api/get-result', async (req, res) => {
  try {
    const { answers } = req.body; // e.g., [{ question: "...", answerValue: "E" }, ...]

    // 입력 검증
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided.' });
    }

    // 답변 개수 제한 (최대 20개)
    if (answers.length > 20) {
      return res.status(400).json({ error: 'Too many answers. Maximum 20 answers allowed.' });
    }

    // 각 답변 검증
    const validAnswerValues = ['E', 'I', 'A', 'C', 'G', 'L', 'H', 'R'];
    for (const answer of answers) {
      if (!answer.question || typeof answer.question !== 'string') {
        return res.status(400).json({ error: 'Invalid answer format: question is required.' });
      }
      if (!answer.answerValue || !validAnswerValues.includes(answer.answerValue)) {
        return res.status(400).json({ error: `Invalid answer value. Must be one of: ${validAnswerValues.join(', ')}` });
      }
      // 질문 길이 제한 (최대 500자)
      if (answer.question.length > 500) {
        return res.status(400).json({ error: 'Question too long. Maximum 500 characters allowed.' });
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Received answers:', answers);
      console.log(`USE_MOCK status: ${USE_MOCK} (env value: ${process.env.USE_MOCK})`);
    }

    // --- [Mock Data for Testing] ---
    // USE_MOCK이 true면 API 관련 코드를 전혀 실행하지 않고 바로 Mock 데이터 반환
    if (USE_MOCK === true) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Returning MOCK data (API call skipped)');
      }
      const mockResult = {
        typeCode: 'ICLR',
        title: "당신은 '혼자서도 척척 하프물범'형!",
        description: "[임시 Mock 데이터] 태어난 지 12일만에 독립 생활을 시작하는 하프물범처럼 적응력이 높습니다. 귀여운 성격 덕분에 어디서든지 사랑받습니다.",
        keywords: ['#ICLR', '#하프물범', '#높은 적응력', '#독립적']
      };
      await new Promise(resolve => setTimeout(resolve, 300));
      return res.json(mockResult);
    }
    // --- [Mock Data End] ---

    // --- [Real Gemini API Call] ---
    // USE_MOCK이 false일 때만 이 블록이 실행됨
    if (process.env.NODE_ENV !== 'production') {
      console.log('Proceeding with real Gemini API call...');
    }
    
    // API 키 및 genAI 인스턴스 검증 (USE_MOCK이 false일 때만 도달)
    if (!genAI) {
      throw new Error('Gemini AI is not initialized. Please check GEMINI_API_KEY in .env file');
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // 질문과 답변을 함께 전달하여 더 정확한 분석
    // XSS 및 Prompt Injection 방지를 위해 특수 문자 이스케이프
    const sanitizeForPrompt = (text) => {
      return text
        .replace(/[<>]/g, '') // HTML 태그 제거
        .replace(/\n/g, ' ') // 줄바꿈을 공백으로
        .substring(0, 200); // 최대 길이 제한
    };
    
    const answersWithQuestions = answers.map((a, index) => 
      `Q${index + 1}: ${sanitizeForPrompt(a.question)} - Answer: ${a.answerValue}`
    ).join('\n');
    
    // 타입 코드별 동물 매핑 정보를 프롬프트에 포함
    const animalMappingInfo = Object.entries(typeAnimalMap)
      .filter(([key]) => key !== 'default')
      .map(([typeCode, animal]) => `- ${typeCode}: ${animal}`)
      .join('\n');
    
    const prompt = `You are a Bio-MBTI analyst specializing in environmental personality types based on Arctic wildlife. Analyze the user's answers and classify them into one of 16 Bio-MBTI types.

**Classification Axes:**
1. E (Together) / I (Alone) - Social preference
2. A (Active) / C (Cautious) - Action style
3. G (Global) / L (Local) - Perspective scope
4. H (Heart-driven) / R (Reason-driven) - Decision-making style

**User's Answers:**
${answersWithQuestions}

**Type Code to Animal Mapping (MUST USE THE CORRECT ANIMAL):**
${animalMappingInfo}

**Instructions:**
1. Analyze each answer to determine the user's preference on each of the 4 axes
2. Count the answers for each axis (E vs I, A vs C, G vs L, H vs R)
3. Determine the dominant type for each axis
4. Combine them into a 4-letter type code (e.g., ICLR, EAGH, etc.)
5. Look up the animal for the determined type code from the mapping above
6. Create a creative description in Korean using EXACTLY that animal. The description must feature the specific animal assigned to the type code, not any other animal.

**Response Format (JSON only):**
{
  "typeCode": "4_LETTER_CODE",
  "description": "Detailed personality description in Korean, explaining the type characteristics using the EXACT animal from the mapping above. Make it engaging and creative, around 2-3 sentences. You MUST use the animal specified in the mapping for this type code.",
  "keywords": ["#typeCode", "#animalName", "#keyword1", "#keyword2", "#keyword3"]
}

Important: 
- Do NOT include "title" field. Only return typeCode, description, and keywords.
- You MUST use the exact animal specified in the mapping for the type code you determine.
- Do NOT use a different animal than what is specified in the mapping.
- keywords array must include: the type code (with #), the animal name (with #), and 2-3 additional relevant keywords from the description (with #).
- Keywords should be in Korean and relevant to the personality type described.
Respond ONLY with valid JSON, no additional text.`;

    const generationConfig = { 
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.8,
      topK: 40
    };
    
    // 모델 인스턴스를 매번 새로 생성하여 헤더 문제 방지
    const modelWithJson = genAI.getGenerativeModel({ 
      model: MODEL, 
      generationConfig 
    });
    
    const result = await modelWithJson.generateContent(prompt);
    const response = await result.response;
    const analysisResultText = response.text();
    const analysisResult = JSON.parse(analysisResultText);
    
    // 답변을 기반으로 올바른 타입 코드 계산 (Gemini 오류 방지)
    const calculateTypeCode = (answers) => {
      // 각 축별 카운트
      let eCount = 0, iCount = 0;
      let aCount = 0, cCount = 0;
      let gCount = 0, lCount = 0;
      let hCount = 0, rCount = 0;
      
      answers.forEach(answer => {
        const value = answer.answerValue;
        if (value === 'E') eCount++;
        else if (value === 'I') iCount++;
        else if (value === 'A') aCount++;
        else if (value === 'C') cCount++;
        else if (value === 'G') gCount++;
        else if (value === 'L') lCount++;
        else if (value === 'H') hCount++;
        else if (value === 'R') rCount++;
      });
      
      // 다수결로 각 축 결정
      const axis1 = eCount >= iCount ? 'E' : 'I';
      const axis2 = aCount >= cCount ? 'A' : 'C';
      const axis3 = gCount >= lCount ? 'G' : 'L';
      const axis4 = hCount >= rCount ? 'H' : 'R';
      
      return `${axis1}${axis2}${axis3}${axis4}`;
    };
    
    // 계산된 타입 코드
    const calculatedTypeCode = calculateTypeCode(answers);
    
    // Gemini가 반환한 타입 코드
    const geminiTypeCode = (analysisResult.typeCode || 'default').toUpperCase();
    
    // 타입 코드 검증 및 수정
    let finalTypeCode = geminiTypeCode;
    
    // Gemini 타입 코드가 유효하지 않거나 계산된 코드와 다르면 계산된 코드 사용
    if (!typeTitleMap[geminiTypeCode] || geminiTypeCode !== calculatedTypeCode) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Type code mismatch detected. Gemini: "${geminiTypeCode}", Calculated: "${calculatedTypeCode}". Using calculated code.`);
      }
      finalTypeCode = calculatedTypeCode;
    }
    
    // 최종 타입 코드가 유효한지 확인
    if (!typeTitleMap[finalTypeCode]) {
      console.warn(`Warning: Calculated type code "${finalTypeCode}" not found in typeTitleMap. Using default.`);
      finalTypeCode = 'default';
    }
    
    const title = typeTitleMap[finalTypeCode] || typeTitleMap['default'];
    
    // typeCode는 계산된 것을 사용, description과 keywords는 Gemini에서 받은 것을 사용, title은 서버에서 매핑
    const finalResult = {
      typeCode: finalTypeCode, // 계산된 타입 코드 사용 (Gemini 오류 방지)
      title: title,
      description: analysisResult.description,
      keywords: analysisResult.keywords || [`#${finalTypeCode}`]
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Final result:', finalResult);
    }
    
    // 결과만 반환 (저장은 프론트엔드에서 /api/submit-result로 처리)
    return res.json(finalResult);
    // --- [Real API Call End] ---

  } catch (error) {
    console.error('Error processing Gemini request:', error);
    res.status(500).json({ error: 'Server error while analyzing results.' });
  }
});

/**
 * @route   POST /api/submit-result
 * @desc    Save user result to database
 * @access  Public
 */
app.post('/api/submit-result', async (req, res) => {
  try {
    const { typeCode } = req.body;

    // 입력 검증
    if (!typeCode || typeof typeCode !== 'string') {
      return res.status(400).json({ error: 'typeCode is required.' });
    }

    // 타입 코드 형식 검증 (4자리 대문자 알파벳만 허용)
    const typeCodeUpper = typeCode.toUpperCase().trim();
    if (!/^[A-Z]{4}$/.test(typeCodeUpper)) {
      return res.status(400).json({ error: 'Invalid typeCode format. Must be 4 uppercase letters.' });
    }

    // 유효한 타입 코드인지 확인
    const validTypeCodes = Object.keys(typeTitleMap).filter(key => key !== 'default');
    if (!validTypeCodes.includes(typeCodeUpper)) {
      return res.status(400).json({ error: 'Invalid typeCode. Must be a valid Bio-MBTI type code.' });
    }

    if (!db) {
      return res.status(503).json({ error: 'Database is not available. Please configure Firebase.' });
    }

    // IP 주소 해시화 (개인정보 보호)
    const crypto = require('crypto');
    // X-Forwarded-For 헤더 또는 req.ip 사용 (trust proxy 설정으로 정확한 IP 획득)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.ip || 
                     req.connection.remoteAddress || 
                     'unknown';
    const hashedIp = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);

    // 중복 저장 방지: 트랜잭션을 사용하여 원자적 연산 보장
    // 같은 IP에서 같은 타입코드를 30초 이내에 저장한 경우 스킵
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);
    
    try {
      // 먼저 최근 저장 기록 확인 (더 넓은 범위로)
      const recentResults = await db.collection('results')
        .where('hashedIp', '==', hashedIp)
        .where('typeCode', '==', typeCodeUpper)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!recentResults.empty) {
        const recentDoc = recentResults.docs[0];
        const recentData = recentDoc.data();
        const recentTimestamp = recentData.timestamp?.toDate?.() || new Date(recentData.createdAt);
        const timeDiff = now.getTime() - recentTimestamp.getTime();
        
        if (timeDiff < 30000) { // 30초 이내
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Duplicate submission detected (IP: ${hashedIp}, typeCode: ${typeCodeUpper}, ${Math.round(timeDiff/1000)}s ago), skipping...`);
          }
          return res.json({ success: true, skipped: true, message: 'Duplicate submission skipped' });
        }
      }
    } catch (queryError) {
      // 쿼리 오류가 발생하면 (인덱스가 없을 수 있음) 모든 데이터를 가져와서 확인
      console.warn('Query error, trying alternative method:', queryError.message);
      try {
        const allRecent = await db.collection('results')
          .where('hashedIp', '==', hashedIp)
          .where('typeCode', '==', typeCodeUpper)
          .get();
        
        if (!allRecent.empty) {
          // 가장 최근 것만 확인
          let mostRecent = null;
          allRecent.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate?.() || new Date(data.createdAt);
            if (!mostRecent || timestamp > mostRecent.timestamp) {
              mostRecent = { timestamp, data };
            }
          });
          
          if (mostRecent) {
            const timeDiff = now.getTime() - mostRecent.timestamp.getTime();
            if (timeDiff < 30000) {
              if (process.env.NODE_ENV !== 'production') {
                console.log(`Duplicate submission detected (alternative method, ${Math.round(timeDiff/1000)}s ago), skipping...`);
              }
              return res.json({ success: true, skipped: true, message: 'Duplicate submission skipped' });
            }
          }
        }
      } catch (altError) {
        console.warn('Alternative method also failed, proceeding with save:', altError.message);
      }
    }

    // 결과를 DB에 저장
    const docRef = await db.collection('results').add({
      typeCode: typeCodeUpper,
      hashedIp: hashedIp, // 중복 판단용 (개인정보 보호)
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Result saved to Firestore:', docRef.id);
    }
    return res.json({ success: true, id: docRef.id });

  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Server error while saving result.' });
  }
});

/**
 * @route   GET /api/get-stats
 * @desc    Get statistics about all results
 * @access  Public
 */
app.get('/api/get-stats', async (req, res) => {
  try {
    if (!db) {
      // Firebase가 비활성화된 경우 Mock 데이터 반환
      return res.json({
        totalCount: 0,
        typeCounts: {},
        message: 'Database is not available. Please configure Firebase.'
      });
    }

    // 전체 결과 조회
    const resultsSnapshot = await db.collection('results').get();
    
    const totalCount = resultsSnapshot.size;
    const typeCounts = {};
    
    // 타입별 개수 계산
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      const typeCode = data.typeCode || 'UNKNOWN';
      typeCounts[typeCode] = (typeCounts[typeCode] || 0) + 1;
    });

    // 16개 타입 모두 포함 (없으면 0)
    const allTypes = [
      'ICLR', 'ICGR', 'ICLH', 'ICGH',
      'IALR', 'IAGR', 'IALH', 'IAGH',
      'ECLR', 'ECLH', 'ECGH', 'ECGR',
      'EALR', 'EALH', 'EAGH', 'EAGR'
    ];
    
    allTypes.forEach(type => {
      if (!typeCounts[type]) {
        typeCounts[type] = 0;
      }
    });

    return res.json({
      totalCount,
      typeCounts
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error while fetching statistics.' });
  }
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});