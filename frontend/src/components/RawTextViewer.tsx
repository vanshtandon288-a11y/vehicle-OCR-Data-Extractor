import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface RawTextViewerProps {
  rawText?: string;
}

export const RawTextViewer: React.FC<RawTextViewerProps> = ({ rawText }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!rawText) return null;

  return (
    <div className="glass-card rounded-3xl overflow-hidden mt-6 shadow-2xl transition-all duration-300">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide">
            Raw OCR Recognized Stream Output
          </h4>
          <span className="text-[11px] font-mono bg-white/5 text-slate-400 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
            {rawText.split('\n').length} lines
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 transition-all shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-950/90 font-mono text-xs text-emerald-400/90 overflow-x-auto max-h-96 border-t border-white/10 leading-relaxed whitespace-pre-wrap backdrop-blur-2xl">
          {rawText}
        </div>
      )}
    </div>
  );
};
