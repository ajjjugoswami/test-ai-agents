import { useState, useEffect } from 'react';
import { Link2, Unlink, Mail, Calendar, HardDrive, CheckCircle, ExternalLink } from 'lucide-react';
import { getGoogleStatus, getGoogleAuthUrl, disconnectGoogle } from '../api';

export default function ConnectTab() {
  const [google, setGoogle] = useState({ connected: false });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const s = await getGoogleStatus();
      setGoogle(s);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleConnect = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const handleDisconnect = async () => {
    await disconnectGoogle();
    setGoogle({ connected: false });
  };

  return (
    <div className="px-5 py-4 space-y-5">
      <section>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Connected Apps</p>

        {/* Google Account */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-[16px]">G</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold">Google</p>
                <p className="text-[11px] text-zinc-500">
                  {google.connected ? google.email : 'Not connected'}
                </p>
              </div>
            </div>
            {google.connected ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <CheckCircle size={12} className="text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-2.5 py-1">
                <Unlink size={12} className="text-zinc-500" />
                <span className="text-[10px] font-medium text-zinc-500">Disconnected</span>
              </div>
            )}
          </div>

          {google.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
                {google.picture && (
                  <img src={google.picture} alt="" className="w-6 h-6 rounded-full" />
                )}
                <div className="min-w-0">
                  <p className="text-[12px] font-medium truncate">{google.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{google.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Permissions</p>
                {[
                  { icon: Mail, label: 'Gmail', desc: 'Send & draft emails' },
                  { icon: Calendar, label: 'Calendar', desc: 'View & create events' },
                  { icon: HardDrive, label: 'Drive', desc: 'Read files' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-zinc-800/30 rounded-lg">
                    <p.icon size={14} className="text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium">{p.label}</p>
                      <p className="text-[10px] text-zinc-600">{p.desc}</p>
                    </div>
                    <CheckCircle size={12} className="text-emerald-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 h-10 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[12px] font-medium hover:bg-red-500/20 active:scale-[0.98] transition-all"
              >
                <Unlink size={14} />
                Disconnect Google
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="w-full flex items-center justify-center gap-2 h-11 bg-white text-black rounded-xl text-[13px] font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              <Link2 size={16} />
              Connect Google Account
            </button>
          )}
        </div>
      </section>

      {/* Usage tips */}
      <section>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">What you can do</p>
        <div className="space-y-2">
          {[
            { text: '"Send email to john@gmail.com saying hello"', desc: 'Send emails via Gmail' },
            { text: '"Draft an email to boss about meeting"', desc: 'Create email drafts' },
            { text: '"Send hello message to user@example.com"', desc: 'Smart email detection by AI' },
          ].map((tip, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2.5">
              <p className="text-[12px] text-zinc-300 font-mono">{tip.text}</p>
              <p className="text-[10px] text-zinc-600 mt-1">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
