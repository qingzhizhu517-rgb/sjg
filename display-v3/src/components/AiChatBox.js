'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const quickList = [
  '李白与杜甫在山东同游过哪些地方？',
  '大明湖有哪些经典诗词？',
  '带我去泰山风景区一键抵达。',
  '齐鲁文化大模型包含什么？'
];

export default function AiChatBox() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '您好！我是 <strong>AI 小文</strong>。已为您接入齐鲁文化大模型，集合了历史名人、文化典籍、自然地理景观等六大板块。请问有什么可以帮您？'
    }
  ]);

  const chatLogRef = useRef(null);

  const scrollToBottom = () => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const getMockResponse = (text) => {
    const query = text.toLowerCase();
    if (query.includes('李白') || query.includes('杜甫') || query.includes('同游')) {
      return {
        role: 'assistant',
        content: '天宝三载至四载（744-745年），李白与杜甫同游齐鲁大地。他们曾同游<strong>济南大明湖历下亭</strong>、登临<strong>泰山</strong>，最后在<strong>曲阜东石门山</strong>送别。这是中国文学史上最伟大的会面，留下了李白《鲁郡东石门送杜二甫》与杜甫《望岳》等不朽名篇。',
        actions: [
          { label: '飞往泰山', path: '/spots/3' },
          { label: '飞往大明湖', path: '/spots/2' }
        ]
      };
    } else if (query.includes('大明湖') || query.includes('历下亭')) {
      return {
        role: 'assistant',
        content: '大明湖是历代名士汇聚之所。杜甫在此写下“<strong>海右此亭古，济南名士多</strong>”；李清照少女时代在此泛舟迷路，写下《如梦令·常记溪亭日暮》；元代赵孟頫在此任职画下《鹊华秋色图》。',
        actions: [
          { label: '品读《如梦令》', path: '/poems/3' },
          { label: '品读《陪李北海宴历下亭》', path: '/poems/2' }
        ]
      };
    } else if (query.includes('泰山') || query.includes('抵达') || query.includes('一键')) {
      return {
        role: 'assistant',
        content: '泰山为五岳之首，是帝王封禅与文人望岳之圣地。已为您定位到泰山景观地标，您可以直接点击一键飞往。',
        actions: [
          { label: '直达泰山详情', path: '/spots/3' }
        ]
      };
    } else if (query.includes('大模型') || query.includes('齐鲁文化')) {
      return {
        role: 'assistant',
        content: '齐鲁文化大模型整合了山东六大文化板块的46个典型标识，包括三孔、泰山、大明湖、运河、聊斋等核心景观，旨在通过数字人文方式重塑黄河流域（山东段）的教学与科学普及应用。',
        actions: [
          { label: '探索文脉长河', path: '/timeline' }
        ]
      };
    } else {
      return {
        role: 'assistant',
        content: `关于“${text}”，根据齐鲁文献库记载，这与山东沿黄黄河流域的文学地标高度关联。建议您可以前往“山河图志”中进行沙盘探索或问询其他经典景点。`,
        actions: [
          { label: '返回地图大沙盘', path: '/map' }
        ]
      };
    }
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const res = getMockResponse(text);
      setMessages((prev) => [...prev, res]);
    }, 1200);
  };

  const triggerAction = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Chat Slide-in Drawer */}
      {isOpen && (
        <div className="w-80 h-[480px] mb-4 flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-xl animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--accent)] text-white border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M12 2v9M8 5h8" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-xs font-black tracking-wide leading-none">AI 小文</h3>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">齐鲁文化大模型驱动</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80 text-xl font-bold p-1 leading-none cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Quick Questions Tags */}
          {messages.length <= 1 && (
            <div className="p-3 bg-[var(--bg-secondary)]/30 border-b border-[var(--border-light)] text-left flex flex-col gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)]">您可以这样问我：</span>
              <div className="flex flex-col gap-1">
                {quickList.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[11px] font-bold text-left text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-secondary)]/50 p-1.5 rounded transition-all cursor-pointer border border-dashed border-[var(--border)]/40 hover:border-[var(--accent)]/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
          <div ref={chatLogRef} className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  msg.role === 'assistant' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]'
                }`}>
                  {msg.role === 'assistant' ? '文' : '访'}
                </div>
                {/* Message Bubble */}
                <div className="flex flex-col gap-1.5 max-w-[75%]">
                  <div
                    className={`p-2.5 rounded-lg text-[12px] leading-relaxed shadow-sm
                      ${msg.role === 'user'
                        ? 'bg-[var(--accent)]/10 text-[var(--text-primary)] border border-[var(--accent)]/20 rounded-tr-none'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] border border-[var(--border-light)] rounded-tl-none'}`}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                  {/* Action recommendation buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-start">
                      {msg.actions.map((act) => (
                        <button
                          key={act.label}
                          onClick={() => triggerAction(act.path)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] cursor-pointer select-none transition-colors"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-black shrink-0">
                  文
                </div>
                <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-light)] rounded-lg rounded-tl-none p-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputMsg);
            }}
            className="flex border-t border-[var(--border)]/70 p-2 bg-[var(--card-bg)]"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="探寻齐鲁文脉，问我李杜足迹..."
              className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-secondary)]/40 rounded-l-md border border-[var(--border-light)] focus:border-[var(--accent)]/50 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-3.5 bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white rounded-r-md flex items-center justify-center cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? '关闭小文' : '唤醒AI小文'}
        className="w-[54px] h-[54px] rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] shadow-lg hover:shadow-xl hover:translate-y-[-3px] flex items-center justify-center cursor-pointer transition-all duration-300 relative group select-none"
      >
        <div className="w-7 h-7 flex items-center justify-center">
          {isOpen ? (
            <span className="text-2xl font-bold leading-none">×</span>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </div>
        {/* Breathing ripple effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border border-[var(--accent)] opacity-40 scale-100 group-hover:scale-125 animate-ping duration-1000 pointer-events-none" />
        )}
      </button>
    </div>
  );
}
