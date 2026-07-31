import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Droplet, ArrowRight } from 'lucide-react';
import { DotMatrixBackground } from './DotMatrixBackground';
import { InteractiveDashboard } from './InteractiveDashboard';
import { AnimatedButton } from './AnimatedButton';

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
          className="text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-2xl mb-8"
        >
          Real-time blood stock telemetry, emergency dispatch routing, and cold-chain compliance built for modern health networks.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <AnimatedButton
            variant="danger"
            size="lg"
            onClick={onOpenFindBloodModal}
            className="w-full sm:w-auto rounded-full"
          >
            <Droplet className="w-5 h-5 fill-white" />
            <span>Find Blood</span>
          </AnimatedButton>

          <AnimatedButton
            variant="primary"
            size="lg"
            onClick={onOpenGetStartedModal}
            className="w-full sm:w-auto rounded-full"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </AnimatedButton>
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
