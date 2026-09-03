import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'LifeVault transformed how our hospital network handles critical blood logistics during emergency trauma cases. We are now able to locate, request, and track life-saving blood units across regional vaults in minutes!',
    author: 'Brooklyn Simmons',
  },
  {
    id: 2,
    quote:
      'During mass-casualty trauma emergencies, locating rare O-negative units in under 4 minutes rather than 45 minutes saves lives directly. LifeVault’s real-time cold chain telemetry is an indispensable safeguard for our trauma center.',
    author: 'Dr. Marcus Vance',
  },
  {
    id: 3,
    quote:
      'The automated FEFO inventory queue and cross-regional donor matching completely eliminated stock expirations across our network while guaranteeing cold-chain integrity from intake to transfusion.',
    author: 'Elena Rostova',
  },
];

export const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-flow comments smoothly every 7 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIndex];
  const words = current.quote.split(' ');

  return (
    <section
      id="reviews"
      className="min-h-[75vh] w-full flex items-center justify-center py-20 md:py-28 px-6 sm:px-10 md:px-20 bg-black relative border-t border-white/10 overflow-hidden"
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div
        className="max-w-4xl w-full mx-auto flex flex-col items-start relative z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Quote symbol - elevated upwards with clean SVG and crimson glow */}
        <div className="relative -translate-y-3 md:-translate-y-4 mb-3 flex items-center justify-start">
          <div className="w-12 h-9 text-rose-500/90 drop-shadow-[0_0_20px_rgba(244,63,94,0.45)]">
            <svg
              viewBox="0 0 40 30"
              fill="currentColor"
              className="w-full h-full"
              aria-hidden="true"
            >
              <path d="M0 18.2C0 9.8 5.6 3.2 14 0l2.4 4.2C10.4 6.2 7 9.8 6.6 14.6H14V30H0V18.2zm22 0C22 9.8 27.6 3.2 36 0l2.4 4.2c-6 2-9.4 5.6-9.8 10.4H36V30H22V18.2z" />
            </svg>
          </div>
        </div>

        {/* Comments container with buttery smooth transitions */}
        <div className="w-full min-h-[180px] md:min-h-[200px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset }) => {
                if (offset.x < -40) handleNext();
                else if (offset.x > 40) handlePrev();
              }}
              className="cursor-grab active:cursor-grabbing select-none"
            >
              {/* Testimonial quote text with flowing words */}
              <blockquote className="text-2xl sm:text-3xl md:text-5xl font-medium leading-[1.25] tracking-tight text-white mb-8">
                <span className="text-neutral-500 mr-2">"</span>
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: i * 0.015,
                      ease: 'easeOut',
                    }}
                    className="inline-block mr-[0.28em]"
                  >
                    {word}
                  </motion.span>
                ))}
                <span className="text-neutral-500 ml-1">"</span>
              </blockquote>

              {/* Author name & navigation controls - clean, no avatar, no roles, no pellets */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <span className="text-lg font-semibold tracking-wide text-white">
                  {current.author}
                </span>

                {/* Next / Previous flow buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous comment"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next comment"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
