import { Sun, Moon } from 'lucide-react';

export default function HeroPage({ onEnter, onToggleTheme, isDark }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* Top nav */}
      <nav className="relative z-20 flex-shrink-0 h-14 flex items-center justify-between px-8 border-b border-black/[0.05]">
        <span className="font-serif text-lg text-black/90 tracking-tight">BrandMetrics</span>
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl hover:bg-black/5 text-black/30 hover:text-black/70 transition-colors"
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onEnter}
            className="label-cap text-black/30 hover:text-black/60 transition-colors"
          >
            Skip →
          </button>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">

        {/* Headline */}
        <div className="text-center mb-12 animate-greeting">
          <h1
            className="font-serif italic leading-[1.02] tracking-tight mb-4 text-black/90"
            style={{ fontSize: 'clamp(4.5rem, 11vw, 10rem)', fontWeight: 600 }}
          >
            Brand Metrics
          </h1>
          <p className="font-jakarta font-light text-black/30 tracking-widest uppercase text-xs">
            AI-powered brand intelligence
          </p>
        </div>

        {/* Circular CTA button */}
        <button
          onClick={onEnter}
          className="relative group animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95"
            style={{ background: '#D5292A' }}
          >
            <span
              className="font-jakarta font-semibold text-sm text-center leading-tight tracking-tight"
              style={{ color: '#fff', maxWidth: '80px' }}
            >
              Get<br />Started
            </span>
          </div>
          {/* Subtle ring */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300 group-hover:scale-110 opacity-0 group-hover:opacity-100"
            style={{ border: '1px solid rgba(213,41,42,0.3)' }}
          />
        </button>
      </div>

      {/* Video — bottom strip */}
      <div className="relative z-10 w-full flex-shrink-0" style={{ height: '38vh' }}>
        {/* Top fade — uses CSS var so it adapts to dark/light mode */}
        <div
          className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none hero-fade-top"
        />

        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ opacity: 0.75 }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none hero-fade-bottom"
        />
      </div>
    </div>
  );
}
