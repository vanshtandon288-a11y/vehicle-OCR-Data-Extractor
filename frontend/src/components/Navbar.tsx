import React from 'react';
import { FileScan, ShieldCheck, History, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'upload' | 'history';
  setActiveTab: (tab: 'upload' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <FileScan className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
                Vehicle Doc OCR Engine
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                  PaddleOCR 3.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">RC • Insurance • PUC • Permit • Fitness Data Extractor</p>
            </div>
          </div>

          {/* Navigation Tabs with Hover Morph */}
          <div className="flex items-center space-x-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:-translate-y-0.5'
              }`}
            >
              <Cpu className="w-4 h-4" />
              OCR Extractor
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 hover:-translate-y-0.5'
              }`}
            >
              <History className="w-4 h-4" />
              Document Vault
            </button>
          </div>

          {/* System Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-500/10 hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TypeORM MySQL Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
