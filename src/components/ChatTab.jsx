import { useRef, useEffect, useState } from 'react';
import { Bot, Camera, Globe, Search, Lock, Cpu, Play, ArrowUp, ChevronDown } from 'lucide-react';

function TruncatedText({ text, className }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split('\n');
  if (lines.length <= 5 || expanded) {
    return (
      <span>
        {text}
        {lines.length > 5 && (
          <button onClick={() => setExpanded(false)} className="block mt-1 text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
            <ChevronDown size={11} className="rotate-180" /> Show less
          </button>
        )}
      </span>
    );
  }
  return (
    <span>
      {lines.slice(0, 5).join('\n')}
      <button onClick={() => setExpanded(true)} className="block mt-1 text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
        <ChevronDown size={11} /> ...{lines.length - 5} more lines
      </button>
    </span>
  );
}

export default function ChatTab({ cmd, setCmd, messages, loading, send, handleSubmit }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px - 72px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Bot size={26} className="text-zinc-500" />
            </div>
            <p className="text-[13px] text-zinc-500 text-center max-w-[220px]">
              Send a message to control your PC or ask anything
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {[
                { icon: Camera, text: 'Take screenshot' },
                { icon: Globe, text: 'Open Chrome' },
                { icon: Search, text: 'Search Google' },
                { icon: Lock, text: 'Lock PC' },
                { icon: Cpu, text: 'System info' },
                { icon: Play, text: 'Play music' },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => send('ai', s.text)}
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 active:scale-95 transition-all"
                >
                  <s.icon size={11} />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'bot' ? 'flex gap-2.5 items-start' : ''}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-zinc-400" />
                </div>
              )}
              <div className="space-y-1">
                <div className={`rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-white text-black rounded-tr-sm px-3.5 py-2.5'
                    : 'bg-zinc-900 border border-zinc-800 rounded-tl-sm'
                }`}>
                  {msg.screenshot && (
                    <div className={`overflow-hidden ${msg.role === 'bot' ? 'rounded-t-2xl rounded-tl-sm' : 'rounded-t-2xl rounded-tr-sm'}`}>
                      <img src={`data:image/png;base64,${msg.screenshot}`} alt="Screenshot" className="w-full block" />
                    </div>
                  )}
                  <p className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user' ? '' : 'px-3.5 py-2.5 text-zinc-300'
                  } ${msg.screenshot && msg.role === 'bot' ? 'border-t border-zinc-800' : ''}`}>
                    {msg.role === 'bot' ? <TruncatedText text={msg.text} /> : msg.text}
                  </p>
                </div>
                <p className={`text-[10px] text-zinc-600 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-zinc-400" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/60 bg-black px-4 py-3">
        <form onSubmit={(e) => handleSubmit(e, 'ai')} className="flex items-end gap-2">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 focus-within:border-zinc-700 transition-colors">
            <textarea
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              placeholder="Message..."
              rows={1}
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-zinc-600 resize-none leading-5"
              style={{ maxHeight: '80px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e, 'ai'); } }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
            />
          </div>
          <button
            type="submit"
            disabled={!cmd.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 active:scale-90 transition-all disabled:opacity-30"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
