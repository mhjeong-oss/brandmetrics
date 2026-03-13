const COLORS = [
  { key: 'emotional',      label: '감성 소구',   accent: '#E87A7A', bg: 'rgba(232,122,122,0.10)', border: 'rgba(232,122,122,0.22)' },
  { key: 'visual',         label: '비주얼',      accent: '#7AB0E8', bg: 'rgba(122,176,232,0.10)', border: 'rgba(122,176,232,0.22)' },
  { key: 'viral',          label: '바이럴',      accent: '#9B83E8', bg: 'rgba(155,131,232,0.10)', border: 'rgba(155,131,232,0.22)' },
  { key: 'innovation',     label: '혁신성',      accent: '#6DC99E', bg: 'rgba(109,201,158,0.10)', border: 'rgba(109,201,158,0.22)' },
  { key: 'brandAlignment', label: '브랜드 정합', accent: '#E8C47A', bg: 'rgba(232,196,122,0.10)', border: 'rgba(232,196,122,0.22)' },
];

const KW_COLORS = [
  { bg: 'rgba(232,122,122,0.12)', border: 'rgba(232,122,122,0.25)', color: '#C25252' },
  { bg: 'rgba(122,176,232,0.12)', border: 'rgba(122,176,232,0.25)', color: '#3A7DC8' },
  { bg: 'rgba(155,131,232,0.12)', border: 'rgba(155,131,232,0.25)', color: '#6A4EC8' },
  { bg: 'rgba(109,201,158,0.12)', border: 'rgba(109,201,158,0.25)', color: '#2E8F5E' },
  { bg: 'rgba(232,196,122,0.12)', border: 'rgba(232,196,122,0.25)', color: '#A87A20' },
];

