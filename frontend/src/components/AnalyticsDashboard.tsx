import React from 'react';
import { StatsSummary } from '../types/document.types';
import { FileCheck, CheckCircle2, Edit3, Layers } from 'lucide-react';

interface AnalyticsDashboardProps {
  stats: StatsSummary | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Total Processed */}
      <div className="glass-card-morph rounded-2xl p-6 flex items-center justify-between group">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Processed</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform">{stats.totalProcessed}</h3>
          <p className="text-xs text-slate-400 mt-1">Vehicle Documents</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
          <FileCheck className="w-7 h-7" />
        </div>
      </div>

      {/* Success Rate */}
      <div className="glass-card-morph rounded-2xl p-6 flex items-center justify-between group">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High OCR Success Rate</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 group-hover:scale-105 transition-transform">High</h3>
          <p className="text-xs text-slate-400 mt-1">{stats.statusBreakdown.completed} Verified Records</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-7 h-7" />
        </div>
      </div>

      {/* Assisted Manual Edits */}
      <div className="glass-card-morph rounded-2xl p-6 flex items-center justify-between group">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assisted Manual Edits</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-1 group-hover:scale-105 transition-transform">Active</h3>
          <p className="text-xs text-slate-400 mt-1">Inline Verification Enabled</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
          <Edit3 className="w-7 h-7" />
        </div>
      </div>

      {/* Document Types Breakdown */}
      <div className="glass-card-morph rounded-2xl p-6 flex items-center justify-between group">
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doc Distribution</p>
            <Layers className="w-4 h-4 text-slate-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 shadow-sm">
              RC: {stats.byType.rc || 0}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30 shadow-sm">
              INS: {stats.byType.insurance || 0}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 shadow-sm">
              PUC: {stats.byType.puc || 0}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 shadow-sm">
              PER: {stats.byType.permit || 0}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 shadow-sm">
              FIT: {stats.byType.fitness || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
