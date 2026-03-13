import { useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ChatInput({ onSubmit, loading, value, onChange }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSubmit(value.trim());
        onChange('');
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !loading) {
      onSubmit(value.trim());
      onChange('');
    }
  };

  const isActive = value.trim().length > 0;

  return (
    <div
      className="relative rounded-2xl border transition-all duration-200"
      style={{
        background: 'var(--surface1)',
        borderColor: isActive ? 'var(--border)' : 'rgba(0,0,0,0.07)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="마케팅 캠페인이나 기획 아이디어를 입력하세요..."
        disabled={loading}
        rows={1}
        className="w-full bg-transparent px-4 py-3.5 pr-14 text-sm text-black/85 placeholder-black/20 outline-none resize-none leading-relaxed"
        style={{ maxHeight: '160px' }}
      />

      {/* Submit button with key color */}
      <button
        onClick={handleSubmit}
        disabled={!isActive || loading}
        className="absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: isActive && !loading ? '#D5292A' : 'rgba(0,0,0,0.05)',
          cursor: isActive && !loading ? 'pointer' : 'default',
        }}
      >
        {loading ? (
          <span
            className="w-3 h-3 rounded-full border-2 border-transparent"
            style={{ borderTopColor: 'rgba(0,0,0,0.3)', animation: 'spin 0.7s linear infinite' }}
          />
        ) : (
          <ArrowUp
            className="w-4 h-4"
            style={{ color: isActive ? '#fff' : 'rgba(26,26,24,0.2)' }}
          />
        )}
      </button>
    </div>
  );
}
