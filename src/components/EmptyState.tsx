import React from 'react';
import { Upload, Lock, Zap, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
  onTryDemo: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick, onTryDemo }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto text-center space-y-8 select-none">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Tether QVAC SDK</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Ask My Notes
        </h1>
        <p className="text-lg font-medium text-indigo-300">
          Your private AI for your own documents.
        </p>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Upload your notes and ask questions. AI runs locally on your device using QVAC.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>+ Upload your first document</span>
        </button>

        <button
          onClick={onTryDemo}
          className="w-full sm:w-auto px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl text-sm border border-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Try Demo (Physics Notes)</span>
        </button>
      </div>

      {/* Three Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-emerald-950 text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">🔒 Private</h3>
          <p className="text-xs text-zinc-400">Your documents stay on your device.</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-indigo-950 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">⚡ Local AI</h3>
          <p className="text-xs text-zinc-400">Inference happens locally.</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-purple-950 text-purple-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">🔑 No API Key</h3>
          <p className="text-xs text-zinc-400">No cloud AI account required.</p>
        </div>
      </div>
    </div>
  );
};
