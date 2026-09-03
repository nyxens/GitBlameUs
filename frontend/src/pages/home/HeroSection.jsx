import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { DotMatrixBackground, InteractiveHoverButton } from '@ui/index';
import { InteractiveDashboard } from '@pages/dashboard/InteractiveDashboard';

export const HeroSection = ({ onOpenFindBloodModal, onOpenGetStartedModal }) => {
  const sectionRef = useRef(null);

  // Parallax Scroll Effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Hero text content group transform: y: [0, -200] and opacity: [1, 0]
  const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Dashboard container transform: y: [0, -100]
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full overflow-hidden flex flex-col items-center justify-start pt-16 pb-12 bg-black"
    >
      {/* Dynamic Dot Matrix Canvas Background - 100% full section coverage */}
      <DotMatrixBackground />

      {/* Centered Hero Header & Tagline Group */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="flex flex-col items-center text-center mt-6 md:mt-8 px-4 z-20 max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl tracking-[-2px] font-medium leading-tight md:leading-[1.15] mb-4 text-foreground"
        >
          Connecting Donors.{' '}
          <br className="hidden sm:inline" />
          Saving{' '}
          <span className="font-serif italic font-normal bg-gradient-to-r from-red-500 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            Lives.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-3xl mb-8 text-balance"
        >
          A reliable blood bank network bridging voluntary donors and medical centers to ensure safe blood is always available when every second counts.
        </motion.p>

        {/* Action Buttons with Expanding Color Pop Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <InteractiveHoverButton
            variant="danger"
            icon={Heart}
            onClick={onOpenFindBloodModal}
            className="w-full sm:w-auto min-w-[185px]"
          >
            Donate Blood
          </InteractiveHoverButton>

          <InteractiveHoverButton
            variant="primary"
            icon={ArrowRight}
            onClick={onOpenGetStartedModal}
            className="w-full sm:w-auto min-w-[175px]"
          >
            Get Started
          </InteractiveHoverButton>
        </motion.div>
      </motion.div>

      {/* Mini Dashboard Container - Perfectly Centered in Document Flow */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ y: dashboardY }}
        className="w-full max-w-5xl px-4 mx-auto mt-8 mb-4 z-20 relative flex justify-center"
      >
        <InteractiveDashboard />
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />
    </section>
  );
};
