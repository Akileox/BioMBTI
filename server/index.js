// 1. Import required modules
const express = require('express');
const cors = require('cors');
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
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable JSON body parsing

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

// 5. Type Code to Title and Animal Mapping
const typeTitleMap = {
  'ICLR': "당신은 '혼자서도 척척 하프물범'형!",
  'ICLG': "당신은 '혼자서도 척척 하프물범'형!",
  'ICHR': "당신은 '혼자서도 척척 하프물범'형!",
  'ICHG': "당신은 '혼자서도 척척 하프물범'형!",
  'IACR': "당신은 '혼자서도 척척 하프물범'형!",
  'IACG': "당신은 '혼자서도 척척 하프물범'형!",
  'IAHR': "당신은 '혼자서도 척척 하프물범'형!",
  'IAHG': "당신은 '혼자서도 척척 하프물범'형!",
  'ECLR': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'ECLG': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'ECHR': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'ECHG': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'EACR': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'EACG': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'EAHR': "당신은 '함께하면 더 즐거운 북극곰'형!",
  'EAHG': "당신은 '함께하면 더 즐거운 북극곰'형!",
  // 기본값
  'default': "당신의 Bio-MBTI 결과"
};

// 타입 코드별 동물 매핑 (제목에서 추출)
const typeAnimalMap = {
  'ICLR': '하프물범',
  'ICLG': '하프물범',
  'ICHR': '하프물범',
  'ICHG': '하프물범',
  'IACR': '하프물범',
  'IACG': '하프물범',
  'IAHR': '하프물범',
  'IAHG': '하프물범',
  'ECLR': '북극곰',
  'ECLG': '북극곰',
  'ECHR': '북극곰',
  'ECHG': '북극곰',
  'EACR': '북극곰',
  'EACG': '북극곰',
  'EAHR': '북극곰',
  'EAHG': '북극곰',
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

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No answers provided.' });
    }

    console.log('Received answers:', answers);
    console.log(`USE_MOCK status: ${USE_MOCK} (env value: ${process.env.USE_MOCK})`);

    // --- [Mock Data for Testing] ---
    // USE_MOCK이 true면 API 관련 코드를 전혀 실행하지 않고 바로 Mock 데이터 반환
    if (USE_MOCK === true) {
      console.log('Returning MOCK data (API call skipped)');
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
    console.log('Proceeding with real Gemini API call...');
    
    // API 키 및 genAI 인스턴스 검증 (USE_MOCK이 false일 때만 도달)
    if (!genAI) {
      throw new Error('Gemini AI is not initialized. Please check GEMINI_API_KEY in .env file');
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // 질문과 답변을 함께 전달하여 더 정확한 분석
    const answersWithQuestions = answers.map((a, index) => 
      `Q${index + 1}: ${a.question} - Answer: ${a.answerValue}`
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
    
    // 서버에서 미리 정의된 제목 매핑
    // typeCode를 대문자로 변환하여 매칭 (Gemini가 소문자로 반환할 수 있음)
    const typeCode = (analysisResult.typeCode || 'default').toUpperCase();
    const title = typeTitleMap[typeCode] || typeTitleMap['default'];
    
    // 타입 코드가 매핑에 없는 경우 로깅
    if (!typeTitleMap[typeCode]) {
      console.warn(`Warning: Type code "${typeCode}" not found in typeTitleMap. Using default title.`);
    }
    
    // typeCode, description, keywords는 Gemini에서 받은 것을 사용, title은 서버에서 매핑
    const finalResult = {
      typeCode: typeCode, // 대문자로 정규화된 typeCode 사용
      title: title,
      description: analysisResult.description,
      keywords: analysisResult.keywords || [`#${typeCode}`]
    };
    
    console.log('Final result:', finalResult);
    return res.json(finalResult);
    // --- [Real API Call End] ---

  } catch (error) {
    console.error('Error processing Gemini request:', error);
    res.status(500).json({ error: 'Server error while analyzing results.' });
  }
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});