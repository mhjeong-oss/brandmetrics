import { useState, useCallback, useEffect, useRef } from 'react';
import { Settings, LogOut, X, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun } from 'lucide-react';
import { analyzeMarketing } from '../utils/gemini';
import { clearBrandConfig } from '../utils/storage';
import ChatInput from './ChatInput';
import ResultPanel from './ResultPanel';
import FollowUpChat from './FollowUpChat';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '좋은 아침이에요';
  if (hour >= 12 && hour < 14) return '점심 잘 드셨나요?';
  if (hour >= 14 && hour < 18) return '좋은 오후에요';
  if (hour >= 18 && hour < 22) return '좋은 저녁이에요';
  return '좋은 밤이에요';
}

const ALL_PROMPTS = [
  '여름 신제품 출시를 위한 SNS 캠페인 기획',
  'MZ세대를 타겟으로 한 브랜드 리뉴얼 전략',
  '연말 시즌 한정판 콜라보 마케팅 아이디어',
  '글로벌 시장 진출을 위한 브랜드 포지셔닝',
  '인플루언서 협업 캠페인 기획 및 KPI 설정',
  '브랜드 앰배서더 프로그램 설계',
  '신규 고객 유입을 위한 퍼포먼스 마케팅 전략',
  '브랜드 스토리텔링을 활용한 콘텐츠 마케팅',
  '오프라인 팝업 스토어 기획 및 온라인 연계 전략',
  '커뮤니티 기반 바이럴 캠페인 설계',
  '리테일 파트너십 및 공동 프로모션 기획',
  '시즌 한정 굿즈 출시를 위한 마케팅 플랜',
];

const LOAD_STAGES = ['브랜드 컨텍스트 분석 중', '레퍼런스 검색 중', '마케팅 전략 수립 중', '인사이트 생성 중', '결과 정리 중'];

function LoadingState() {
  const [progress, setProgress] = useState(3);
  const progressRef = useRef(3);

  useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current = Math.min(88, progressRef.current + (
        progressRef.current < 30 ? 4 : progressRef.current < 55 ? 2.2 : progressRef.current < 72 ? 1.2 : 0.5
      ));
      setProgress(progressRef.current);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  const stageIdx = Math.min(LOAD_STAGES.length - 1, Math.floor(progress / (90 / LOAD_STAGES.length)));

  return (
    <div className="flex flex-col items-center gap-5 px-8">
      <div className="w-full max-w-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-black/40">{LOAD_STAGES[stageIdx]}...</span>
          <span className="text-base font-bold font-inter text-black/55">{Math.round(progress)}%</span>
        </div>
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, background: 'var(--key)' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-black/30 dot-bounce" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  );
}

function SettingsModal({ brandConfig, onClose, onReset }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-black/90">브랜드 설정</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40 hover:text-black/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <p className="label-cap mb-1">브랜드명</p>
            <p className="text-sm text-black/80">{brandConfig?.name}</p>
          </div>
          {brandConfig?.description && (
            <div>
              <p className="label-cap mb-1">소개</p>
              <p className="text-sm text-black/50 leading-relaxed line-clamp-3">{brandConfig.description}</p>
            </div>
          )}
          {brandConfig?.url && (
            <div>
              <p className="label-cap mb-1">홈페이지</p>
              <p className="text-sm text-black/50">{brandConfig.url}</p>
            </div>
          )}
        </div>

        <div className="divider mb-4" />

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/[0.08] text-sm text-black/50 hover:text-black/80 hover:border-black/15 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>브랜드 재설정</span>
        </button>
      </div>
    </div>
  );
}

// Open-Meteo weather code → { Icon, color }
function getWeatherMeta(code) {
  const c = Number(code);
  if (c === 0)                    return { Icon: Sun,            color: '#E8C47A' }; // 맑음 — 황금빛
  if (c <= 3)                     return { Icon: CloudSun,       color: '#7AB0E8' }; // 구름 조금 — 하늘
  if (c <= 48)                    return { Icon: Cloud,          color: '#9BB5CE' }; // 흐림 — 회청
  if (c <= 67)                    return { Icon: CloudRain,      color: '#7AB0E8' }; // 비 — 스카이
  if (c <= 77)                    return { Icon: CloudSnow,      color: '#A8C8E8' }; // 눈 — 아이스
  if ([200,386,389,392,395].includes(c)) return { Icon: CloudLightning, color: '#9B83E8' }; // 천둥 — 라벤더
  return                                   { Icon: CloudRain,    color: '#7AB0E8' }; // 소나기
}

