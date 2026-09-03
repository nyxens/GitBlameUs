import React from 'react';
import { HandHeart } from 'lucide-react';

export const GiverPage = () => {
  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <HandHeart className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Blood <span className="font-serif italic font-normal text-rose-400">Giver</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Portal and dispatch interface for blood givers and voluntary contributors.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State Placeholder */}
      <div className="w-full min-h-[380px] rounded-3xl bg-neutral-950/80 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
          <HandHeart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Giver Workspace</h3>
        <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
          This section will host active blood offers, donor pledge schedules, and real-time intake routing for voluntary givers.
        </p>
      </div>
    </div>
  );
};

export default GiverPage;
