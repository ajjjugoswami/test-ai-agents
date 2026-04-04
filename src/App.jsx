import { useState, useEffect, useRef } from 'react';
import { sendCommand, getLatestResult, getStatus } from './api';

export default function App() {
  const [status, setStatus] = useState({ online: false, lastSeen: null });
  const [cmd, setCmd] = useState('');
  const [folderPath, setFolderPath] = useState('C:\\');
  const [result, setResult] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastResultId = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await getStatus();
        setStatus(s);
        const r = await getLatestResult();
        if (r && r.commandId !== lastResultId.current) {
          lastResultId.current = r.commandId;
          setResult(r);
          setLog(prev => [...prev, { id: r.commandId, output: r.output, time: new Date(r.receivedAt).toLocaleTimeString() }]);
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

  const handleShell = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    send('shell', cmd);
    setCmd('');
  };

  const timeAgo = (ts) => {
    if (!ts) return 'Never';
    const s = Math.floor((Date.now() - ts) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🖥️ PC Control</h1>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-900 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${status.online ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-medium">{status.online ? 'Online' : 'Offline'}</span>
        <span className="text-gray-500 text-sm ml-auto">Last seen: {timeAgo(status.lastSeen)}</span>
      </div>

      {/* Shell command */}
      <form onSubmit={handleShell} className="flex gap-2 mb-4">
        <input
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          placeholder="Type a shell command..."
          className="flex-1 bg-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium">Run</button>
      </form>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button onClick={() => send('screenshot')} className="bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium">📸 Screenshot</button>
        <button onClick={() => send('lock')} className="bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium">🔒 Lock PC</button>
        <button onClick={() => send('open_app', 'chrome')} className="bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium">🌐 Open Chrome</button>
        <button onClick={() => send('list_files', folderPath)} className="bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-medium">📁 List Files</button>
      </div>

      {/* Folder path for list_files */}
      <div className="mb-6">
        <input
          value={folderPath}
          onChange={e => setFolderPath(e.target.value)}
          placeholder="Folder path for List Files..."
          className="w-full bg-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
        />
      </div>

      {loading && <div className="text-blue-400 mb-4 animate-pulse">⏳ Waiting for result...</div>}

      {/* Screenshot viewer */}
      {result?.screenshot && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Latest Screenshot</h2>
          <img src={`data:image/png;base64,${result.screenshot}`} alt="Screenshot" className="rounded-lg w-full border border-gray-700" />
        </div>
      )}

      {/* File browser */}
      {result?.output && Array.isArray(tryParse(result.output)) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          <div className="bg-gray-900 rounded-lg p-3 max-h-60 overflow-y-auto text-sm font-mono">
            {tryParse(result.output).map((f, i) => (
              <div key={i} className={`py-1 ${f.type === 'dir' ? 'text-yellow-400' : 'text-gray-300'}`}>
                {f.type === 'dir' ? '📁' : '📄'} {f.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command log */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Command Log</h2>
        <div className="bg-gray-900 rounded-lg p-3 max-h-80 overflow-y-auto text-sm font-mono space-y-2">
          {log.length === 0 && <div className="text-gray-500">No commands executed yet.</div>}
          {[...log].reverse().map(entry => (
            <div key={entry.id} className="border-b border-gray-800 pb-2">
              <span className="text-gray-500">[{entry.time}]</span>
              <pre className="whitespace-pre-wrap text-gray-300 mt-1">{entry.output}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}
