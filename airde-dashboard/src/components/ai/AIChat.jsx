import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, User, Trash2, X, AlertTriangle, Send } from 'lucide-react';
import { aiSuggestions } from '../../data/dashboardData';

/* ─── Avatars ─────────────────────────────────────────────────── */
const BOT_AVATAR = (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20">
    <Bot size={15} className="text-white" strokeWidth={1.75} />
  </div>
);
const USER_AVATAR = (
  <div className="w-7 h-7 rounded-full bg-[#1e2d4f] border border-[#2d3f6b] flex items-center justify-center flex-shrink-0">
    <User size={14} className="text-slate-300" strokeWidth={1.75} />
  </div>
);

/* ─── Bubble ───────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.from === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {isUser ? USER_AVATAR : BOT_AVATAR}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <span className="text-[10px] text-orange-400 font-semibold px-1">AIRDE AI</span>
        )}
        <div className={`
          px-3 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap break-words shadow-sm
          ${isUser
            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-[#162040] text-slate-200 border border-[#1e2d4f] rounded-2xl rounded-bl-sm'
          }
        `}>
          {msg.text}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-3.5 bg-orange-400 ml-0.5 animate-pulse rounded-sm align-middle" />
          )}
        </div>
        {msg.link && (
          <Link
            to={msg.link.to}
            className="text-[11px] text-orange-400 hover:text-orange-300 hover:underline px-1 flex items-center gap-1"
          >
            {msg.link.label} →
          </Link>
        )}
        <span className="text-[10px] text-slate-600 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

/* ─── Typing indicator ─────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      {BOT_AVATAR}
      <div className="flex flex-col gap-1 items-start">
        <span className="text-[10px] text-orange-400 font-semibold px-1">AIRDE AI</span>
        <div className="bg-[#162040] border border-[#1e2d4f] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component (controlled) ─────────────────────────────── */
/**
 * Props (semua wajib kecuali onClose / showClose):
 *   messages    – array dari useChat()
 *   isLoading   – boolean dari useChat()
 *   error       – string | null dari useChat()
 *   onSend      – fn(text) dari useChat().sendMessage
 *   onClear     – fn() dari useChat().clearChat
 *   onClose     – fn() opsional (tombol ✕ di side panel)
 *   showClose   – boolean, tampilkan tombol ✕
 */
export default function AIChat({
  messages,
  isLoading,
  error,
  onSend,
  onAskData,
  onClear,
  onClose,
  showClose = false,
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll ke bawah tiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fokus input setelah loading selesai
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleSend = (text) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput('');
    onSend(msg);
  };

  const handleSuggestion = (text) => {
    if (isLoading) return;
    (onAskData || onSend)(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1628]">

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Bot size={17} className="text-white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">AIRDE AI Assistant</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400">
                {isLoading ? 'Sedang menjawab...' : 'Online · Groq API'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-[#162040]"
            title="Bersihkan chat"
          >
            <Trash2 size={13} /> Clear
          </button>
          {showClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 hover:bg-[#162040] w-7 h-7 flex items-center justify-center rounded-md transition-colors"
              title="Tutup"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id ?? i} msg={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.text === '' && (
          <TypingIndicator />
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-400">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium mb-0.5">Gagal mendapatkan respons</div>
              <div className="text-red-400/80">{error}</div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips ── */}
      <div className="px-4 pt-3 flex gap-2 flex-wrap flex-shrink-0">
        {aiSuggestions.slice(0, 4).map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestion(s)}
            disabled={isLoading}
            className="text-[10px] bg-[#111d35] hover:bg-[#162040] disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-orange-400 border border-[#1e2d4f] hover:border-orange-500/40 px-3 py-1.5 rounded-full transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Input bar ── */}
      <div className="px-4 py-3.5 border-t border-[#1e2d4f] flex-shrink-0 mt-3">
        <div className={`
          flex items-end gap-2 bg-[#111d35] border rounded-2xl px-3 py-2 transition-colors
          ${isLoading ? 'border-[#1e2d4f]' : 'border-[#1e2d4f] focus-within:border-orange-500/50'}
        `}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan Anda... (Enter untuk kirim)"
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-[12px] text-slate-300 placeholder-slate-600 outline-none resize-none max-h-24 scrollbar-thin disabled:opacity-50"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-md shadow-orange-500/20"
            title="Kirim"
          >
            {isLoading ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} className="translate-x-0.5" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-slate-600 text-center mt-1.5">
          Powered by Groq · {import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'}
        </p>
      </div>
    </div>
  );
}
