import { useState, useEffect, useRef } from 'react';
import { sendCommand, getLatestResult, getStatus } from './api';
import {
  Home, Bot, FolderOpen, ScrollText, Camera, Lock, Globe, Monitor,
  MessageSquare, Music, VolumeX, Activity, Send, Play, ChevronRight,
  Wifi, WifiOff, Loader2, Terminal, ArrowUp, Power, Image,
  FolderClosed, FileText, Search, Cpu, HardDrive
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState({ online: false, lastSeen: null });
  const [cmd, setCmd] = useState('');
  const [folderPath, setFolderPath] = useState('C:\\');
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const lastResultId = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await getStatus();
        setStatus(s);
        const r = await getLatestResult();
        if (r && r.commandId !== lastResultId.current) {
          lastResultId.current = r.commandId;
          setResult(r);
          setLog(prev => [...prev, { id: r.commandId, output: r.output, time: new Date(r.receivedAt).toLocaleTimeString(), hasScreenshot: !!r.screenshot, screenshot: r.screenshot }]);
          setMessages(prev => [...prev, {
            role: 'bot',
            text: r.output,
            screenshot: r.screenshot || null,
            time: new Date(r.receivedAt).toLocaleTimeString(),
          }]);
          setLoading(false);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const send = async (type, payload) => {
    setLoading(true);
    const label = type === 'screenshot' ? 'Take Screenshot'
      : type === 'lock' ? 'Lock PC'
      : type === 'list_files' ? `List files in ${payload}`
      : type === 'open_app' ? `Open ${payload}`
      : payload || type;
    setMessages(prev => [...prev, { role: 'user', text: label, time: new Date().toLocaleTimeString() }]);
    await sendCommand(type, payload);
  };

  const handleSubmit = (e, type = 'shell') => {
    e.preventDefault();
    if (!cmd.trim()) return;
    send(type, cmd);
    setCmd('');
  };

  const timeAgo = (ts) => {
    if (!ts) return 'Never';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return 'Just now';
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-lg mx-auto" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Monitor size={20} className="text-zinc-300" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${status.online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-none">My PC</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {status.online ? 'Connected' : 'Disconnected'} · {timeAgo(status.lastSeen)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={16} className="text-zinc-400 animate-spin" />}
            {status.online ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-zinc-600" />}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[72px]">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="px-5 py-4 space-y-5">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-11">
              <Terminal size={15} className="text-zinc-500 shrink-0" />
              <input
                value={cmd}
                onChange={e => setCmd(e.target.value)}
                placeholder="Run a command..."
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-zinc-600"
              />
              <button type="submit" className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white text-black hover:bg-zinc-200 active:scale-90 transition-all">
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </form>

            <section>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Camera, label: 'Screenshot', bg: 'bg-violet-500/10', iconColor: 'text-violet-400', action: () => send('screenshot') },
                  { icon: Lock, label: 'Lock', bg: 'bg-red-500/10', iconColor: 'text-red-400', action: () => send('lock') },
                  { icon: Globe, label: 'Chrome', bg: 'bg-blue-500/10', iconColor: 'text-blue-400', action: () => send('open_app', 'chrome') },
                  { icon: FolderOpen, label: 'Files', bg: 'bg-amber-500/10', iconColor: 'text-amber-400', action: () => setActiveTab('files') },
                  { icon: MessageSquare, label: 'Teams', bg: 'bg-indigo-500/10', iconColor: 'text-indigo-400', action: () => send('open_app', 'teams') },
                  { icon: Music, label: 'Spotify', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', action: () => send('open_app', 'spotify') },
                  { icon: VolumeX, label: 'Mute', bg: 'bg-zinc-500/10', iconColor: 'text-zinc-400', action: () => send('shell', 'powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"') },
                  { icon: Activity, label: 'Tasks', bg: 'bg-orange-500/10', iconColor: 'text-orange-400', action: () => send('shell', 'start taskmgr') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 py-3 rounded-xl active:scale-95 transition-transform">
                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <item.icon size={20} className={item.iconColor} />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">System</p>
              <div className="space-y-1.5">
                {[
                  { icon: Cpu, label: 'System Info', desc: 'View hardware details', action: () => send('shell', 'systeminfo | findstr /C:"OS Name" /C:"Total Physical Memory" /C:"System Model"') },
                  { icon: HardDrive, label: 'Disk Space', desc: 'Check storage usage', action: () => send('shell', 'wmic logicaldisk get size,freespace,caption') },
                  { icon: Wifi, label: 'Network', desc: 'Show IP configuration', action: () => send('shell', 'ipconfig') },
                  { icon: Power, label: 'Shutdown (60s)', desc: 'Shutdown with 60s delay', action: () => send('shell', 'shutdown /s /t 60') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 active:scale-[0.98] transition-all text-left">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-tight">{item.label}</p>
                      <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-700 ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* AI TAB — Real Chat */}
        {activeTab === 'ai' && (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 56px - 72px)' }}>
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
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.2s_ease]`}>
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
                          {msg.text}
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

            {/* Chat input */}
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
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-10">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                  value={folderPath}
                  onChange={e => setFolderPath(e.target.value)}
                  placeholder="Enter path..."
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-zinc-600"
                />
              </div>
              <button
                onClick={() => send('list_files', folderPath)}
                className="h-10 px-4 bg-white text-black rounded-xl text-[12px] font-semibold hover:bg-zinc-200 active:scale-95 transition-all"
              >
                Open
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {['C:\\', 'C:\\Users', 'D:\\', 'C:\\Program Files', 'C:\\Windows'].map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setFolderPath(p); send('list_files', p); }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${folderPath === p ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {result?.output && Array.isArray(tryParse(result.output)) && (
              <div className="space-y-0.5">
                {tryParse(result.output).map((f, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (f.type === 'dir') {
                        const np = folderPath.endsWith('\\') ? folderPath + f.name : folderPath + '\\' + f.name;
                        setFolderPath(np);
                        send('list_files', np);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900/80 active:scale-[0.98] transition-all text-left"
                  >
                    {f.type === 'dir'
                      ? <FolderClosed size={18} className="text-amber-400 shrink-0" />
                      : <FileText size={18} className="text-zinc-500 shrink-0" />
                    }
                    <span className={`text-[13px] truncate ${f.type === 'dir' ? 'font-medium text-zinc-200' : 'text-zinc-500'}`}>{f.name}</span>
                    {f.type === 'dir' && <ChevronRight size={14} className="text-zinc-700 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {(!result?.output || !Array.isArray(tryParse(result.output))) && (
              <div className="text-center py-16">
                <FolderOpen size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">Enter a path and tap Open</p>
              </div>
            )}
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === 'log' && (
          <div className="px-5 py-4">
            {log.length === 0 ? (
              <div className="text-center py-16">
                <ScrollText size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...log].reverse().map((entry) => (
                  <div key={entry.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-zinc-600 font-mono">{entry.time}</span>
                      {entry.hasScreenshot && (
                        <span className="flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/10 rounded-md px-1.5 py-0.5">
                          <Image size={9} /> Screenshot
                        </span>
                      )}
                    </div>
                    {entry.screenshot && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img src={`data:image/png;base64,${entry.screenshot}`} alt="Screenshot" className="w-full block" />
                      </div>
                    )}
                    <p className="text-[11px] text-zinc-400 whitespace-pre-wrap break-words leading-4">{entry.output}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto bg-black/90 backdrop-blur-2xl border-t border-zinc-800/60">
        <div className="flex justify-around px-4 h-[68px] items-center">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'ai', icon: Bot, label: 'AI' },
            { id: 'files', icon: FolderOpen, label: 'Files' },
            { id: 'log', icon: ScrollText, label: 'Log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 w-16 py-1 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-zinc-600'}`}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}
