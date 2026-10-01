import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Boxes,
  Users,
  UserCheck,
  History,
  HandHeart,
  UserSearch,
  Menu,
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
} from 'lucide-react';

export const isStaffOrAdmin = (role) => {
  if (!role) return false;
  const staffOrAdminRoles = [
    'ADMIN',
    'SUPER_ADMIN',
    'DOCTOR',
    'NURSE',
    'LAB_TECHNICIAN',
    'PHLEBOTOMIST',
    'MANAGER',
    'STAFF',
  ];
  return staffOrAdminRoles.includes(String(role).trim().toUpperCase());
};

export const BBMSHeader = ({ activeSection, onSelectSection, onLogout, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserTooltip, setShowUserTooltip] = useState(false);

  const isStaff = isStaffOrAdmin(user?.role);

  const staffMenuItems = [
    { id: 'inventory', label: 'Inventory', icon: Boxes, iconColor: 'text-purple-400' },
    { id: 'donors', label: 'Donors', icon: Users, iconColor: 'text-red-400' },
    { id: 'recipients', label: 'Recipients', icon: UserCheck, iconColor: 'text-emerald-400' },
    { id: 'history', label: 'History', icon: History, iconColor: 'text-amber-400' },
    { id: 'profile', label: 'Profile', icon: User, iconColor: 'text-violet-400' },
  ];

  const citizenMenuItems = [
    { id: 'seeker', label: 'Seeker', icon: UserSearch, iconColor: 'text-cyan-400' },
    { id: 'giver', label: 'Giver', icon: HandHeart, iconColor: 'text-rose-400' },
    { id: 'profile', label: 'Profile', icon: User, iconColor: 'text-violet-400' },
  ];

  const menuItems = isStaff ? staffMenuItems : citizenMenuItems;

  const getInitials = (name) => {
    if (!name) return 'OP';
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Authorized Operator');
  const displayEmail = user?.email || (user?.username ? `${user.username.toLowerCase()}@lifevault.internal` : 'operator@lifevault.internal');
  const displayRole = user?.role
    ? (user.role === 'DONOR' ? 'Blood Donor' : user.role === 'HOSPITAL' ? 'Hospital Partner' : user.role)
    : 'Authorized Personnel';

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

      {/* Right side: Sign Out Button with Premium Hover Identity Card */}
      <div className="flex items-center gap-3">
        <div
          className="relative"
          onMouseEnter={() => setShowUserTooltip(true)}
          onMouseLeave={() => setShowUserTooltip(false)}
        >
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-red-500/40 transition-all duration-300 flex items-center gap-2 text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>

          {/* Simplified, Fully Opaque "Signed In As" Card with Unique Fonts */}
          <AnimatePresence>
            {showUserTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-[#0e0e12] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.9)] z-50 pointer-events-none text-left select-none"
                style={{ backgroundColor: '#0e0e12' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                    Signed in as
                  </span>
                </div>
                <div className="font-brand text-sm font-bold text-white tracking-tight truncate">
                  {displayName}
                </div>
                {displayEmail && (
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                    {displayEmail}
                  </div>
                )}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-wider">Role</span>
                  <span className="font-mono text-xs font-bold text-red-400">
                    {displayRole}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

          <div className="pt-4 border-t border-white/10 space-y-3">
            <div
              onClick={() => {
                onSelectSection('profile');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-white font-brand text-sm font-bold text-purple-300 shrink-0">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Signed in as</span>
                <span className="font-brand font-bold text-white text-sm truncate block">
                  {displayName}
                </span>
                <span className="font-mono text-[10px] text-purple-400 block mt-0.5">
                  {displayRole} • View Profile →
                </span>
              </div>
            </div>
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
