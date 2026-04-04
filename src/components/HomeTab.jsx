import { useState } from 'react';
import {
  Camera, Lock, Globe, FolderOpen, MessageSquare, Music, VolumeX,
  Activity, Terminal, ArrowUp, ChevronRight, Cpu, HardDrive, Wifi, Power, ChevronDown
} from 'lucide-react';

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

export default function HomeTab({ cmd, setCmd, result, send, handleSubmit, setActiveTab }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="px-5 py-4 space-y-5">
      {/* Command bar */}
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

      {/* Quick actions */}
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

      {/* System shortcuts */}
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

      {/* Screenshot result */}
      {result?.screenshot && (
        <section>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Screenshot</p>
          <div className="rounded-2xl overflow-hidden border border-zinc-800">
            <img src={`data:image/png;base64,${result.screenshot}`} alt="Screenshot" className="w-full block" />
          </div>
        </section>
      )}

      {/* Text output result */}
      {result?.output && !result?.screenshot && !Array.isArray(tryParse(result.output)) && (() => {
        const lines = result.output.split('\n');
        const truncated = lines.length > 5 && !expanded;
        const display = truncated ? lines.slice(0, 5).join('\n') + '\n...' : result.output;
        return (
          <section>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Output</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-[12px] text-zinc-300 whitespace-pre-wrap break-words font-mono leading-5">{display}</p>
              {lines.length > 5 && (
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Show less' : `Show all ${lines.length} lines`}
                </button>
              )}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
