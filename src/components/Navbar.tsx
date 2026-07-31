import { useState } from 'react';
import { Menu, X, Heart, Building2, Info, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onOpenGetStartedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGetStartedModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 w-full px-6 md:px-20 py-4 flex items-center justify-between bg-black/70 backdrop-blur-md border-b border-white/10">
      {/* Left side: Pure "LifeVault" text (Logo entirely removed per user request) */}
      <a href="#" className="text-xl font-bold tracking-tight text-white leading-none hover:opacity-90 transition-opacity">
        LifeVault
      </a>

      {/* Center Nav links */}
      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-300">
        <a
          href="#for-donors"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span>For Donors</span>
        </a>
        <a
          href="#for-hospitals"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
        >
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>For Hospitals</span>
        </a>
        <a
          href="#reviews"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-4 h-4 text-neutral-400" />
          <span>Reviews</span>
        </a>
        <a
          href="#about"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
        >
          <Info className="w-4 h-4 text-neutral-400" />
          <span>About</span>
        </a>
      </div>

      {/* Right side: Single clean "Get Started" button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenGetStartedModal}
          className="bg-foreground text-background hover:bg-white/90 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-white/20"
        >
          Get Started
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-neutral-950/95 border-b border-white/10 px-6 py-6 flex flex-col gap-4 md:hidden z-50 backdrop-blur-2xl">
          <a href="#for-donors" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium py-1 text-red-400 flex items-center gap-2">
            <Heart className="w-4 h-4" /> For Donors
          </a>
          <a href="#for-hospitals" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium py-1 text-purple-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> For Hospitals
          </a>
          <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium py-1 text-neutral-300">
            Reviews
          </a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium py-1 text-neutral-300">
            About
          </a>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGetStartedModal();
              }}
              className="w-full bg-foreground text-background py-3 rounded-lg text-sm font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
