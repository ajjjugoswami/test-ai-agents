import { Home, Bot, FolderOpen, ScrollText } from 'lucide-react';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'ai', icon: Bot, label: 'AI' },
  { id: 'files', icon: FolderOpen, label: 'Files' },
  { id: 'log', icon: ScrollText, label: 'Log' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto bg-black/90 backdrop-blur-2xl border-t border-zinc-800/60">
      <div className="flex justify-around px-4 h-[68px] items-center">
        {tabs.map(tab => (
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
  );
}