function WeatherClock() {
  const [time, setTime] = useState(() => new Date());
  const [weatherIcon, setWeatherIcon] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // IP 기반 위치 → Open-Meteo 날씨 (위치 권한 불필요)
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(({ latitude, longitude }) =>
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code&timezone=auto`)
      )
      .then(r => r.json())
      .then(d => {
        const code = d?.current?.weather_code;
        if (code !== undefined) setWeatherIcon(getWeatherMeta(code));
      })
      .catch(() => {});
  }, []);

  const timeStr = time.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      <span className="text-sm font-inter text-black/30 tabular-nums tracking-wide">{timeStr}</span>
      {weatherIcon && (
        <>
          <span className="text-black/15 text-xs">·</span>
          <weatherIcon.Icon className="w-4 h-4" style={{ color: weatherIcon.color }} />
        </>
      )}
    </div>
  );
}

export default function MainPage({ brandConfig, onResetBrand, onUpdateBrand, onToggleTheme, isDark }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [promptPage, setPromptPage] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const greeting = getGreeting();

  const PAGE_SIZE = 4;
  const totalPages = Math.ceil(ALL_PROMPTS.length / PAGE_SIZE);
  const visiblePrompts = ALL_PROMPTS.slice(promptPage * PAGE_SIZE, promptPage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptVisible(false);
      setTimeout(() => {
        setPromptPage(p => (p + 1) % totalPages);
        setPromptVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [totalPages]);

  const handleSubmit = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setQuery(text);

    try {
      const data = await analyzeMarketing(text, brandConfig);
      setResults(data);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
      } else if (msg.includes('404')) {
        setError('AI 모델에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      } else if (msg.includes('401') || msg.includes('403')) {
        setError('API 인증에 실패했습니다. API 키를 확인해 주세요.');
      } else {
        setError('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, brandConfig]);

  const handleReset = () => {
    clearBrandConfig();
    onResetBrand();
  };

  const handleGoHome = () => {
    setResults(null);
    setQuery('');
    setError(null);
  };

  const handleExampleClick = (prompt) => {
    handleSubmit(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05]">
        <button onClick={handleGoHome} className="font-serif text-lg text-black/90 tracking-tight hover:text-black/60 transition-colors">BrandMetrics</button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/30 px-3 py-1.5 rounded-full border border-black/[0.08]">
            {brandConfig?.name}
          </span>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl hover:bg-black/5 text-black/30 hover:text-black/70 transition-colors"
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl hover:bg-black/5 text-black/30 hover:text-black/70 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingState />
          </div>
        ) : results ? (
          <div className="animate-fade-in">
            <ResultPanel results={results} query={query} brandConfig={brandConfig} />
            <FollowUpChat results={results} query={query} brandConfig={brandConfig} />
          </div>
        ) : (
          /* Empty state - Claude-style centered layout */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-2xl flex flex-col items-center">
              {/* Time-based greeting */}
              <div className="mb-8 text-center animate-greeting">
                <h1
                  className="font-serif text-3xl sm:text-4xl text-black/90 mb-2"
                  style={{ fontWeight: 500 }}
                >
                  {greeting}
                </h1>
                <p className="text-sm text-black/35 font-pretendard">
                  <span className="text-black/55">{brandConfig?.name}</span>의 마케팅 기획을 도와드릴게요
                </p>
                <WeatherClock />
              </div>

              {/* Centered input */}
              <div className="w-full mb-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
                <ChatInput
                  onSubmit={handleSubmit}
                  loading={loading}
                  value={query}
                  onChange={setQuery}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="w-full mb-4 px-4 py-3 rounded-xl border border-black/[0.08] bg-black/[0.03] text-sm text-black/50 text-center">
                  {error}
                </div>
              )}

              {/* Example prompts below input */}
              <div className="w-full animate-slide-up" style={{ animationDelay: '160ms' }}>
                <p className="label-cap text-center mb-3">추천 기획 예시</p>
                <div
                  className="flex flex-wrap gap-2 justify-center transition-opacity duration-300"
                  style={{ opacity: promptVisible ? 1 : 0 }}
                >
                  {visiblePrompts.map((prompt, i) => (
                    <button
                      key={`${promptPage}-${i}`}
                      onClick={() => handleExampleClick(prompt)}
                      className="btn-ghost text-xs py-1.5 px-3.5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky input at bottom when results are shown */}
        {results && !loading && (
          <div className="sticky bottom-0 z-10 border-t border-black/[0.05]" style={{ background: 'var(--bg)' }}>
            <div className="max-w-2xl mx-auto px-6 py-4">
              <ChatInput
                onSubmit={handleSubmit}
                loading={loading}
                value={query}
                onChange={setQuery}
              />
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <SettingsModal
          brandConfig={brandConfig}
          onClose={() => setShowSettings(false)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
