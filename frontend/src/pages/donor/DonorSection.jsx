import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, ShieldCheck, Award, ArrowRight, Quote } from 'lucide-react';
import { SpotlightCard, InteractiveHoverButton } from '@ui/index';

const TypewriterQuote = ({ text, author }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div>
      <blockquote className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed mb-6 min-h-[5.5rem] md:min-h-[4.5rem]">
        “{displayedText}”
        {isTyping && (
          <span
            aria-hidden="true"
            className="inline-block w-0.5 h-[0.9em] bg-red-400 ml-1.5 translate-y-[2px] animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]"
          />
        )}
      </blockquote>
      <div className="pt-4 border-t border-white/10 pr-24">
        <cite className="text-xs font-mono text-neutral-400 not-italic tracking-wider uppercase">
          — {author}
        </cite>
      </div>
    </div>
  );
};

export const DonorSection = ({ onOpenDonorModal }) => {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  const quotes = [
    {
      text: "A single drop of kindness can create an ocean of hope. Every donation gives someone another tomorrow.",
      author: "LifeVault Donor Legacy",
    },
    {
      text: "To the world you may be one person, but to a patient in emergency care, you are the entire world.",
      author: "Emergency Response Network",
    },
    {
      text: "Donating blood is the most human gift of all — silent, selfless, and profoundly life-changing.",
      author: "Voluntary Donor Guild",
    },
  ];

  // Auto-rotate quotes every 8.5 seconds (gives time for realtime typing + reading)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8500);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const donorSteps = [
    {
      num: 1,
      title: 'Walk-In Access',
      desc: 'Locate any nearby certified LifeVault blood center or donor drive with real-time availability.',
      icon: ShieldCheck,
      tag: 'Certified Blood Banks',
    },
    {
      num: 2,
      title: 'Direct Intake',
      desc: 'Your blood donation is tested, cataloged, and vaulted into emergency supply queues in minutes.',
      icon: Calendar,
      tag: 'Direct Connection',
    },
    {
      num: 3,
      title: 'Real-Time Impact',
      desc: 'Track your life-saving impact as your donated blood unit is dispatched to hospital emergency units.',
      icon: Award,
      tag: 'Live Tracking',
    },
  ];

  return (
    <section id="for-donors" className="py-24 px-6 md:px-20 bg-black relative border-t border-white/10 overflow-hidden">
      {/* Red ambient background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Animated Header Block */}
        <div className="max-w-3xl mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Donate Blood. <span className="font-serif italic font-normal text-red-400">Save Lives.</span>
          </motion.h2>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {donorSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex"
              >
                <SpotlightCard
                  spotlightColor="rgba(239, 68, 68, 0.15)"
                  className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-red-500/50 transition-all duration-300 relative shadow-2xl"
                >
                  <div className="flex-1 flex flex-col justify-between group">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-extrabold text-lg mb-6 group-hover:scale-110 transition-transform">
                        {step.num}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-xs text-purple-200/70 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-red-400 font-semibold">
                      <StepIcon className="w-4 h-4" />
                      <span>{step.tag}</span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Clean Animated Quote Layout on Left + Interactive Heartbeat Animation on Right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.15)"
            className="w-full p-8 md:p-10 rounded-3xl bg-neutral-950/90 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 shadow-2xl"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left side: Ultra-Clean Animated Quote Layout */}
              <div className="flex-1 w-full flex flex-col justify-between py-2">
                <div className="relative">
                  {/* Quote icon elevated upwards */}
                  <div className="relative -translate-y-2 md:-translate-y-3 mb-2 flex items-center">
                    <Quote className="w-10 h-10 text-red-500/60 fill-red-500/15 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
                  </div>

                  <div className="relative min-h-[140px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeQuoteIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => {
                          const swipeThreshold = 50;
                          if (offset.x < -swipeThreshold) {
                            setActiveQuoteIndex((prev) => (prev + 1) % quotes.length);
                          } else if (offset.x > swipeThreshold) {
                            setActiveQuoteIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
                          }
                        }}
                        className="cursor-grab active:cursor-grabbing select-none"
                      >
                        <TypewriterQuote
                          text={quotes[activeQuoteIndex].text}
                          author={quotes[activeQuoteIndex].author}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress indicators: Absolute positioned to remain static and not slide with text */}
                    <div className="absolute bottom-0 right-0 h-8 flex items-center z-30 pointer-events-auto">
                      <div className="flex items-center gap-1.5">
                        {quotes.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveQuoteIndex(i)}
                            aria-label={`Go to quote ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              activeQuoteIndex === i ? 'w-5 bg-red-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Action Callout Box with Interactive Animated Heartbeat Line */}
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-red-500/40 hover:border-red-500/80 bg-red-950/50 text-center min-w-[280px] shadow-xl relative overflow-hidden group/heart transition-all duration-300">
                {/* Heart & Heartbeat Line Container */}
                <div className="relative w-28 h-24 flex items-center justify-center mb-2">
                  <div className="absolute w-16 h-16 bg-red-600/20 rounded-full blur-xl transition-all duration-500 group-hover/heart:bg-red-500/60 group-hover/heart:scale-150" />
                  <Heart className="w-14 h-14 text-red-500 fill-red-500 transition-transform duration-300 group-hover/heart:scale-115 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

                  {/* ECG Heartbeat Line crossing over the heart */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-visible">
                    <svg viewBox="0 0 160 50" className="w-48 h-14 overflow-visible">
                      <defs>
                        <linearGradient id="heartbeat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                          <stop offset="25%" stopColor="#ef4444" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                          <stop offset="75%" stopColor="#ef4444" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                        <filter id="heartbeat-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Static baseline trace */}
                      <path
                        d="M 0 25 H 52 Q 58 17, 64 25 L 68 28 L 76 5 L 82 43 L 86 25 Q 93 15, 100 25 H 160"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.3)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-70 group-hover/heart:opacity-100 transition-opacity duration-300"
                      />

                      {/* Animated ECG Pulse line */}
                      <path
                        d="M 0 25 H 52 Q 58 17, 64 25 L 68 28 L 76 5 L 82 43 L 86 25 Q 93 15, 100 25 H 160"
                        fill="none"
                        stroke="url(#heartbeat-grad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#heartbeat-glow)"
                        className="heartbeat-pulse-line"
                      />
                    </svg>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-1">Ready to Save a Life?</h4>
                <p className="text-xs text-purple-200/80 mb-6">Book your appointment in 60 seconds</p>
                <InteractiveHoverButton
                  variant="danger"
                  icon={ArrowRight}
                  onClick={onOpenDonorModal}
                  className="w-full justify-center h-12 font-bold"
                >
                  Schedule Donation
                </InteractiveHoverButton>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};

export default DonorSection;
