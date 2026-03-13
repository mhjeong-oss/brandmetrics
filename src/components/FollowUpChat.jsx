import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react';
import { chatWithAnalysis } from '../utils/gemini';

export default function FollowUpChat({ results, query, brandConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // 채팅 열릴 때 스크롤 & 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  // 새 메시지 올 때 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (err) {
      setError('답변을 가져오는 데 실패했습니다. 다시 시도해 주세요.');
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

  const QUICK_QUESTIONS = [
    '이 기획의 가장 큰 리스크는?',
    '예산을 최소화하려면?',
    '타겟 연령층을 바꾸면 어떨까?',
    '경쟁사 대비 차별점을 강화하려면?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">
      {/* 채팅 토글 버튼 */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-black/[0.08] hover:border-black/20 hover:bg-black/[0.02] transition-all text-sm text-black/40 hover:text-black/60 group"
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>분석 결과에 대해 AI에게 질문하기</span>
        </button>
      ) : (
        <div className="rounded-2xl border border-black/[0.08] overflow-hidden">
          {/* 채팅 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] bg-black/[0.01]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-black/40" />
              <span className="text-xs font-medium text-black/50">분석 결과 Q&A</span>
              {messages.length > 0 && (
                <span className="text-xs text-black/25">{Math.ceil(messages.length / 2)}번의 대화</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-black/25 hover:text-black/45 px-2 py-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                  초기화
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 hover:text-black/60 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {/* 빈 상태: 빠른 질문 제안 */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center">
                <p className="text-xs text-black/30 text-center mb-4">분석 결과를 바탕으로 무엇이든 질문하세요</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border border-black/[0.07] hover:border-black/15 hover:bg-black/[0.02] text-black/45 hover:text-black/65 transition-all leading-relaxed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 대화 메시지 */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-black/[0.06] text-black/80 rounded-br-md'
                      : 'bg-black/[0.03] text-black/70 rounded-bl-md border border-black/[0.05]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* 로딩 */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-black/[0.03] border border-black/[0.05]">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-black/25 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div className="text-xs text-center text-black/35 py-1">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="px-3 py-3 border-t border-black/[0.05] flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="분석 결과에 대해 질문하거나 추가 지시를 입력하세요..."
              rows={1}
              className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl bg-black/[0.03] border border-black/[0.07] focus:border-black/20 focus:outline-none text-black/75 placeholder:text-black/25 leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-black/80 text-white hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
