import { useState } from 'react';
import { Layers, Lightbulb, Target, BarChart2, Wand2 } from 'lucide-react';
import ReferencesTab from './ReferencesTab';
import InsightsTab from './InsightsTab';
import BrandFitTab from './BrandFitTab';
import ChartsTab from './ChartsTab';
import IdeasTab from './IdeasTab';

const TABS = [
  { id: 'references', label: '레퍼런스',    icon: Layers },
  { id: 'insights',   label: '인사이트',    icon: Lightbulb },
  { id: 'brandFit',   label: '브랜드 적합성', icon: Target },
  { id: 'charts',     label: '차트',        icon: BarChart2 },
  { id: 'ideas',      label: '아이디어 확장', icon: Wand2 },
];

export default function ResultPanel({ results, query, brandConfig }) {
  const [activeTab, setActiveTab] = useState('references');

  const ActiveContent = {
    references: ReferencesTab,
    insights:   InsightsTab,
    brandFit:   BrandFitTab,
    charts:     ChartsTab,
    ideas:      IdeasTab,
  }[activeTab];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
      {/* Query display */}
      <div className="mb-6">
        <p className="label-cap mb-2">분석 내용</p>
        <p className="text-sm text-black/50 leading-relaxed">{query}</p>
      </div>

      <div className="divider mb-0" />

      {/* Tab bar — horizontally scrollable on mobile */}
      <div className="flex gap-0 mb-8 border-b border-black/[0.06] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 sm:px-4 py-3 text-xs sm:text-sm transition-colors relative whitespace-nowrap ${
              activeTab === id
                ? 'text-black/90'
                : 'text-black/30 hover:text-black/55'
            }`}
          >
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{label}</span>
            {activeTab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-key rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={activeTab} className="animate-fade-in">
        <ActiveContent
          data={activeTab === 'charts' ? results?.insights : activeTab === 'ideas' ? results : results[activeTab]}
          brandConfig={brandConfig}
          query={query}
        />
      </div>
    </div>
  );
}
