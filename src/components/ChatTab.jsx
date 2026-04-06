import { useRef, useEffect, useState } from 'react';
import {
  Bot, Camera, Globe, Lock, Cpu, Play, ArrowUp, ChevronDown, Mic, MicOff,
  Plus, Mail, Monitor, Volume2, FolderOpen, Terminal, MessageSquare,
  Sparkles, Code2, Copy, Check, Zap, FileCode, Laptop, Palette,
  RotateCcw, Pencil, Trash2, ClipboardCopy
} from 'lucide-react';

const BUILT_IN_PROMPTS = [
  { icon: Sparkles, label: 'What can you do?', prompt: 'What are all the things you can do? Show me your full capabilities', color: 'text-violet-400', bg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/10' },
  { icon: Camera, label: 'Screenshot', prompt: 'Take a screenshot of my screen', color: 'text-sky-400', bg: 'bg-gradient-to-br from-sky-500/20 to-blue-500/10' },
  { icon: Globe, label: 'Open Website', prompt: 'Open Chrome and go to ', color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10' },
  { icon: Mail, label: 'Send Email', prompt: 'Send an email to ', color: 'text-rose-400', bg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/10' },
  { icon: FileCode, label: 'Create Project', prompt: 'Create a new project: ', color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10' },
  { icon: Code2, label: 'Write Code', prompt: 'Write a script that ', color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10' },
  { icon: Play, label: 'Play YouTube', prompt: 'Play on YouTube: ', color: 'text-red-400', bg: 'bg-gradient-to-br from-red-500/20 to-rose-500/10' },
  { icon: Laptop, label: 'System Info', prompt: 'Show me my system info, RAM, CPU, and OS details', color: 'text-cyan-400', bg: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/10' },
  { icon: FolderOpen, label: 'Browse Files', prompt: 'Show me what\'s on my Desktop', color: 'text-orange-400', bg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/10' },
  { icon: Terminal, label: 'Run Command', prompt: 'Run this command: ', color: 'text-green-400', bg: 'bg-gradient-to-br from-green-500/20 to-emerald-500/10' },
  { icon: Lock, label: 'Lock PC', prompt: 'Lock my PC', color: 'text-red-400', bg: 'bg-gradient-to-br from-red-500/20 to-orange-500/10' },
  { icon: Palette, label: 'Build UI', prompt: 'Create an HTML page with ', color: 'text-pink-400', bg: 'bg-gradient-to-br from-pink-500/20 to-fuchsia-500/10' },
];

// Render bot text with code blocks, bold, and inline code
function FormattedText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!text) return null;

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  let codeBlockIdx = 0;

  const rendered = parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const idx = codeBlockIdx++;
      const inner = part.slice(3, -3);
      const langMatch = inner.match(/^(\w+)\n/);
      const lang = langMatch ? langMatch[1] : '';
      const code = langMatch ? inner.slice(langMatch[0].length) : inner;
      return (
        <div key={i} className="my-2 rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-950">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/80 border-b border-zinc-700/50">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{lang || 'code'}</span>
            <button onClick={() => copyCode(code, idx)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
              {copiedIdx === idx ? <><Check size={10} className="text-emerald-400" /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>
          <pre className="px-3 py-2.5 overflow-x-auto"><code className="text-[11.5px] leading-5 text-emerald-300/90 font-mono">{code}</code></pre>
        </div>
      );
    }

    // Inline formatting: **bold**, `code`, ✓/✗/❌ highlights
    const formatInline = (str) => {
      return str.split(/(\*\*.*?\*\*|`[^`]+`|✓[^\n]*|✗[^\n]*|❌[^\n]*)/g).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) {
          return <strong key={j} className="font-semibold text-zinc-100">{seg.slice(2, -2)}</strong>;
        }
        if (seg.startsWith('`') && seg.endsWith('`')) {
          return <code key={j} className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[11.5px] font-mono text-amber-300/80">{seg.slice(1, -1)}</code>;
        }
        if (seg.startsWith('✓')) {
          return <span key={j} className="text-emerald-400">{seg}</span>;
        }
        if (seg.startsWith('✗') || seg.startsWith('❌')) {
          return <span key={j} className="text-red-400">{seg}</span>;
        }
        return seg;
      });
    };

    return <span key={i}>{formatInline(part)}</span>;
  });

  // Collapsible for long messages
  const lines = text.split('\n');
  const isLong = lines.length > 12;

  if (isLong && !expanded) {
    const truncated = lines.slice(0, 10).join('\n');
    const truncParts = truncated.split(/(```[\s\S]*?```)/g);
    return (
      <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
        {truncParts.map((part, i) => {
          if (part.startsWith('```')) {
            const inner = part.slice(3, -3);
            const langMatch = inner.match(/^(\w+)\n/);
            const code = langMatch ? inner.slice(langMatch[0].length) : inner;
            return <pre key={i} className="my-2 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/50"><code className="text-[11.5px] text-emerald-300/90 font-mono">{code}</code></pre>;
          }
          return <span key={i}>{part}</span>;
        })}
        <button onClick={() => setExpanded(true)} className="flex items-center gap-1 mt-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
          <ChevronDown size={12} /> Show {lines.length - 10} more lines
        </button>
      </div>
    );
  }

  return (
    <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
      {rendered}
      {isLong && expanded && (
        <button onClick={() => setExpanded(false)} className="flex items-center gap-1 mt-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
          <ChevronDown size={12} className="rotate-180" /> Show less
        </button>
      )}
    </div>
  );
}

export default function ChatTab({ cmd, setCmd, messages, setMessages, loading, setLoading, send, handleSubmit }) {
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  const retryMessage = (idx) => {
    // Find the user message at or before idx to resend
    let userMsg = null;
    for (let i = idx; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsg = messages[i];
        break;
      }
    }
    if (userMsg) {
      // Remove the bot response at idx (and the user msg if retrying from bot)
      const newMessages = messages.filter((_, i) => i !== idx);
      setMessages(newMessages);
      send('ai', userMsg.text);
    }
  };

  const editAndResend = (idx) => {
    if (!editText.trim()) return;
    // Remove this message and all after it
    const newMessages = messages.slice(0, idx);
    setMessages(newMessages);
    send('ai', editText.trim());
    setEditingIdx(null);
    setEditText('');
  };

  const startEditing = (idx) => {
    setEditingIdx(idx);
    setEditText(messages[idx].text);
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const deleteMessage = (idx) => {
    setMessages(prev => prev.filter((_, i) => i !== idx));
  };

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

  // Auto-focus input
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800/40 bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[12px] text-zinc-400 font-medium">{messages.filter(m => m.role === 'user').length} messages</p>
          </div>
          <button
            onClick={() => { setMessages([]); setLoading(false); }}
            className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-700/50 active:scale-95 transition-all"
          >
            <Plus size={11} />
            New Chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 pt-6 pb-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
                  <Zap size={28} className="text-violet-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-[16px] font-bold tracking-tight">IGRIS</h2>
                <p className="text-[12px] text-zinc-500 mt-1 max-w-[280px] leading-relaxed">
                  Your AI assistant with full PC control. I can open apps, write code, create projects, manage files, send emails, and more.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">Try asking</p>
              <div className="grid grid-cols-2 gap-2">
                {BUILT_IN_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (p.prompt.endsWith(' ')) setCmd(p.prompt);
                      else send('ai', p.prompt);
                    }}
                    className={`group flex items-start gap-2.5 ${p.bg} border border-zinc-800/50 rounded-xl px-3 py-3 text-left hover:border-zinc-600/50 active:scale-[0.97] transition-all`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center shrink-0 mt-0.5">
                      <p.icon size={15} className={p.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium leading-tight text-zinc-200">{p.label}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.prompt}{p.prompt.endsWith(' ') ? '...' : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} msg-appear group/msg`}>
            <div className={`max-w-[88%] ${msg.role === 'bot' ? 'flex gap-2.5 items-start' : ''}`}>
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={13} className="text-violet-400" />
                </div>
              )}
              <div className="space-y-1.5">
                {/* Editing mode for user messages */}
                {editingIdx === i && msg.role === 'user' ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="w-full bg-zinc-900 border border-violet-500/40 rounded-xl px-3 py-2 text-[13px] text-white outline-none resize-none"
                      rows={3}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editAndResend(i); } }}
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => { setEditingIdx(null); setEditText(''); }} className="text-[11px] px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all">Cancel</button>
                      <button onClick={() => editAndResend(i)} className="text-[11px] px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-all">Resend</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm px-4 py-2.5 shadow-lg shadow-violet-500/10'
                        : 'bg-zinc-900/80 border border-zinc-800/60 rounded-tl-sm'
                    }`}>
                      {msg.screenshot && (
                        <div className={`overflow-hidden ${msg.role === 'bot' ? 'rounded-t-2xl rounded-tl-sm' : 'rounded-t-2xl rounded-tr-sm'}`}>
                          <img src={`data:image/png;base64,${msg.screenshot}`} alt="Screenshot" className="w-full block" />
                        </div>
                      )}
                      <div className={
                        msg.role === 'user'
                          ? 'text-[13px] leading-relaxed'
                          : `px-3.5 py-3 text-zinc-300 ${msg.screenshot ? 'border-t border-zinc-800/60' : ''}`
                      }>
                        {msg.role === 'bot' ? <FormattedText text={msg.text} /> : <span className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</span>}
                      </div>
                    </div>

                    {/* Action buttons — visible on hover */}
                    <div className={`flex items-center gap-0.5 px-1 ${msg.role === 'user' ? 'justify-end' : ''} opacity-0 group-hover/msg:opacity-100 transition-opacity`}>
                      {/* Copy */}
                      <button
                        onClick={() => copyMessage(msg.text, i)}
                        className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
                        title="Copy message"
                      >
                        {copiedMsgIdx === i ? <Check size={12} className="text-emerald-400" /> : <ClipboardCopy size={12} />}
                      </button>

                      {/* Edit (user messages only) */}
                      {msg.role === 'user' && (
                        <button
                          onClick={() => startEditing(i)}
                          className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
                          title="Edit & resend"
                        >
                          <Pencil size={12} />
                        </button>
                      )}

                      {/* Retry (bot messages only) */}
                      {msg.role === 'bot' && (
                        <button
                          onClick={() => retryMessage(i)}
                          className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
                          title="Retry"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteMessage(i)}
                        className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-800/60 transition-all"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Suggestion chips */}
                    {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-1 px-0.5">
                        {msg.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => send('ai', s)}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 active:scale-95 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <p className={`text-[10px] text-zinc-600 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start msg-appear">
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center shrink-0">
                <Zap size={13} className="text-violet-400 animate-pulse" />
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] text-zinc-600 ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800/40 bg-zinc-950/80 backdrop-blur-sm px-4 py-3">
        <form onSubmit={(e) => handleSubmit(e, 'ai')} className="flex items-end gap-2">
          <div className="flex-1 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/30 focus-within:bg-zinc-900 transition-all">
            <textarea
              ref={textareaRef}
              value={cmd}
              onChange={e => setCmd(e.target.value)}
              placeholder="Ask me anything..."
              rows={1}
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-zinc-600 resize-none leading-5"
              style={{ maxHeight: '100px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e, 'ai'); } }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
            />
          </div>
          <button
            type="button"
            onClick={toggleVoice}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all ${
              listening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
          <button
            type="submit"
            disabled={!cmd.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-center hover:from-violet-500 hover:to-blue-500 active:scale-90 transition-all disabled:opacity-20 disabled:from-zinc-700 disabled:to-zinc-700 shadow-lg shadow-violet-500/20"
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
