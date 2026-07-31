import { useState } from 'react';
import { Menu, X, Heart, Building2, Info, MessageSquare } from 'lucide-react';
import { AnimatedButton } from './AnimatedButton';

interface NavbarProps {
  onOpenGetStartedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGetStartedModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 w-full px-6 md:px-20 py-4 flex items-center justify-between bg-black/70 backdrop-blur-md border-b border-white/10">
      {/* Left side: Premium "LifeVault" Brand Heading */}
      <a
        href="#"
        className="flex items-center gap-1 text-2xl font-extrabold tracking-tight text-white leading-none font-brand hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-md"
      >
        <span>
          Life<span className="text-purple-400 font-syne">Vault</span>
        </span>
      </a>

      {/* Center Nav links */}
      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-300">
        <a
          href="#for-donors"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Heart className="w-4 h-4 text-red-400" />
          <span>For Donors</span>
        </a>
        <a
          href="#for-hospitals"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>For Hospitals</span>
        </a>
        <a
          href="#reviews"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <MessageSquare className="w-4 h-4 text-neutral-400" />
          <span>Reviews</span>
        </a>
        <a
          href="#about"
          className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Info className="w-4 h-4 text-neutral-400" />
          <span>About</span>
        </a>
      </div>

      {/* Right side: Single clean "Get Started" button */}
      <div className="flex items-center gap-3">
        <AnimatedButton
          variant="primary"
          size="md"
          onClick={onOpenGetStartedModal}
        >
          Get Started
        </AnimatedButton>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
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
