import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Activity, Truck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpotlightCard, InteractiveHoverButton } from '@ui/index';

export const HospitalSection = ({ onOpenHospitalModal }) => {
  const hospitalFeatures = [
    {
      id: 'dispatch',
      title: 'Emergency Dispatch',
      desc: 'Order urgent blood units for trauma cases with 15-minute dispatch response times across regional vaults.',
      icon: Truck,
      tag: 'Real-time Courier Tracking',
    },
    {
      id: 'telemetry',
      title: 'Cold-Chain Telemetry',
      desc: 'Automated temperature monitoring (2°C - 6°C) for blood refrigerators with instant anomaly alerts.',
      icon: Activity,
      tag: 'Automated Compliance Logs',
    },
    {
      id: 'sync',
      title: 'Hospital Network Sync',
      desc: 'Seamless integration with hospital management systems for instant inventory sync and automated reordering.',
      icon: ShieldCheck,
      tag: 'Direct Hospital System Sync',
    },
    {
      id: 'hipaa',
      title: 'HIPAA Compliant',
      desc: 'Bank-grade encryption for donor records, hospital requests, and patient transfusion data.',
      icon: Lock,
      tag: 'Certified Data Encryption',
    },
  ];

  return (
    <section id="for-hospitals" className="py-24 px-6 md:px-20 bg-black relative border-t border-white/10 overflow-hidden">
      {/* Pure Purple ambient background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

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
            Hospital Portal & <span className="font-serif italic font-normal text-purple-400">Emergency Network.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-neutral-400 text-base md:text-lg leading-relaxed text-balance"
          >
            Empower emergency rooms, intensive care units, and blood bank directors with real-time blood stock management, emergency dispatches, and cold-chain compliance.
          </motion.p>
        </div>

        {/* Feature Cards Grid - Staggered Scroll Entrance Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch mb-16">
          {hospitalFeatures.map((feat, index) => {
            const FeatIcon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex"
              >
                <SpotlightCard
                  spotlightColor="rgba(168, 85, 247, 0.18)"
                  className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl"
                >
                  <div className="flex-1 flex flex-col justify-between group">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                        <FeatIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{feat.tag}</span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Hospital WebApp Callout Card - Animated Scroll Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.25)"
            className="w-full p-8 md:p-10 rounded-3xl bg-gradient-to-r from-purple-950/90 via-neutral-950 to-purple-950/90 border border-purple-500/50 shadow-2xl shadow-purple-950/50"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                  <Building2 className="w-4 h-4" />
                  Hospital Management Portal
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Connect Your Hospital to LifeVault</h3>
                <p className="text-xs text-neutral-300 max-w-lg leading-relaxed">
                  Access live regional blood vault inventories, place urgent transfusion orders, and manage your hospital’s blood bank reserves seamlessly.
                </p>
              </div>

              <InteractiveHoverButton
                variant="primary"
                icon={ArrowRight}
                onClick={onOpenHospitalModal}
                className="shrink-0 h-12 min-w-[210px]"
              >
                Open Hospital Portal
              </InteractiveHoverButton>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
