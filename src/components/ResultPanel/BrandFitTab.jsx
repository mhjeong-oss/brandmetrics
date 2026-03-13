import { CheckCircle, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';

function getGradeStyle(grade) {
  const g = (grade || '').charAt(0).toUpperCase();
  if (g === 'A') return { color: '#D5292A', bg: 'rgba(213,41,42,0.08)', border: 'rgba(213,41,42,0.25)' };
  if (g === 'B') return { color: 'rgba(26,26,24,0.65)', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.12)' };
  if (g === 'C') return { color: 'rgba(26,26,24,0.45)', bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)' };
  return { color: 'rgba(26,26,24,0.3)', bg: 'rgba(0,0,0,0.02)', border: 'rgba(0,0,0,0.06)' };
}

const PRIORITY_STYLE = {
  high: { label: '높음', color: '#D5292A', bg: 'rgba(213,41,42,0.08)', border: 'rgba(213,41,42,0.2)' },
  medium: { label: '중간', color: 'rgba(26,26,24,0.5)', bg: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.08)' },
  low: { label: '낮음', color: 'rgba(26,26,24,0.3)', bg: 'transparent', border: 'rgba(0,0,0,0.06)' },
};

function ScoreRing({ score, grade }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  const offset = circumference - (pct / 100) * circumference;
  const gradeStyle = getGradeStyle(grade);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="6" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={gradeStyle.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ '--full-circumference': circumference, '--target-offset': offset }}
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-black/90 font-inter leading-none">{pct}</span>
          <span className="text-[10px] text-black/30 mt-0.5 font-inter">/ 100</span>
        </div>
      </div>
      {grade && (
        <span
          className="mt-2 px-3 py-1 rounded-full text-base font-semibold font-inter"
          style={{ color: gradeStyle.color, background: gradeStyle.bg, border: `1px solid ${gradeStyle.border}` }}
        >
          {grade}
        </span>
      )}
    </div>
  );
}

export default function BrandFitTab({ data, brandConfig }) {
  if (!data) {
    return <div className="text-center py-16 text-black/25">브랜드 적합성 분석을 불러올 수 없습니다.</div>;
  }

  const { score, grade, summary, strengths, challenges, improvements, recommendation } = data;

  return (
    <div className="space-y-3">
      {/* Score + Summary */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <ScoreRing score={score} grade={grade} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <Sparkles className="w-3.5 h-3.5 text-key" />
              <h3 className="text-xs font-semibold text-black/60 uppercase tracking-wider font-inter">브랜드 적합성 분석</h3>
            </div>
            <p className="text-sm text-black/50 leading-relaxed mb-3">{summary}</p>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.07]" style={{ background: 'var(--surface2)' }}>
              <span className="text-[10px] text-black/30 font-inter">브랜드</span>
              <span className="text-[10px] text-black/70 font-medium">{brandConfig?.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Strengths + Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strengths && strengths.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-3.5 h-3.5 text-key" />
              <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">강점</h3>
              <span className="ml-auto text-[10px] text-black/25 font-inter">{strengths.length}개</span>
            </div>
            <div className="space-y-2.5">
              {strengths.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border animate-slide-up"
                  style={{ background: 'rgba(213,41,42,0.05)', borderColor: 'rgba(213,41,42,0.15)', animationDelay: `${i * 80}ms` }}
                >
                  <p className="text-sm text-black/75 font-medium mb-1">{item.point}</p>
                  <p className="text-xs text-black/35 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {challenges && challenges.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-3.5 h-3.5 text-black/35" />
              <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">도전 과제</h3>
              <span className="ml-auto text-[10px] text-black/25 font-inter">{challenges.length}개</span>
            </div>
            <div className="space-y-2.5">
              {challenges.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border animate-slide-up"
                  style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.07)', animationDelay: `${i * 80}ms` }}
                >
                  <p className="text-sm text-black/65 font-medium mb-1">{item.point}</p>
                  <p className="text-xs text-black/35 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-3.5 h-3.5 text-black/40" />
            <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">개선 방향</h3>
          </div>
          <div className="space-y-2.5">
            {improvements.map((item, i) => {
              const priority = PRIORITY_STYLE[item.priority?.toLowerCase()] || PRIORITY_STYLE['medium'];
              return (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl border hover:border-black/[0.12] transition-colors animate-slide-up"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--border)', animationDelay: `${i * 80}ms` }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5 font-inter"
                    style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.10)', color: 'rgba(26,26,24,0.45)' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm text-black/80 font-medium">{item.action}</p>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 font-inter"
                        style={{ color: priority.color, background: priority.bg, borderColor: priority.border }}
                      >
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-xs text-black/35 leading-relaxed">{item.impact}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final recommendation */}
      {recommendation && (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(213,41,42,0.04)', borderColor: 'rgba(213,41,42,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-key" />
            <h3 className="text-xs font-semibold text-black/60 uppercase tracking-wider font-inter">AI 최종 의견</h3>
          </div>
          <p className="text-sm text-black/60 leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  );
}
