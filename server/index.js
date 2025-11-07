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

// 5. Define Routes
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
        description: "[임시 Mock 데이터] 태어난 지 12일만에 독립 생활을 시작하는 하프물범처럼 적응력이 높습니다. 귀여운 성격 덕분에 어디서든지 사랑받습니다."
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

    const userAnswersString = JSON.stringify(answers.map(a => a.answerValue));
    const prompt = `You are a Bio-MBTI analyst. You must analyze the user's answers based on 4 axes:
1. E/I (Together vs. Alone)
2. A/C (Active vs. Cautious)
3. G/L (Global vs. Local)
4. H/R (Heart-driven vs. Reason-driven)

User's 12 answers (values only): ${userAnswersString}

Analyze the context of these answers and determine the user's final 4-letter type.
Respond ONLY with a valid JSON object in the following format:
{
  "typeCode": "YOUR_4_LETTER_CODE",
  "title": "Your Character Title (e.g., 'The Proactive Polar Bear')",
  "description": "Your generated character description based on the type."
}`;

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
    return res.json(analysisResult);
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