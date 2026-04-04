import { ScrollText, Image } from 'lucide-react';

export default function LogTab({ log }) {
  return (
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
  );
}
