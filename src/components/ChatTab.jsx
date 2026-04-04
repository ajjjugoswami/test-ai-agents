import { useRef, useEffect, useState } from 'react';
import { Bot, Camera, Globe, Search, Lock, Cpu, Play, ArrowUp, ChevronDown, Mic, MicOff, Plus, Mail, Monitor, Volume2, FolderOpen, Terminal, MessageSquare } from 'lucide-react';

const BUILT_IN_PROMPTS = [
  { icon: Camera, label: 'Screenshot', prompt: 'Take a screenshot of my screen', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Globe, label: 'Open Website', prompt: 'Open Chrome and go to google.com', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Mail, label: 'Send Email', prompt: 'Send an email to ', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Mail, label: 'Draft Email', prompt: 'Draft a professional email to ', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Monitor, label: 'System Info', prompt: 'Show me my system info, RAM, CPU, and OS details', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Lock, label: 'Lock PC', prompt: 'Lock my PC', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Volume2, label: 'Mute/Unmute', prompt: 'Mute my PC volume', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Play, label: 'Play YouTube', prompt: 'Search and play a video on YouTube about ', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: FolderOpen, label: 'List Files', prompt: 'List all files on my Desktop', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Terminal, label: 'Run Command', prompt: 'Run this command: ', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MessageSquare, label: 'Open Teams', prompt: 'Open Microsoft Teams', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Cpu, label: 'Disk Space', prompt: 'Show me disk space usage on all drives', color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

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

export default function ChatTab({ cmd, setCmd, messages, setMessages, loading, setLoading, send, handleSubmit }) {
  const chatEndRef = useRef(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    let finalTranscript = '';
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setCmd(finalTranscript + interim);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px - 72px)' }}>
      {/* Top bar with New Chat */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
          <p className="text-[12px] text-zinc-500">{messages.filter(m => m.role === 'user').length} messages</p>
          <button
            onClick={() => { setMessages([]); setLoading(false); }}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:border-zinc-600 active:scale-95 transition-all"
          >
            <Plus size={12} />
            New Chat
          </button>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 pt-4 pb-2">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Bot size={26} className="text-zinc-500" />
              </div>
              <p className="text-[14px] font-semibold">Hey, I'm JARVIS</p>
              <p className="text-[12px] text-zinc-500 text-center max-w-[260px]">
                I remember our conversations and learn your preferences. What can I do for you?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BUILT_IN_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (p.prompt.endsWith(' ')) {
                      setCmd(p.prompt);
                    } else {
                      send('ai', p.prompt);
                    }
                  }}
                  className="flex items-start gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-left hover:bg-zinc-800/70 hover:border-zinc-700 active:scale-[0.97] transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <p.icon size={15} className={p.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-tight">{p.label}</p>
                    <p className="text-[10px] text-zinc-600 leading-tight mt-0.5 line-clamp-2">{p.prompt}{p.prompt.endsWith(' ') ? '...' : ''}</p>
                  </div>
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
                {/* Suggestion chips */}
                {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                    {msg.suggestions.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => send('ai', s)}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
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
              className="w-full bg-transparent text-[16px] outline-none placeholder:text-zinc-600 resize-none leading-5"
              style={{ maxHeight: '80px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e, 'ai'); } }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
            />
          </div>
          <button
            type="button"
            onClick={toggleVoice}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
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
