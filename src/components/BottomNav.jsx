import { Home, Zap, FolderOpen, Link2, ScrollText } from 'lucide-react';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'ai', icon: Zap, label: 'AI Chat' },
  { id: 'files', icon: FolderOpen, label: 'Files' },
  { id: 'connect', icon: Link2, label: 'Connect' },
  { id: 'log', icon: ScrollText, label: 'Log' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto bg-black/95 backdrop-blur-2xl border-t border-zinc-800/40">
      <div className="flex justify-around px-4 h-[68px] items-center">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 w-16 py-1.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'text-violet-400'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${activeTab === tab.id ? 'bg-violet-500/10' : ''}`}>
              <tab.icon size={19} strokeWidth={activeTab === tab.id ? 2.2 : 1.5} />
            </div>
            <span className={`text-[10px] ${activeTab === tab.id ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
