import React from 'react';
import { X, ShieldCheck, Check, Lock, Cpu, KeyRound, CloudOff } from 'lucide-react';
import { QVACStatus } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: QVACStatus;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              LOCAL AI
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                100% Private
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Powered by Tether QVAC SDK v{status.sdkVersion}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
            <div className="p-1 rounded bg-emerald-950 text-emerald-400 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">QVAC model loaded locally</p>
              <p className="text-xs text-zinc-400 mt-0.5">Model runs directly on your CPU/GPU ({status.modelName}).</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
            <div className="p-1 rounded bg-emerald-950 text-emerald-400 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Documents processed locally</p>
              <p className="text-xs text-zinc-400 mt-0.5">PDF/TXT extraction and RAG indexing happen on device.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
            <div className="p-1 rounded bg-emerald-950 text-emerald-400 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">No AI API key required</p>
              <p className="text-xs text-zinc-400 mt-0.5">No OpenAI, Anthropic, or Gemini cloud accounts needed.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/60">
            <div className="p-1 rounded bg-emerald-950 text-emerald-400 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">No cloud inference</p>
              <p className="text-xs text-zinc-400 mt-0.5">Your study notes never leave this device.</p>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-300 flex items-center justify-between">
          <span>Local Engine Status:</span>
          <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready (Local QVAC)
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};
