import { useState, useEffect, useRef } from 'react';
import { sendCommand, getLatestResult, getStatus } from './api';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import ChatTab from './components/ChatTab';
import FilesTab from './components/FilesTab';
import LogTab from './components/LogTab';
import ConnectTab from './components/ConnectTab';

export default function App() {
  const [status, setStatus] = useState({ online: false, lastSeen: null });
  const [cmd, setCmd] = useState('');
  const [folderPath, setFolderPath] = useState('C:\\');
  const [result, setResult] = useState(null);
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jarvis_log') || '[]'); } catch { return []; }
  });
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jarvis_messages') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('jarvis_tab') || 'home');
  const lastResultId = useRef(null);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('jarvis_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('jarvis_log', JSON.stringify(log)); }, [log]);
  useEffect(() => { localStorage.setItem('jarvis_tab', activeTab); }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await getStatus();
        setStatus(s);
        const r = await getLatestResult();
        if (r && r.commandId !== lastResultId.current) {
          lastResultId.current = r.commandId;
          setResult(r);
          setLog(prev => [...prev, {
            id: r.commandId,
            output: r.output,
            time: new Date(r.receivedAt).toLocaleTimeString(),
            hasScreenshot: !!r.screenshot,
            screenshot: r.screenshot,
          }]);
          setMessages(prev => [...prev, {
            role: 'bot',
            text: r.output,
            screenshot: r.screenshot || null,
            suggestions: r.suggestions || [],
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
      <Header status={status} loading={loading} timeAgo={timeAgo} />

      <main className="flex-1 overflow-y-auto pb-[72px]">
        {activeTab === 'home' && (
          <HomeTab cmd={cmd} setCmd={setCmd} result={result} send={send} handleSubmit={handleSubmit} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'ai' && (
          <ChatTab cmd={cmd} setCmd={setCmd} messages={messages} setMessages={setMessages} loading={loading} setLoading={setLoading} send={send} handleSubmit={handleSubmit} />
        )}
        {activeTab === 'files' && (
          <FilesTab folderPath={folderPath} setFolderPath={setFolderPath} result={result} send={send} />
        )}
        {activeTab === 'connect' && (
          <ConnectTab />
        )}
        {activeTab === 'log' && (
          <LogTab log={log} />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
