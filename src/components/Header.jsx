import { Monitor, Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function Header({ status, loading, timeAgo }) {
  return (
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
  );
}
