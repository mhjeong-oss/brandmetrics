import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
].filter(Boolean);

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-001',
];

function getGenAI(keyIndex = 0) {
  return new GoogleGenerativeAI(API_KEYS[keyIndex] || API_KEYS[0]);
}

function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('JSON 파싱 실패');
  }
}

async function withFallback(fn) {
  let lastErr;
  for (const modelName of MODELS) {
    for (let i = 0; i < API_KEYS.length; i++) {
      try {
        return await fn(i, modelName);
      } catch (err) {
        lastErr = err;
        const msg = err.message || '';
        const isRetryable = msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('404');
        if (isRetryable) continue;
        throw err;
      }
    }
  }
  throw lastErr;
}

export async function analyzeBrandURL(url) {
  return withFallback(async (keyIdx, modelName) => {
    const genAI = getGenAI(keyIdx);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `Based on this URL: "${url}", provide a concise 2-3 sentence analysis of what this brand/company does, their likely target audience, and their brand positioning. Be factual and brief.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export async function analyzeFile(fileData, fileType) {
  return withFallback(async (keyIdx, modelName) => {
    const genAI = getGenAI(keyIdx);
    const model = genAI.getGenerativeModel({ model: modelName });
    let parts;
    if (fileType === 'application/pdf') {
      parts = [
        { inlineData: { data: fileData, mimeType: 'application/pdf' } },
        { text: 'Summarize this document in 3-4 sentences focusing on: brand identity, target audience, key values, and product/service offerings.' },
      ];
    } else {
      parts = [{ text: `Summarize this brand document in 3-4 sentences focusing on: brand identity, target audience, key values, and product/service offerings.\n\nDocument:\n${fileData}` }];
    }
    const result = await model.generateContent(parts);
    return result.response.text();
  });
}

export async function analyzeMarketing(userInput, brandConfig) {
  return withFallback(async (keyIdx, modelName) => {
    const genAI = getGenAI(keyIdx);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const brandContext = [
      `Brand Name: ${brandConfig.name}`,
      brandConfig.description ? `Brand Description: ${brandConfig.description}` : '',
      brandConfig.urlAnalysis ? `Website Analysis: ${brandConfig.urlAnalysis}` : '',
      brandConfig.fileAnalysis ? `Brand Document Summary: ${brandConfig.fileAnalysis}` : '',
    ].filter(Boolean).join('\n');

    const prompt = `You are a strategic marketing analyst and brand consultant.

Brand Context:
${brandContext}

Marketing/Planning Content to Analyze:
${userInput}

Return ONLY a valid JSON object:

{
  "references": [
    {
      "brandName": "Brand or Campaign Name",
      "domain": "brand.com",
      "tagline": "Famous tagline or slogan",
      "description": "2-3 sentences about what made this remarkable and what results it achieved",
      "instagramHandle": "handle",
      "instagramUrl": "https://www.instagram.com/handle/",
      "category": "Campaign type",
      "year": "2023",
      "colorHex": "#111111"
    }
  ],
  "insights": {
    "mainAnalysis": "3-4 paragraphs analyzing WHY this approach is effective, psychological principles, market dynamics",
    "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5","keyword6","keyword7","keyword8"],
    "effectiveness": {
      "emotional": 78,
      "visual": 82,
      "viral": 65,
      "innovation": 70,
      "brandAlignment": 85
    },
    "keyTakeaways": ["Actionable insight 1","Actionable insight 2","Actionable insight 3"],
    "marketTrends": "2-3 sentences about current trends this approach aligns with"
  },
  "brandFit": {
    "score": 76,
    "grade": "B+",
    "summary": "2-3 sentence overall assessment",
    "strengths": [
      {"point": "Strength title","detail": "1-2 sentence explanation"},
      {"point": "Strength title","detail": "1-2 sentence explanation"},
      {"point": "Strength title","detail": "1-2 sentence explanation"}
    ],
    "challenges": [
      {"point": "Challenge title","detail": "1-2 sentence explanation"},
      {"point": "Challenge title","detail": "1-2 sentence explanation"}
    ],
    "improvements": [
      {"action": "Specific action","impact": "Expected impact","priority": "high"},
      {"action": "Specific action","impact": "Expected impact","priority": "medium"},
      {"action": "Specific action","impact": "Expected impact","priority": "low"}
    ],
    "recommendation": "Final 2-3 sentence recommendation"
  },
  "ideas": [
    {
      "title": "확장 기획 제목 (Korean)",
      "type": "expansion",
      "typeLabel": "아이디어 확장",
      "concept": "핵심 개념 한 줄 요약 (Korean)",
      "description": "구체적인 방향성과 실행 방법 2-3문장 (Korean)",
      "hook": "실행 가능한 첫 번째 액션 포인트 (Korean)"
    }
  ]
}

Provide exactly 5 real well-known references closely related to the marketing content.
For "ideas": provide exactly 4 derived/expanded planning ideas in Korean. Go BEYOND evaluation — propose concrete alternative or evolved campaign directions. Mix types: "expansion"(확장), "variation"(변형), "derived"(파생), "collaboration"(협업). All text in Korean.`;

    const result = await model.generateContent(prompt);
    return extractJSON(result.response.text());
  });
}
