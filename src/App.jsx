import { useState, useEffect, useRef } from 'react';
import { sendCommand, getLatestResult, getStatus } from './api';

export default function App() {
  const [status, setStatus] = useState({ online: false, lastSeen: null });
  const [cmd, setCmd] = useState('');
  const [folderPath, setFolderPath] = useState('C:\\');
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const lastResultId = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await getStatus();
        setStatus(s);
        const r = await getLatestResult();
        if (r && r.commandId !== lastResultId.current) {
          lastResultId.current = r.commandId;
          setResult(r);
          setLog(prev => [...prev, { id: r.commandId, output: r.output, time: new Date(r.receivedAt).toLocaleTimeString(), hasScreenshot: !!r.screenshot }]);
          setLoading(false);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const send = async (type, payload) => {
    setLoading(true);
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

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'ai', icon: '🤖', label: 'AI' },
    { id: 'files', icon: '📁', label: 'Files' },
    { id: 'log', icon: '📋', label: 'Log' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col max-w-lg mx-auto relative" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Status Bar */}
      <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">PC</div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">PC Control</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${status.online ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-red-400'}`} />
                <span className="text-[10px] text-gray-400">{status.online ? 'Online' : 'Offline'} · {timeAgo(status.lastSeen)}</span>
              </div>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] text-blue-400 font-medium">Processing</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Command Input */}
            <form onSubmit={handleSubmit} className="relative">
              <input
                value={cmd}
                onChange={e => setCmd(e.target.value)}
                placeholder="Type a command..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-20 py-3.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-600"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all">Run</button>
              </div>
            </form>

            {/* Quick Actions Grid */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 px-1">Quick Actions</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: '📸', label: 'Screen', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20', action: () => send('screenshot') },
                  { icon: '🔒', label: 'Lock', color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/20', action: () => send('lock') },
                  { icon: '🌐', label: 'Chrome', color: 'from-green-500/20 to-green-600/10', border: 'border-green-500/20', action: () => send('open_app', 'chrome') },
                  { icon: '📁', label: 'Files', color: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/20', action: () => setActiveTab('files') },
                  { icon: '💬', label: 'Teams', color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20', action: () => send('open_app', 'teams') },
                  { icon: '🎵', label: 'Spotify', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', action: () => send('open_app', 'spotify') },
                  { icon: '🔇', label: 'Mute', color: 'from-gray-500/20 to-gray-600/10', border: 'border-gray-500/20', action: () => send('shell', 'powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"') },
                  { icon: '⚡', label: 'Task Mgr', color: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20', action: () => send('shell', 'start taskmgr') },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-gradient-to-b ${item.color} border ${item.border} active:scale-95 transition-all`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[10px] font-medium text-gray-300">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Screenshot Preview */}
            {result?.screenshot && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 px-1">Latest Screenshot</p>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <img src={`data:image/png;base64,${result.screenshot}`} alt="Screenshot" className="w-full" />
                </div>
              </div>
            )}

            {/* Latest Result */}
            {result?.output && !result?.screenshot && !Array.isArray(tryParse(result.output)) && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2 px-1">Latest Result</p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{result.output}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div className="p-4 space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-3">
                <span className="text-3xl">🤖</span>
              </div>
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-xs text-gray-500 mt-1">Ask anything or tell me to do something on your PC</p>
            </div>

            <form onSubmit={(e) => handleSubmit(e, 'ai')} className="relative">
              <textarea
                value={cmd}
                onChange={e => setCmd(e.target.value)}
                placeholder="e.g. Open Chrome and go to YouTube, send email to john@mail.com, what's the weather..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-600 resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e, 'ai'); } }}
              />
              <button type="submit" className="absolute right-2 bottom-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 active:scale-95 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all">
                Send
              </button>
            </form>

            {/* AI Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {['Open Chrome', 'Take screenshot', 'Show my IP', 'Open YouTube', 'Lock PC', 'System info'].map((s, i) => (
                <button
                  key={i}
                  onClick={() => send('ai', s)}
                  className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-gray-400 hover:text-white hover:border-indigo-500/30 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* AI Response */}
            {result?.output && !result?.screenshot && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">🤖</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">AI Response</span>
                </div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">{result.output}</pre>
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <input
                value={folderPath}
                onChange={e => setFolderPath(e.target.value)}
                placeholder="Enter folder path..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-600"
              />
              <button
                onClick={() => send('list_files', folderPath)}
                className="bg-yellow-500/20 border border-yellow-500/20 hover:bg-yellow-500/30 active:scale-95 px-4 rounded-2xl text-yellow-400 text-sm font-semibold transition-all"
              >
                Go
              </button>
            </div>

            {/* Quick paths */}
            <div className="flex flex-wrap gap-1.5">
              {['C:\\', 'C:\\Users', 'D:\\', 'C:\\Program Files'].map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setFolderPath(p); send('list_files', p); }}
                  className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-gray-400 hover:text-white hover:border-yellow-500/30 active:scale-95 transition-all"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* File list */}
            {result?.output && Array.isArray(tryParse(result.output)) && (
              <div className="space-y-1">
                {tryParse(result.output).map((f, i) => (
                  <button
                    key={i}
                    onClick={() => { if (f.type === 'dir') { const newPath = folderPath.endsWith('\\') ? folderPath + f.name : folderPath + '\\' + f.name; setFolderPath(newPath); send('list_files', newPath); } }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${f.type === 'dir' ? 'bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 active:scale-[0.98]' : 'bg-white/[0.02] border border-white/5'}`}
                  >
                    <span className="text-lg">{f.type === 'dir' ? '📁' : '📄'}</span>
                    <span className={`text-xs font-medium truncate ${f.type === 'dir' ? 'text-yellow-300' : 'text-gray-400'}`}>{f.name}</span>
                    {f.type === 'dir' && <span className="ml-auto text-gray-600 text-xs">›</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === 'log' && (
          <div className="p-4 space-y-2">
            {log.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">📋</span>
                <p className="text-sm text-gray-500">No commands executed yet</p>
              </div>
            )}
            {[...log].reverse().map((entry, i) => (
              <div key={entry.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-500 font-mono">{entry.time}</span>
                  {entry.hasScreenshot && <span className="text-[10px] bg-purple-500/20 text-purple-300 rounded-full px-2 py-0.5">📸 Screenshot</span>}
                </div>
                <pre className="text-[11px] text-gray-400 whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">{entry.output}</pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 max-w-lg mx-auto">
        <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 px-6 py-2 flex justify-around">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}
            >
              <span className={`text-lg transition-all ${activeTab === tab.id ? 'scale-110' : ''}`}>{tab.icon}</span>
              <span className={`text-[9px] font-semibold tracking-wide ${activeTab === tab.id ? 'text-blue-400' : ''}`}>{tab.label}</span>
              {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}
