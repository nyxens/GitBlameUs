import React, { useState } from 'react';
import { Menu, X, Heart, Building2, Info, MessageSquare, CreditCard, LogOut, LayoutDashboard, Compass, ArrowRight, LogIn } from 'lucide-react';

export const Navbar = ({
  user,
  onOpenAuthModal,
  onLogout,
  currentView,
  onToggleView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (currentView !== 'landing') {
      onToggleView('landing');
      setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full px-6 md:px-16 bg-black/85 backdrop-blur-xl border-b border-white/10 select-none h-16 flex items-center justify-between">
      {/* Left side: Brand Lockup & View Switcher */}
      <div className="flex items-center gap-6">
        {/* Brand Lockup */}
        <button
          onClick={() => onToggleView('landing')}
          className="flex items-center gap-2 group text-left focus-visible:outline-none"
        >
          <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
            Life<span className="font-serif italic font-normal text-purple-400">Vault</span>
          </span>
        </button>

        {/* View Switcher Pill (shown when user is logged in) */}
        {user && (
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-neutral-900 border border-white/10 text-xs">
            <button
              onClick={() => onToggleView('landing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'landing'
                  ? 'bg-neutral-800 text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Landing Page</span>
            </button>
            <button
              onClick={() => onToggleView('workspace')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'workspace'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950/50'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-300" />
              <span>{user.role === 'CITIZEN' ? 'My Citizen Workspace' : 'Hospital WebApp Portal'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Nav links with Smooth Scrolling */}
      <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-neutral-300">
        <a
          href="#for-donors"
          onClick={(e) => handleNavClick(e, 'for-donors')}
          className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/20" />
          <span>For Donors</span>
        </a>
        <a
          href="#for-hospitals"
          onClick={(e) => handleNavClick(e, 'for-hospitals')}
          className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          <span>For Hospitals</span>
        </a>
        <a
          href="#reviews"
          onClick={(e) => handleNavClick(e, 'reviews')}
          className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Reviews</span>
        </a>
        <a
          href="#pricing"
          onClick={(e) => handleNavClick(e, 'pricing')}
          className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pricing</span>
        </a>
        <a
          href="#about"
          onClick={(e) => handleNavClick(e, 'about')}
          className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>About</span>
        </a>
      </div>

      {/* Right side: User Profile or Header-Matching Sign In Button */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleView('workspace')}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl border border-white/10 transition-all text-xs"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-white font-bold leading-tight">{user.name}</div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {user.role === 'CITIZEN' ? 'Citizen Donor' : 'Hospital Doctor'}
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300 flex items-center gap-2 text-xs font-semibold cursor-pointer group"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Sign In / Get Started</span>
          </button>
        )}

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
          <a href="#for-donors" onClick={(e) => handleNavClick(e, 'for-donors')} className="py-1 text-red-400 flex items-center gap-2">
            <Heart className="w-4 h-4 fill-red-400/20" /> For Donors
          </a>
          <a href="#for-hospitals" onClick={(e) => handleNavClick(e, 'for-hospitals')} className="py-1 text-purple-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> For Hospitals
          </a>
          <a href="#reviews" onClick={(e) => handleNavClick(e, 'reviews')} className="py-1 text-amber-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Reviews
          </a>
          <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="py-1 text-emerald-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pricing
          </a>
          <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="py-1 text-blue-400 flex items-center gap-2">
            <Info className="w-4 h-4" /> About
          </a>

          {!user && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                <span>Sign In / Get Started</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
