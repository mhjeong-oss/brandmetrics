import { TrendingUp, Hash, Zap, BarChart2 } from 'lucide-react';

const METRIC_LABELS = {
  emotional: '감성 소구',
  visual: '비주얼 임팩트',
  viral: '바이럴 가능성',
  innovation: '혁신성',
  brandAlignment: '브랜드 일관성',
};

function MetricBar({ metricKey, value, index }) {
  const label = METRIC_LABELS[metricKey] || metricKey;
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const isHigh = pct >= 70;

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-black/50">{label}</span>
        <span className={`font-bold font-inter ${isHigh ? 'text-2xl' : 'text-2xl'}`} style={{ color: isHigh ? '#D5292A' : 'rgba(26,26,24,0.6)' }}>
          {pct}
        </span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className="h-full rounded-full bar-fill"
          style={{
            '--bar-width': `${pct}%`,
            width: `${pct}%`,
            background: isHigh ? '#D5292A' : 'rgba(26,26,24,0.25)',
            animationDelay: `${index * 80 + 200}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function InsightsTab({ data }) {
  if (!data) {
    return <div className="text-center py-16 text-black/25">인사이트를 불러올 수 없습니다.</div>;
  }

  const { mainAnalysis, keywords, effectiveness, keyTakeaways, marketTrends } = data;

  return (
    <div className="space-y-3">
      {/* 2-col grid: analysis + metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main analysis */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5 text-key" />
            <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">마케팅 분석</h3>
          </div>
          <div className="space-y-3">
            {(mainAnalysis || '').split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-sm text-black/50 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>

        {/* Effectiveness metrics */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-3.5 h-3.5 text-black/40" />
            <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">효과성 지표</h3>
          </div>
          {effectiveness && (
            <div className="space-y-4">
              {Object.entries(effectiveness).map(([key, val], i) => (
                <MetricBar key={key} metricKey={key} value={val} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-3.5 h-3.5 text-black/40" />
            <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">핵심 키워드</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-full text-xs border animate-fade-in font-inter ${
                  i % 5 === 0 ? 'tag-key' : 'tag'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: takeaways + trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-key" />
              <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">핵심 인사이트</h3>
            </div>
            <div className="space-y-3">
              {keyTakeaways.map((item, i) => (
                <div key={i} className="flex gap-3 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5 font-inter"
                    style={{ background: 'rgba(213,41,42,0.10)', border: '1px solid rgba(213,41,42,0.25)', color: '#D5292A' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-black/50 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {marketTrends && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-black/40" />
              <h3 className="text-xs font-semibold text-black/70 uppercase tracking-wider font-inter">시장 트렌드</h3>
            </div>
            <p className="text-sm text-black/50 leading-relaxed">{marketTrends}</p>
          </div>
        )}
      </div>
    </div>
  );
}
