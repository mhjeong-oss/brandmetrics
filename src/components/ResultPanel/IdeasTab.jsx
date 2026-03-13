import { ArrowRight } from 'lucide-react';

const TYPE_STYLES = {
  expansion:     { label: '확장',  bg: 'rgba(122,176,232,0.10)', border: 'rgba(122,176,232,0.22)', color: '#3A7DC8' },
  variation:     { label: '변형',  bg: 'rgba(155,131,232,0.10)', border: 'rgba(155,131,232,0.22)', color: '#6A4EC8' },
  derived:       { label: '파생',  bg: 'rgba(109,201,158,0.10)', border: 'rgba(109,201,158,0.22)', color: '#2E8F5E' },
  collaboration: { label: '협업',  bg: 'rgba(232,196,122,0.10)', border: 'rgba(232,196,122,0.22)', color: '#A87A20' },
};

export default function IdeasTab({ data }) {
  const ideas = data?.ideas;

  if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
    return <div className="text-center py-16 text-black/25">아이디어 확장 데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-black/40 leading-relaxed">
        입력하신 기획을 발전시킬 수 있는 파생·확장 아이디어입니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ideas.map((s, i) => {
          const ts = TYPE_STYLES[s.type] || TYPE_STYLES.expansion;
          return (
            <div
              key={i}
              className="card-hover p-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-black/85 leading-snug">{s.title}</h3>
                <span
                  className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-inter whitespace-nowrap"
                  style={{ background: ts.bg, borderColor: ts.border, color: ts.color }}
                >
                  {s.typeLabel || ts.label}
                </span>
              </div>

              {s.concept && (
                <p className="text-xs font-medium font-inter italic mb-2.5" style={{ color: 'var(--key)' }}>
                  {s.concept}
                </p>
              )}

              <p className="text-xs text-black/45 leading-relaxed mb-3">{s.description}</p>

              {s.hook && (
                <div className="flex items-start gap-2 pt-3 border-t border-black/[0.06]">
                  <ArrowRight className="w-3 h-3 text-black/25 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-black/35 leading-relaxed">{s.hook}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
