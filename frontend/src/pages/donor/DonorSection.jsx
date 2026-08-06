import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, ShieldCheck, Award, ArrowRight, Users, Activity, Droplet } from 'lucide-react';
import { SpotlightCard, InteractiveHoverButton } from '@ui/index';

export const DonorSection = ({ onOpenDonorModal }) => {
  const [selectedBloodType, setSelectedBloodType] = useState('O-');

  const bloodCompatibility = {
    'O-': { canGiveTo: ['Every Blood Type (Universal Donor)'], rarity: 'High Emergency Demand (7% of population)' },
    'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], rarity: 'Most Needed (37% of population)' },
    'A+': { canGiveTo: ['A+', 'AB+'], rarity: 'High Demand (34% of population)' },
    'A-': { canGiveTo: ['A+', 'A-', 'AB+', 'AB-'], rarity: 'Rare (6% of population)' },
    'B+': { canGiveTo: ['B+', 'AB+'], rarity: 'Moderate Demand (9% of population)' },
    'B-': { canGiveTo: ['B+', 'B-', 'AB+', 'AB-'], rarity: 'Rare (2% of population)' },
    'AB+': { canGiveTo: ['AB+ Only'], rarity: 'Universal Recipient (3% of population)' },
    'AB-': { canGiveTo: ['AB+', 'AB-'], rarity: 'Ultra Rare (1% of population)' },
  };

  const donorSteps = [
    {
      num: 1,
      title: 'Check Eligibility',
      desc: 'Check your blood type compatibility, weight, and health requirements in under 60 seconds with our instant guide.',
      icon: ShieldCheck,
      tag: 'Instant Digital Check',
    },
    {
      num: 2,
      title: 'Book Appointment',
      desc: 'Choose a nearby certified LifeVault blood center or mobile donor drive with zero waiting time.',
      icon: Calendar,
      tag: 'Flexible Time Slots',
    },
    {
      num: 3,
      title: 'Track Impact',
      desc: 'Receive real-time notifications when your donated blood unit is dispatched to an ER to save a patient.',
      icon: Award,
      tag: 'Live Life-Saver Updates',
    },
  ];

  return (
    <section id="for-donors" className="py-24 px-6 md:px-20 bg-black relative border-t border-white/10 overflow-hidden">
      {/* Red ambient background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Animated Header Block */}
        <div className="max-w-3xl mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Donate Blood. <span className="font-serif italic font-normal text-red-400">Save Lives.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-purple-200/80 text-base md:text-lg leading-relaxed text-balance"
          >
            Every donation saves up to three lives. LifeVault makes scheduling a donation fast, convenient, and transparent with real-time tracking of where your blood goes.
          </motion.p>
        </div>

        {/* 3 Step Donor Process Grid - Staggered Scroll Entrance */}
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

        {/* Interactive Blood Type Compatibility Tool - Animated Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.15)"
            className="w-full p-8 md:p-10 rounded-3xl bg-neutral-950/90 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 shadow-2xl"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Interactive Blood Compatibility Guide</h3>
                <p className="text-xs text-purple-200/80 mb-6">
                  Select your blood group to see who your donation can help in urgent hospital cases.
                </p>

                {/* Blood Type Selector Pills */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {Object.keys(bloodCompatibility).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedBloodType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedBloodType === type
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/60 scale-105'
                        : 'bg-black border-red-500/20 text-purple-200/70 hover:text-white hover:border-red-500/40'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* High-Craft Color-Themed Telemetry Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black border border-red-500/30 shadow-inner">
                  {/* Selected Blood Group Card */}
                  <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 flex flex-col justify-between">
                    <div className="text-[11px] font-bold text-red-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400/30" />
                      <span>Blood Group</span>
                    </div>
                    <div className="text-2xl font-black text-white font-sans">{selectedBloodType}</div>
                  </div>

                  {/* Recipients Card */}
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-col justify-between">
                    <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Can Donate To</span>
                    </div>
                    <div className="text-xs font-bold text-white leading-snug">
                      {bloodCompatibility[selectedBloodType].canGiveTo.join(', ')}
                    </div>
                  </div>

                  {/* Rarity & Demand Card */}
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex flex-col justify-between">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rarity & Demand</span>
                    </div>
                    <div className="text-xs font-bold text-amber-300 leading-snug">
                      {bloodCompatibility[selectedBloodType].rarity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Callout Box with Interactive Heartbeat Line on Hover */}
              <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border text-center min-w-[280px] shadow-xl relative overflow-hidden group/heart transition-all duration-300 'bg-red-950/50 border-red-500/40 hover:border-red-500/80' 
                }`}>
                {/* Heart & Heartbeat Line Container */}
                <div className="relative w-28 h-24 flex items-center justify-center mb-2">
                  {/* Glowing background aura on hover */}
                  <div className="absolute w-16 h-16 bg-red-600/20 rounded-full blur-xl transition-all duration-500 group-hover/guide:bg-red-500/50 group-hover/guide:scale-150 group-hover/heart:bg-red-500/60 group-hover/heart:scale-150" />

                  {/* Pulsing Central Heart */}
                  <Heart className="w-14 h-14 text-red-500 fill-red-500 transition-transform duration-300 group-hover/guide:scale-110 group-hover/heart:scale-115 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />

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

                      {/* Static baseline trace - Hidden by default, visible only on hover */}
                      <path
                        d="M 0 25 H 52 Q 58 17, 64 25 L 68 28 L 76 5 L 82 43 L 86 25 Q 93 15, 100 25 H 160"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.3)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-hover/guide:opacity-100 group-hover/heart:opacity-100 transition-opacity duration-300"
                      />

                      {/* Animated ECG Pulse line with centered P, QRS, and T waves - Hidden by default, visible only on hover */}
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
