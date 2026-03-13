import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
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

  // 열릴 때 입력창 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen]);

  // 새 메시지마다 스크롤
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

  const unreadCount = Math.ceil(messages.length / 2);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* 펼쳐진 채팅 패널 — 위로 슬라이드 */}
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{ maxHeight: isOpen ? '420px' : '0px' }}
      >
        <div
          className="border-t border-black/[0.08]"
          style={{ background: 'var(--bg)' }}
        >
          <div className="max-w-2xl mx-auto">
            {/* 메시지 영역 */}
            <div
              className="h-64 overflow-y-auto px-4 pt-4 pb-2 space-y-3"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* 빈 상태: 빠른 질문 */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center">
                  <p className="text-xs text-black/28 text-center mb-3">
                    분석 결과를 바탕으로 질문하거나 추가 지시를 내려보세요
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(q);
                          inputRef.current?.focus();
                        }}
                        className="text-left text-xs px-3 py-2 rounded-xl border border-black/[0.07] hover:border-black/[0.14] hover:bg-black/[0.02] text-black/40 hover:text-black/60 transition-all leading-relaxed"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 대화 */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-black/[0.07] text-black/80 rounded-br-md'
                        : 'bg-black/[0.03] text-black/70 rounded-bl-md border border-black/[0.05]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* 로딩 dots */}
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

              {error && (
                <p className="text-xs text-center text-black/35">{error}</p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div className="px-3 pb-3 pt-1 flex items-end gap-2 border-t border-black/[0.04]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="질문하거나 추가 지시를 입력하세요... (Enter 전송)"
                rows={1}
                className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl bg-black/[0.03] border border-black/[0.07] focus:border-black/20 focus:outline-none text-black/75 placeholder:text-black/25 leading-relaxed mt-2"
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 mb-0.5 w-9 h-9 flex items-center justify-center rounded-xl text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--key)' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 토글 바 — 항상 표시 */}
      <div
        className="border-t"
        style={{ background: 'var(--bg)', borderColor: 'var(--key)', borderTopWidth: '2px' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* 왼쪽: 아이콘 + 라벨 */}
          <button
            onClick={() => setIsOpen(o => !o)}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--key)' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>AI에게 질문하기</span>
            {unreadCount > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full text-white tabular-nums"
                style={{ background: 'var(--key)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* 오른쪽: 초기화 + 토글 화살표 */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/50 transition-colors"
                title="대화 초기화"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(o => !o)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: 'var(--key)' }}
            >
              {isOpen
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronUp className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
