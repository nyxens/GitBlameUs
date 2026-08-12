import React, { useState } from 'react';
import { LogOut, Boxes, Users, Menu, X } from 'lucide-react';

export const BBMSHeader = ({ activeSection, onSelectSection, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Boxes, iconColor: 'text-purple-400' },
    { id: 'donors', label: 'Donors', icon: Users, iconColor: 'text-red-400' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full px-6 md:px-16 bg-black/85 backdrop-blur-xl border-b border-white/10 select-none h-16 flex items-center justify-between">
      {/* Left side: Brand Lockup */}
      <div className="flex items-center gap-6">
        <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
          Life<span className="font-serif italic font-normal text-purple-400">Vault</span>
        </span>
      </div>

      {/* Center Nav links: Matching Landing Page Header nav link style */}
      <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-neutral-300">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                isActive ? 'text-white bg-white/5 font-bold' : 'text-neutral-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right side: Sign Out Button matching Landing Page Header Button Style */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-red-500/40 transition-all duration-300 flex items-center gap-2 text-xs font-semibold cursor-pointer group"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-neutral-950 border-b border-white/10 p-6 flex flex-col gap-4 text-sm font-semibold shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`py-1 text-left flex items-center gap-2 ${
                  isActive ? 'text-purple-400 font-bold' : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full py-2.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default BBMSHeader;
