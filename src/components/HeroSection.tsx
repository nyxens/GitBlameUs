import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Droplet, ArrowRight } from 'lucide-react';
import { DotMatrixBackground } from './DotMatrixBackground';
import { InteractiveDashboard } from './InteractiveDashboard';

interface HeroSectionProps {
  onOpenFindBloodModal: () => void;
  onOpenGetStartedModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenFindBloodModal, onOpenGetStartedModal }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax Scroll Effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Hero text content group transform: y: [0, -200] and opacity: [1, 0] (fades over first 50% of scroll)
  const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Dashboard container transform: y: [0, -250]
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start pt-12 pb-24 bg-black"
    >
      {/* Dynamic Dot Matrix Canvas Background - 100% full section coverage */}
      <DotMatrixBackground />

      {/* Centered Hero Header & Tagline Group */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="flex flex-col items-center text-center mt-8 md:mt-12 px-4 z-20 max-w-4xl mx-auto"
      >
        {/* Title: text-5xl md:text-7xl, tracking-[-2px], font-medium, leading-tight md:leading-[1.15] mb-3 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl tracking-[-2px] font-medium leading-tight md:leading-[1.15] mb-4 text-foreground"
        >
          Your Insights.{' '}
          <br className="hidden sm:inline" />
          One Clear{' '}
          <span className="font-serif italic font-normal text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            Overview.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg font-normal leading-6 opacity-90 mb-8 max-w-2xl text-[var(--hero-subtitle)]"
        >
          LifeVault empowers hospitals to seamlessly connect with regional blood banks,<br />track critical inventory, and manage blood supply thoroughly.
        </motion.p>

        {/* Hero Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={onOpenFindBloodModal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white rounded-full px-8 py-3.5 text-base font-medium shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Droplet className="w-5 h-5 fill-white" />
            <span>Find Blood</span>
          </motion.button>

          <motion.button
            onClick={onOpenGetStartedModal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-foreground text-background rounded-full px-8 py-3.5 text-base font-medium shadow-lg shadow-white/10 hover:shadow-white/20 transition-shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Mini Dashboard Container - Perfectly Centered in Document Flow */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ y: dashboardY }}
        className="w-full max-w-5xl px-4 mx-auto mt-12 mb-12 z-20 relative flex justify-center"
      >
        <InteractiveDashboard />
      </motion.div>

      {/* Bottom gradient fade: h-40, gradient from background to transparent, z-30, pointer-events-none */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />
    </section>
  );
};
