import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Building2, Truck } from 'lucide-react';
import { SpotlightCard } from '@ui/index';

export const AboutSection = () => {
  const pillars = [
    {
      id: 'donors',
      title: '100% Voluntary Donors',
      desc: 'Engaging community donors with digital scheduling, instant compatibility guides, and life-impact updates.',
      icon: Heart,
      iconColor: 'text-red-400 fill-red-400',
      iconBg: 'bg-red-500/10 border-red-500/30',
      spotlight: 'rgba(239, 68, 68, 0.15)',
    },
    {
      id: 'hospital',
      title: 'Hospital Network Sync',
      desc: 'Empowering hospital surgical units and ERs to view live blood bank inventories and order units instantly.',
      icon: Building2,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/30',
      spotlight: 'rgba(168, 85, 247, 0.18)',
    },
    {
      id: 'logistics',
      title: 'Rapid Emergency Logistics',
      desc: '15-minute emergency courier dispatch for critical trauma cases with real-time temperature tracking.',
      icon: Truck,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/30',
      spotlight: 'rgba(168, 85, 247, 0.18)',
    },
    {
      id: 'compliance',
      title: 'Medical Compliance',
      desc: 'Cold-chain storage telemetry, certified donor screening protocols, and HIPAA-compliant data security.',
      icon: ShieldCheck,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/30',
      spotlight: 'rgba(168, 85, 247, 0.18)',
    },
  ];

  return (
    <section id="about" className="py-24 px-6 md:px-20 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Purple background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Animated Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Bridging Hospitals, Blood Banks, and Donors{' '}
            <span className="font-serif italic font-normal text-purple-400">In Real Time.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-neutral-400 text-sm md:text-base leading-relaxed text-balance"
          >
            LifeVault was founded with a singular purpose: to eliminate blood shortages in emergency care. By uniting regional blood banks, hospital trauma units, and voluntary donors on one online platform, we ensure life-saving blood reaches patients without delay.
          </motion.p>
        </div>

        {/* 4 Pillars Grid - Staggered Scroll Entrance Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch mb-16">
          {pillars.map((pillar, index) => {
            const PillarIcon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex"
              >
                <SpotlightCard
                  spotlightColor={pillar.spotlight}
                  className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl text-center group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} border ${pillar.iconColor} flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform`}>
                      <PillarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Card - Animated Scroll Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.2)"
            className="w-full p-8 md:p-10 rounded-3xl bg-neutral-950/80 border border-white/10 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-extrabold font-mono text-white mb-1">120+</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Partner Hospitals</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-purple-400 mb-1">45,000+</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Blood Units Vaulted</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-purple-400 mb-1">99.8%</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">On-Time ER Delivery</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-red-400 mb-1">15 Mins</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Avg Dispatch Time</div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
