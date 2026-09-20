import React from 'react';
import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { QVACStatus } from '../types';

interface HeaderProps {
  status: QVACStatus;
  onOpenPrivacyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, onOpenPrivacyModal }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between select-none z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
          A
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-100 text-lg tracking-tight">Ask My Notes</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium border border-zinc-700/50">
            Local AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Privacy Status Pill */}
        <button
          onClick={onOpenPrivacyModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors text-xs font-medium cursor-pointer group shadow-sm"
          title="Click to view local privacy details"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="tracking-wide">● LOCAL AI</span>
          <ShieldCheck className="w-3.5 h-3.5 ml-0.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>

        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 border-l border-zinc-800 pl-4">
          <div className="flex items-center gap-1.5" title="QVAC SDK Version">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>QVAC v{status.sdkVersion}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Local device storage">
            <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
            <span>On-Device</span>
          </div>
        </div>
      </div>
    </header>
  );
};
