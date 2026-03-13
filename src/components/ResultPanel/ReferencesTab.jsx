import { useState } from 'react';
import { ExternalLink, Instagram } from 'lucide-react';

const AVATAR_COLORS = [
  '#E87A7A','#7AB0E8','#9B83E8','#6DC99E','#E8C47A','#E8A87A','#A8C8E8',
];

function getAccentColor(brandName) {
  return AVATAR_COLORS[brandName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}

// Hex to RGB helper for rgba() usage
function hexToRgb(hex) {
  const h = hex?.replace('#', '') || '';
  if (h.length < 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function ReferenceCard({ item, index }) {
  const [logoFailed, setLogoFailed] = useState(false);

  const initials = item.brandName.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const accentColor = item.colorHex || getAccentColor(item.brandName);
  const rgb = hexToRgb(accentColor);

  // Profile: clearbit brand logo → colored initials
  const logoUrl = !logoFailed && item.domain
    ? `https://logo.clearbit.com/${item.domain}`
    : null;

  // Header background: brand color gradient using colorHex from Gemini
  const headerBg = rgb
    ? `radial-gradient(ellipse at 60% 40%, rgba(${rgb},0.35) 0%, rgba(${rgb},0.08) 55%, transparent 80%)`
    : undefined;

  return (
    <div
      className="card-hover overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div
        className="h-24 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--surface2)' }}
      >
        {/* Brand color gradient overlay */}
        {headerBg && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: headerBg }}
          />
        )}

        {/* Profile logo / initials */}
        <div className="relative z-10">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={item.brandName}
              onError={() => setLogoFailed(true)}
              className="w-14 h-14 rounded-full object-contain shadow-sm"
              style={{ background: '#fff', padding: '6px' }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm"
              style={{ background: accentColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {item.year && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] px-2 py-1 rounded-full text-black/40 bg-black/5 border border-black/[0.08] font-inter">
              {item.year}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-medium text-black/90 text-sm">{item.brandName}</h3>
            {item.tagline && (
              <p className="text-xs text-black/35 mt-0.5 italic font-inter">"{item.tagline}"</p>
            )}
          </div>
          {item.category && (
            <span className="flex-shrink-0 tag text-[10px]">{item.category}</span>
          )}
        </div>

        <p className="text-xs text-black/40 leading-relaxed mb-3 line-clamp-3">{item.description}</p>

        <div className="flex items-center gap-2">
          {item.country && (
            <span className="text-[10px] text-black/25 font-inter">{item.country}</span>
          )}
          <div className="flex-1" />
          {item.instagramUrl && (
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-black/35 hover:text-key transition-colors px-2 py-1 rounded-lg hover:bg-key/10"
            >
              <Instagram className="w-3 h-3" />
              <span className="font-inter text-[10px]">
                @{item.instagramHandle || item.instagramUrl.split('/').filter(Boolean).pop()}
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReferencesTab({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-16 text-black/25">
        <p>레퍼런스를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="label-cap mb-4">
        {data.length}개 레퍼런스
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, i) => (
          <ReferenceCard key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
