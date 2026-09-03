import React from 'react';
import { UserSearch } from 'lucide-react';

export const SeekerPage = () => {
  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <UserSearch className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Blood <span className="font-serif italic font-normal text-cyan-400">Seeker</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Search and matching portal for patients and hospitals seeking compatible blood reserves.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State Placeholder */}
      <div className="w-full min-h-[380px] rounded-3xl bg-neutral-950/80 border border-white/10 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <UserSearch className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Seeker Workspace</h3>
        <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
          This section will host emergency blood searches, regional vault stock inquiries, and live requisition tracking for seekers.
        </p>
      </div>
    </div>
  );
};

export default SeekerPage;
