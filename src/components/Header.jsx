import { Monitor, Wifi, WifiOff, Loader2, Zap } from 'lucide-react';

export default function Header({ status, loading, timeAgo }) {
  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-2xl border-b border-zinc-800/40">
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/15 flex items-center justify-center">
              <Zap size={17} className="text-violet-400" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${status.online ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-none tracking-tight">KAKAROT</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {status.online ? (
                <span className="text-emerald-400">Online</span>
              ) : (
                <span className="text-zinc-500">Offline</span>
              )} · {timeAgo(status.lastSeen)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {loading && <Loader2 size={15} className="text-violet-400 animate-spin" />}
          {status.online ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
              <Wifi size={13} className="text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/50 rounded-lg px-2 py-1">
              <WifiOff size={13} className="text-zinc-500" />
              <span className="text-[10px] font-medium text-zinc-500">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
