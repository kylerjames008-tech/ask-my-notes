import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileCode,
  Info
} from 'lucide-react';
import { DocumentItem } from '../types';

interface SidebarProps {
  documents: DocumentItem[];
  onUploadFile: (file: File) => void;
  onTryDemo: () => void;
  onDeleteDocument: (docId: string) => void;
  isProcessing: boolean;
  processingProgress: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  onUploadFile,
  onTryDemo,
  onDeleteDocument,
  isProcessing,
  processingProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <aside className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Header Actions */}
      <div className="p-4 border-b border-zinc-800 space-y-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.txt,.md"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>+ Add File (PDF / TXT)</span>
        </button>

        <button
          onClick={onTryDemo}
          disabled={isProcessing}
          className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Try Demo (Physics Notes)</span>
        </button>
      </div>

      {/* Processing State Indicator */}
      {isProcessing && (
        <div className="p-4 bg-indigo-950/40 border-b border-indigo-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              Processing document...
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">{processingProgress || 'Extracting text ██████████░░░░'}</p>
          <p className="text-[10px] text-indigo-400/90 italic">Your document never leaves this device.</p>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          <span>My Documents</span>
          <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-[10px] text-zinc-300">{documents.length}</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl space-y-2">
            <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">No documents indexed yet</p>
            <p className="text-[11px] text-zinc-500">Upload a PDF or text file to index locally</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group relative p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div className="p-2 rounded bg-zinc-800 text-indigo-400 shrink-0 mt-0.5">
                      {doc.type === 'pdf' ? <FileText className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                        {doc.pageCount && <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>}
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Indexed locally</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {deleteConfirmId === doc.id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded border border-red-800">
                      <button
                        onClick={() => {
                          onDeleteDocument(doc.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-medium hover:bg-red-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-[11px] text-zinc-500 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span>Indexed data is stored on-device in browser local storage.</span>
      </div>
    </aside>
  );
};