/* ─────────────────────────────────────────────────────
   1. Radar / Spider Chart (pentagon)
───────────────────────────────────────────────────── */
function RadarChart({ effectiveness }) {
  if (!effectiveness) return null;
  const metrics = COLORS.map(c => ({ ...c, value: effectiveness[c.key] || 0 }));
  const n = metrics.length;
  const cx = 140, cy = 155, r = 90;

  const pt = (i, val) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    const d = (val / 100) * r;
    return { x: cx + d * Math.cos(angle), y: cy + d * Math.sin(angle) };
  };

  const gridPts = (level) =>
    Array.from({ length: n }, (_, i) => {
      const { x, y } = pt(i, level);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

  const valuePts = metrics.map((m, i) => pt(i, m.value));
  const valueStr = valuePts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const labelPts = metrics.map((m, i) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    const lr = r + 28;
    return {
      x: cx + lr * Math.cos(angle),
      y: cy + lr * Math.sin(angle),
      label: m.label, value: m.value, color: m.accent,
    };
  });

  return (
    <svg viewBox="0 0 280 300" className="w-full max-w-[260px] mx-auto">
      {[25, 50, 75, 100].map(lvl => (
        <polygon key={lvl} points={gridPts(lvl)} fill="none" stroke="rgba(0,0,0,0.055)" strokeWidth="0.75" />
      ))}
      {metrics.map((m, i) => {
        const end = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(0,0,0,0.07)" strokeWidth="0.5" />;
      })}
      <text x={cx + 4} y={cy - (50/100)*r - 3} style={{ fontSize: '6px', fill: 'rgba(0,0,0,0.20)', fontFamily: 'Inter' }}>50</text>
      <polygon points={valueStr} fill="rgba(232,122,122,0.10)" stroke="rgba(232,122,122,0.50)" strokeWidth="1.5" strokeLinejoin="round" />
      {valuePts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={metrics[i].accent} opacity="0.85" />
      ))}
      {labelPts.map((lp, i) => (
        <g key={i}>
          <text x={lp.x} y={lp.y - 5} textAnchor="middle" style={{ fontSize: '8px', fill: 'rgba(0,0,0,0.38)', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>{lp.label}</text>
          <text x={lp.x} y={lp.y + 8} textAnchor="middle" style={{ fontSize: '10px', fill: lp.color, fontFamily: 'Inter, sans-serif', fontWeight: '800' }}>{lp.value}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   2. Gauge / Dial (semi-circle)
───────────────────────────────────────────────────── */
function GaugeDial({ colorConfig, value, animDelay = 0 }) {
  const cx = 70, cy = 64, r = 50;
  const pct = Math.min(0.998, Math.max(0, Number(value) || 0) / 100);
  const arcLen = Math.PI * r;
  // Use the full semicircle path for both bg and value arc.
  // strokeDashoffset clips the value arc to the correct percentage.
  const fullPath = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  const targetOffset = (1 - pct) * arcLen;

  return (
    <div
      className="flex flex-col items-center rounded-2xl p-3 animate-slide-up"
      style={{ background: colorConfig.bg, border: `1px solid ${colorConfig.border}`, animationDelay: `${animDelay}ms` }}
    >
      <svg viewBox="0 0 140 90" className="w-full max-w-[130px]">
        <path d={fullPath} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="7" strokeLinecap="round" className="gauge-track" />
        <path
          d={fullPath}
          fill="none"
          stroke={colorConfig.accent}
          strokeWidth="7"
          strokeLinecap="round"
          style={{
            strokeDasharray: arcLen,
            '--full-len': arcLen,
            '--gauge-offset': targetOffset,
          }}
          className="gauge-fill"
        />
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Inter, sans-serif', fill: colorConfig.accent }}
        >
          {value}
        </text>
      </svg>
      <span className="text-[10px] mt-0.5 font-medium font-inter text-center" style={{ color: 'var(--text-muted)' }}>
        {colorConfig.label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────────── */
export default function ChartsTab({ data }) {
  if (!data) return <div className="text-center py-16 text-black/25">차트 데이터를 불러올 수 없습니다.</div>;

  const { effectiveness, keywords, keyTakeaways, marketTrends } = data;

  return (
    <div className="space-y-4">

      {/* ① Radar chart */}
      {effectiveness && (
        <div className="card p-6">
          <p className="label-cap mb-5">마케팅 효과 레이더</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-full sm:w-auto">
              <RadarChart effectiveness={effectiveness} />
            </div>
            <div className="flex-1 space-y-2.5 w-full">
              {COLORS.map((c) => {
                const val = effectiveness[c.key] || 0;
                return (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.accent }} />
                    <span className="text-xs text-black/45 w-20 flex-shrink-0">{c.label}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full bar-fill" style={{ '--bar-width': `${val}%`, background: c.accent }} />
                    </div>
                    <span className="text-xs font-bold font-inter w-7 text-right" style={{ color: c.accent }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ② Gauge dials */}
      {effectiveness && (
        <div className="card p-6">
          <p className="label-cap mb-5">지표별 다이얼</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {COLORS.map((c, i) => (
              <GaugeDial key={c.key} colorConfig={c} value={effectiveness[c.key] || 0} animDelay={i * 70} />
            ))}
          </div>
        </div>
      )}

      {/* ③ Keyword cloud */}
      {keywords && keywords.length > 0 && (
        <div className="card p-6">
          <p className="label-cap mb-4">핵심 키워드</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => {
              const col = KW_COLORS[i % KW_COLORS.length];
              const fs = Math.min(0.88, 0.70 + (keywords.length - i) * 0.025);
              return (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full border font-medium font-inter animate-fade-in"
                  style={{ fontSize: `${fs}rem`, background: col.bg, borderColor: col.border, color: col.color, animationDelay: `${i * 40}ms` }}
                >
                  {kw}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ④ Takeaway flow */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="card p-6">
          <p className="label-cap mb-4">핵심 인사이트 흐름</p>
          <div className="space-y-2.5">
            {keyTakeaways.map((t, i) => {
              const col = COLORS[i % COLORS.length];
              return (
                <div
                  key={i}
                  className="flex gap-3 items-start p-3.5 rounded-2xl animate-slide-up"
                  style={{ background: col.bg, border: `1px solid ${col.border}`, animationDelay: `${i * 70}ms` }}
                >
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-inter"
                    style={{ background: col.accent, color: '#fff' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-black/65 leading-relaxed">{t}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ⑤ Market trend */}
      {marketTrends && (
        <div className="card p-6">
          <p className="label-cap mb-3">시장 트렌드</p>
          <p className="text-sm text-black/55 leading-relaxed">{marketTrends}</p>
        </div>
      )}
    </div>
  );
}
