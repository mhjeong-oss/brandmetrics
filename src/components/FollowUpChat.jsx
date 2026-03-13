import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Trash2, ChevronDown } from 'lucide-react';
import { chatWithAnalysis } from '../utils/gemini';

const QUICK_QUESTIONS = [
  '이 기획의 가장 큰 리스크는?',
  '예산을 최소화하려면?',
  '타겟 연령층을 바꾸면 어떨까?',
  '경쟁사 대비 차별점 강화 방법은?',
];

export default function FollowUpChat({ results, query, brandConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const reply = await chatWithAnalysis(newMessages, results, brandConfig, query);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setError('답변을 가져오지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const msgCount = Math.ceil(messages.length / 2);

  return (
    /* 화면 하단 중앙에 고정 — 최대 너비 400px */
    <div className="fixed bottom-5 left-1/2 z-40" style={{ transform: 'translateX(-50%)', width: 'min(400px, calc(100vw - 32px))' }}>

      {/* 채팅 패널 — 버튼 위로 올라오는 카드 */}
      <div
        className="mb-2 rounded-2xl overflow-hidden shadow-2xl border border-black/[0.08]"
        style={{
          background: 'var(--bg)',
          transformOrigin: 'bottom center',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* 패널 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]"
          style={{ borderBottom: '1.5px solid var(--key)' }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5" style={{ color: 'var(--key)' }} />
            <span className="text-sm font-medium text-black/70">AI 분석 채팅</span>
            {msgCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white tabular-nums" style={{ background: 'var(--key)' }}>
                {msgCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/50 transition-colors"
                title="대화 초기화"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 hover:text-black/60 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="h-72 overflow-y-auto px-3 pt-3 pb-2 space-y-2.5" style={{ scrollbarWidth: 'thin' }}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col justify-center">
              <p className="text-xs text-black/30 text-center mb-3">분석 결과를 바탕으로 자유롭게 질문하세요</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-left text-[11px] px-2.5 py-2 rounded-xl border border-black/[0.07] hover:border-black/[0.14] hover:bg-black/[0.02] text-black/40 hover:text-black/60 transition-all leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] text-[13px] leading-relaxed px-3 py-2 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-black/[0.04] text-black/75 rounded-bl-sm border border-black/[0.05]'
                }`}
                style={msg.role === 'user' ? { background: 'var(--key)' } : {}}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-black/[0.04] border border-black/[0.05]">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--key)', opacity: 0.6, animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-[11px] text-center text-black/30">{error}</p>}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="px-2.5 pb-2.5 pt-1.5 flex items-end gap-2 border-t border-black/[0.04]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문하거나 지시를 입력하세요... (Enter 전송)"
            rows={1}
            className="flex-1 resize-none text-[13px] px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.07] focus:border-black/20 focus:outline-none text-black/75 placeholder:text-black/25 leading-relaxed"
            style={{ minHeight: '38px', maxHeight: '90px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--key)' }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 플로팅 토글 버튼 */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-medium shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
        style={{ background: 'var(--key)' }}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>닫기</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <span>AI에게 질문하기</span>
            {msgCount > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full tabular-nums">
                {msgCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
