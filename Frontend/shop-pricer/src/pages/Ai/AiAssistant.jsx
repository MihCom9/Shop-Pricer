import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Sparkles, RotateCcw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const SUGGESTIONS = [
  'Best deals today in Sofia',
  'Ingredients for spaghetti bolognese',
  'Cheapest chicken in Kaufland',
  'Weekly groceries under 50 лв',
  'Compare milk prices across stores',
  'What is on sale at Lidl?'
];

function generateConversationId() {
  return 'conv_' + Math.random().toString(36).slice(2, 9);
}

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(generateConversationId);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const sendMessage = useCallback(async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setShowSuggestions(false);
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      const params = new URLSearchParams({ question, conversationId });
      const res = await fetch(`${API_BASE_URL}/ai/test?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const answer = await res.text();
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'error',
          text: 'Could not reach the assistant. Make sure the backend is running on localhost:8080.',
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, conversationId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setShowSuggestions(true);
    setInput('');
  };

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --brand:    #D85A30;
          --brand-lt: #FAECE7;
          --brand-dk: #993C1D;
          --ink:      #1e160f;
          --ink-2:    #6b5248;
          --ink-3:    #c4aa9f;
          --surface:  #fdf8f4;
          --card:     #ffffff;
          --border:   rgba(210,160,130,.18);
          --border-md:rgba(210,160,130,.32);
          --r-sm: 10px;
          --r-md: 14px;
          --r-lg: 20px;
          --ff-serif: 'Fraunces', Georgia, serif;
          --ff-sans:  'DM Sans', system-ui, sans-serif;
        }

        /* ── Reveal animation ── */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .35; }
        }
        @keyframes dot {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* ── Root ── */
        .ai-page {
          font-family: var(--ff-sans);
          background: var(--surface);
          color: var(--ink);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .ai-header {
          padding: clamp(2rem, 6vw, 3.5rem) 1.5rem 1.5rem;
          text-align: center;
          position: relative;
        }
        .ai-header::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,81,42,.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500;
          color: var(--brand-dk); background: var(--brand-lt);
          border: 1px solid rgba(216,90,48,.25); border-radius: 20px;
          padding: 4px 14px; margin-bottom: 1rem;
          animation: fadeDown .5s ease both;
        }
        .ai-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--brand);
          animation: pulse 2s infinite;
        }
        .ai-title {
          font-family: var(--ff-serif);
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 500; line-height: 1.15; letter-spacing: -.3px;
          margin-bottom: .6rem;
          animation: fadeDown .5s .08s ease both;
        }
        .ai-title em { font-style: italic; color: var(--brand); }
        .ai-sub {
          font-size: 14px; color: var(--ink-2); line-height: 1.6;
          max-width: 380px; margin: 0 auto;
          animation: fadeDown .5s .16s ease both;
        }

        /* ── Conv strip ── */
        .conv-strip {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 760px; margin: 0 auto; padding: .5rem 1.5rem;
          animation: fadeDown .5s .2s ease both;
        }
        .conv-pill {
          font-size: 11px; color: var(--ink-3);
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 3px 10px;
        }
        .reset-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; color: var(--ink-2); background: none; border: none;
          cursor: pointer; font-family: var(--ff-sans);
          padding: 4px 10px; border-radius: var(--r-sm);
          transition: color .15s, background .15s;
        }
        .reset-btn:hover { color: var(--brand); background: var(--brand-lt); }

        /* ── Main layout ── */
        .ai-body {
          flex: 1; display: flex; flex-direction: column;
          max-width: 760px; width: 100%; margin: 0 auto;
          padding: 0 1.5rem 2rem;
        }

        /* ── Suggestions ── */
        .suggestions {
          display: flex; flex-wrap: wrap; gap: 7px;
          justify-content: center; margin-bottom: 1.5rem;
          animation: fadeUp .45s .25s ease both;
        }
        .sug-pill {
          font-size: 12px; color: var(--ink-2);
          background: var(--card); border: 1px solid var(--border-md);
          border-radius: 20px; padding: 6px 14px;
          cursor: pointer; font-family: var(--ff-sans);
          transition: all .15s;
        }
        .sug-pill:hover {
          background: var(--brand-lt); color: var(--brand-dk);
          border-color: rgba(216,90,48,.3);
        }

        /* ── Chat ── */
        .chat-wrap {
          flex: 1;
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-lg); overflow: hidden;
          display: flex; flex-direction: column;
          min-height: 400px;
        }
        .chat-messages {
          flex: 1; overflow-y: auto; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 12px;
          scroll-behavior: smooth;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 2px; }

        /* ── Empty state ── */
        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 3rem 1.5rem; gap: .75rem;
        }
        .empty-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: var(--brand-lt); color: var(--brand);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: .25rem;
        }
        .empty-state h3 {
          font-family: var(--ff-serif); font-size: 1.15rem;
          font-weight: 500; color: var(--ink);
        }
        .empty-state p { font-size: 13px; color: var(--ink-2); max-width: 280px; line-height: 1.55; }

        /* ── Messages ── */
        .msg-row {
          display: flex; gap: 8px; align-items: flex-start;
          animation: fadeUp .25s ease;
        }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 600; letter-spacing: .03em;
        }
        .avatar.ai   { background: var(--brand-lt); color: var(--brand-dk); }
        .avatar.user { background: var(--ink); color: #fff; }
        .bubble {
          max-width: 78%; padding: 10px 14px;
          font-size: 13.5px; line-height: 1.6;
          white-space: pre-wrap; word-break: break-word;
        }
        .bubble.ai {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 4px 14px 14px 14px; color: var(--ink);
        }
        .bubble.user {
          background: var(--brand); color: #fff;
          border-radius: 14px 4px 14px 14px;
        }
        .bubble.error {
          background: #fff0ed; border: 1px solid rgba(192,64,32,.2);
          border-radius: 10px; color: #c04020; font-size: 13px;
          text-align: center; max-width: 100%;
        }

        /* ── Typing indicator ── */
        .typing-dots {
          display: flex; gap: 4px; align-items: center; padding: 2px 0;
        }
        .typing-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--ink-3);
          animation: dot .9s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: .18s; }
        .typing-dots span:nth-child(3) { animation-delay: .36s; }

        /* ── Input area ── */
        .input-area {
          border-top: 1px solid var(--border);
          padding: .75rem 1rem 1rem;
          background: var(--card);
        }
        .input-wrap {
          display: flex; align-items: flex-end; gap: 8px;
          background: var(--surface); border: 1px solid var(--border-md);
          border-radius: var(--r-md); padding: 8px 8px 8px 14px;
        }
        .input-wrap:focus-within {
          border-color: rgba(216,90,48,.45);
          box-shadow: 0 0 0 3px rgba(216,90,48,.08);
        }
        .input-wrap textarea {
          flex: 1; min-width: 0; border: none; outline: none;
          background: transparent; font-size: 13.5px; color: var(--ink);
          font-family: var(--ff-sans); resize: none;
          min-height: 22px; max-height: 120px; line-height: 1.55;
        }
        .input-wrap textarea::placeholder { color: var(--ink-3); }
        .send-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: var(--brand); border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background .15s, transform .1s, opacity .15s;
        }
        .send-btn:hover   { background: var(--brand-dk); }
        .send-btn:active  { transform: scale(.93); }
        .send-btn:disabled { opacity: .45; cursor: not-allowed; }
        .input-hint {
          font-size: 11px; color: var(--ink-3);
          margin-top: 6px; text-align: center;
        }
      `}</style>

      <div className="ai-page">
        {/* Header */}
        <div className="ai-header">
          <h1 className="ai-title">
            Your <em>smart</em> grocery companion
          </h1>
          <p className="ai-sub">
            Ask about prices, plan meals, build budget lists — in Bulgarian or English.
          </p>
        </div>

        {/* Conv ID + Reset */}
        {/* <div className="conv-strip">
          <div className="conv-pill">session: {conversationId}</div>
          <button className="reset-btn" onClick={resetConversation}>
            <RotateCcw size={12} /> New chat
          </button>
        </div> */}

        <div className="ai-body">
          {/* Suggestion pills */}
          {showSuggestions && (
            <div className="suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="sug-pill" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Chat window */}
          <div className="chat-wrap">
            <div className="chat-messages">
              {messages.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Sparkles size={22} />
                  </div>
                  <h3>Ready to help you save</h3>
                  <p>Ask me about deals, recipes, price comparisons, or build a shopping list on a budget.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.role}`}>
                  {msg.role !== 'error' && (
                    <div className={`avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                      {msg.role === 'user' ? 'Me' : 'AI'}
                    </div>
                  )}
                  <div className={`bubble ${msg.role}`}>{msg.text}</div>
                </div>
              ))}

              {loading && (
                <div className="msg-row ai">
                  <div className="avatar ai">AI</div>
                  <div className="bubble ai">
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="input-area">
              <div className="input-wrap">
                <textarea
                  ref={textareaRef}
                  value={input}
                  rows={1}
                  placeholder="Ask about products, prices, recipes..."
                  onChange={e => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKey}
                />
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  <ArrowUp size={15} color="#fff" />
                </button>
              </div>
              <div className="input-hint">Enter to send · Shift+Enter for new line</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}