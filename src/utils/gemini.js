import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY?.trim(),
  import.meta.env.VITE_GEMINI_API_KEY_2?.trim(),
].filter(Boolean);

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
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
        const isRetryable = msg.includes('429') || msg.includes('403') || msg.includes('400') || msg.toLowerCase().includes('quota') || msg.includes('404') || msg.toLowerCase().includes('not found');
        if (isRetryable) continue;
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

export async function chatWithAnalysis(messages, analysisData, brandConfig, originalQuery) {
  return withFallback(async (keyIdx, modelName) => {
    const genAI = getGenAI(keyIdx);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.7 },
    });

    const brandContext = [
      `브랜드명: ${brandConfig.name}`,
      brandConfig.description ? `브랜드 설명: ${brandConfig.description}` : '',
    ].filter(Boolean).join('\n');

    const analysisContext = `
분석한 원본 기획/내용: "${originalQuery}"

분석 결과 요약:
- 레퍼런스 브랜드: ${analysisData.references?.map(r => r.brandName).join(', ') || '-'}
- 브랜드 적합성 점수: ${analysisData.brandFit?.score}점 (${analysisData.brandFit?.grade})
- 브랜드 적합성 총평: ${analysisData.brandFit?.summary || '-'}
- 핵심 인사이트: ${analysisData.insights?.keyTakeaways?.join(' / ') || '-'}
- 시장 트렌드: ${analysisData.insights?.marketTrends || '-'}
- 강점: ${analysisData.brandFit?.strengths?.map(s => s.point).join(', ') || '-'}
- 개선 과제: ${analysisData.brandFit?.challenges?.map(c => c.point).join(', ') || '-'}
- 추천 액션: ${analysisData.brandFit?.improvements?.map(i => i.action).join(' / ') || '-'}`;

    const systemPrompt = `당신은 방금 마케팅 분석을 완료한 전략 마케팅 컨설턴트입니다.

${brandContext}
${analysisContext}

[답변 스타일 규칙]
- **볼드**, *이탤릭*, ## 헤더 등 마크다운 문법 사용 금지
- 서론·결론·인사말("물론이죠", "좋은 질문입니다" 등) 없이 바로 본론
- 한국어로 답변, 영어 질문엔 영어로
- 분석 내용을 구체적으로 참조해 실무에 바로 쓸 수 있게

[질문 유형별 답변 방식 — 상황에 맞게 자연스럽게]
• 리스트가 유용한 질문(리스크, 방법, 아이디어 등): 이모지 항목으로 간결하게
  예) 🎯 / ⚠️ / 💡 / ✅ / 📌 를 항목 앞에 붙여 줄바꿈으로 구분
• 설명·배경이 필요한 질문: 2~3문장 자연스러운 문체로 답변
• 의견·판단 요청: 단호하고 짧게 결론 먼저, 이유는 한 줄
• 실행 방법 요청: 순서가 있으면 번호(1. 2. 3.)로
답변 길이는 질문 복잡도에 맞게 조절하되, 불필요하게 늘리지 말 것`;

    // 이전 대화를 Gemini history 형식으로 변환 (마지막 메시지 제외)
    const history = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '분석 결과를 확인했습니다. 추가 질문이나 구체적인 방향에 대해 무엇이든 물어보세요!' }] },
      ...messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    ];

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    return result.response.text();
  });
}
