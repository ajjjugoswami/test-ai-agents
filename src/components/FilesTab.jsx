import { useState } from 'react';
import {
  FolderOpen, FolderClosed, FileText, Search, ChevronRight,
  ImageIcon, Film, FileAudio, Download, X, Eye, ArrowLeft
} from 'lucide-react';

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.ico'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
const PREVIEWABLE = [...IMAGE_EXTS, ...VIDEO_EXTS];

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(ext) {
  if (IMAGE_EXTS.includes(ext)) return ImageIcon;
  if (VIDEO_EXTS.includes(ext)) return Film;
  if (['.mp3', '.wav', '.flac', '.ogg'].includes(ext)) return FileAudio;
  return FileText;
}

export default function FilesTab({ folderPath, setFolderPath, result, send }) {
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const navigateTo = (path) => {
    setHistory(prev => [...prev, folderPath]);
    setFolderPath(path);
    setPreview(null);
    send('list_files', path);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFolderPath(prev);
    setPreview(null);
    send('list_files', prev);
  };

  const files = result?.output ? tryParse(result.output) : null;
  const isFileList = Array.isArray(files);

  // Check if latest result is a preview response
  const previewData = result?.output ? tryParse(result.output) : null;

  const handlePreview = (fileName) => {
    const filePath = folderPath.endsWith('\\') ? folderPath + fileName : folderPath + '\\' + fileName;
    setPreviewLoading(true);
    send('preview_file', filePath);
  };

  const handleDownload = (fileName) => {
    const filePath = folderPath.endsWith('\\') ? folderPath + fileName : folderPath + '\\' + fileName;
    send('download_file', filePath);
  };

  // Detect preview/download result
  const resultData = result?.output ? tryParse(result.output) : null;
  const isPreviewResult = resultData && resultData.mime && resultData.data;
  const isDownloadResult = resultData && resultData.data && resultData.ext && !resultData.mime;

  // Auto-trigger download
  if (isDownloadResult && !preview) {
    const blob = (() => {
      try {
        const bytes = atob(resultData.data);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        return new Blob([arr]);
      } catch { return null; }
    })();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resultData.name || 'download';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Show preview modal
  if (isPreviewResult && previewLoading) {
    setTimeout(() => {
      setPreview(resultData);
      setPreviewLoading(false);
    }, 0);
  }

  return (
    <div className="px-5 py-4 space-y-4 relative">
      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setPreview(null)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <ArrowLeft size={16} />
              </button>
              <p className="text-[13px] font-medium truncate">{preview.name}</p>
            </div>
            <button
              onClick={() => {
                const bytes = atob(preview.data);
                const arr = new Uint8Array(bytes.length);
                for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                const blob = new Blob([arr], { type: preview.mime });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = preview.name;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-lg text-[12px] font-semibold active:scale-95 transition-all"
            >
              <Download size={13} /> Save
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {preview.mime.startsWith('image/') ? (
              <img src={`data:${preview.mime};base64,${preview.data}`} alt={preview.name} className="max-w-full max-h-full object-contain rounded-lg" />
            ) : preview.mime.startsWith('video/') ? (
              <video controls autoPlay className="max-w-full max-h-full rounded-lg">
                <source src={`data:${preview.mime};base64,${preview.data}`} type={preview.mime} />
              </video>
            ) : null}
          </div>
        </div>
      )}

      {/* Path input */}
      <div className="flex items-center gap-2">
        {history.length > 0 && (
          <button onClick={goBack} className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 active:scale-90 transition-all">
            <ArrowLeft size={16} className="text-zinc-400" />
          </button>
        )}
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-10">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            value={folderPath}
            onChange={e => setFolderPath(e.target.value)}
            placeholder="Enter path..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-zinc-600"
          />
        </div>
        <button
          onClick={() => navigateTo(folderPath)}
          className="h-10 px-4 bg-white text-black rounded-xl text-[12px] font-semibold hover:bg-zinc-200 active:scale-95 transition-all"
        >
          Open
        </button>
      </div>

      {/* Quick paths */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {['C:\\', 'C:\\Users', 'D:\\', 'C:\\Program Files', 'C:\\Windows'].map((p, i) => (
          <button
            key={i}
            onClick={() => navigateTo(p)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${folderPath === p ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* File list */}
      {isFileList && (
        <div className="space-y-0.5">
          {files.map((f, i) => {
            const ext = f.ext || '';
            const canPreview = PREVIEWABLE.includes(ext);
            const Icon = f.type === 'dir' ? FolderClosed : getFileIcon(ext);
            const iconColor = f.type === 'dir' ? 'text-amber-400'
              : IMAGE_EXTS.includes(ext) ? 'text-violet-400'
              : VIDEO_EXTS.includes(ext) ? 'text-blue-400'
              : 'text-zinc-500';

            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (f.type === 'dir') {
                      const np = folderPath.endsWith('\\') ? folderPath + f.name : folderPath + '\\' + f.name;
                      navigateTo(np);
                    } else if (canPreview) {
                      handlePreview(f.name);
                    }
                  }}
                  className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900/80 active:scale-[0.98] transition-all text-left min-w-0"
                >
                  <Icon size={18} className={`${iconColor} shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <span className={`text-[13px] truncate block ${f.type === 'dir' ? 'font-medium text-zinc-200' : 'text-zinc-400'}`}>{f.name}</span>
                    {f.size != null && f.type !== 'dir' && (
                      <span className="text-[10px] text-zinc-600">{formatSize(f.size)}</span>
                    )}
                  </div>
                  {f.type === 'dir' && <ChevronRight size={14} className="text-zinc-700 shrink-0" />}
                  {canPreview && f.type !== 'dir' && <Eye size={14} className="text-zinc-600 shrink-0" />}
                </button>
                {f.type !== 'dir' && (
                  <button
                    onClick={() => handleDownload(f.name)}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 hover:bg-zinc-800 active:scale-90 transition-all"
                  >
                    <Download size={13} className="text-zinc-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {previewLoading && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[12px] text-zinc-500">Loading preview...</p>
        </div>
      )}

      {/* Empty state */}
      {!isFileList && !previewLoading && (
        <div className="text-center py-16">
          <FolderOpen size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-[13px] text-zinc-600">Enter a path and tap Open</p>
        </div>
      )}
    </div>
  );
}
