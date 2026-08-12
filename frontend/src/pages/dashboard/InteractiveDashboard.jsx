import React, { useState } from 'react';
import { Boxes, Users, LogOut } from 'lucide-react';

export const InteractiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Boxes, iconColor: 'text-purple-400' },
    { id: 'donors', label: 'Donors', icon: Users, iconColor: 'text-red-400' },
  ];

  return (
    <div className="w-full bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl text-left select-none">
      
      {/* Mac Window Header Bar */}
      <div className="px-6 py-4 bg-black/90 border-b border-white/10 flex items-center justify-between gap-4">
        
        {/* Mac Window Control Dots + Brand Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-red-600/30" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-amber-600/30" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-emerald-600/30" />
          </div>

          <span className="text-lg md:text-xl font-extrabold tracking-tight text-white pl-3 border-l border-white/10">
            Life<span className="font-serif italic font-normal text-purple-400">Vault</span>
          </span>
        </div>

        {/* Center Nav Links: Styled identically to Landing Page Nav */}
        <div className="flex items-center gap-1 text-xs font-semibold text-neutral-300">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                  isActive ? 'text-white bg-white/5 font-bold' : 'text-neutral-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Simple Sign Out Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-red-500/40 transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content: Spacious Larger Screen Area Ready to Fill Later */}
      <div className="p-8 md:p-12 bg-black min-h-[480px]">
        {activeTab === 'inventory' && (
          <div className="flex items-center gap-3">
            <Boxes className="w-7 h-7 text-purple-400" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Blood Vault <span className="font-serif italic font-normal text-purple-400">Inventory</span>
            </h2>
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-red-400" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Registered <span className="font-serif italic font-normal text-red-400">Donors</span>
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDashboard;
