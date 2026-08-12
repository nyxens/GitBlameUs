import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Activity, FileText, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpotlightCard, InteractiveHoverButton } from '@ui/index';

export const HospitalSection = ({ onOpenHospitalModal }) => {
  const hospitalFeatures = [
    {
      id: 'requisition',
      title: 'Instant Requisitions',
      desc: 'Submit urgent blood reserve requests digitally from ERs and ICUs directly to the blood bank inventory system.',
      icon: FileText,
      tag: 'Real-Time Requisitions',
    },
    {
      id: 'telemetry',
      title: 'Cold-Chain Telemetry',
      desc: 'Automated temperature logging (2°C - 6°C) for blood bank refrigerators with instant threshold breach alerts.',
      icon: Activity,
      tag: 'Automated Compliance',
    },
    {
      id: 'sync',
      title: 'EMR System Sync',
      desc: 'Seamless integration with hospital information systems (HIS/EMR) for real-time inventory visibility and stock level alerts.',
      icon: ShieldCheck,
      tag: 'Direct System Integration',
    },
    {
      id: 'hipaa',
      title: 'HIPAA Data Security',
      desc: 'Bank-grade encryption and audit logs for donor records, hospital requisitions, and patient transfusion data.',
      icon: Lock,
      tag: 'Certified Data Security',
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
            Hospital & Blood Bank <span className="font-serif italic font-normal text-purple-400">Management System.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-neutral-400 text-base md:text-lg leading-relaxed text-balance"
          >
            Empower emergency rooms, intensive care units, and blood bank directors with real-time inventory management, instant digital requisitions, and cold-chain compliance logging.
          </motion.p>
        </div>

        {/* Feature Cards Grid - Enlarged & Generously Spaced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch mb-16">
          {hospitalFeatures.map((feat, index) => {
            const FeatIcon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex h-full"
              >
                <SpotlightCard
                  spotlightColor="rgba(168, 85, 247, 0.18)"
                  className="w-full h-full flex flex-col justify-between p-8 md:p-9 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl min-h-[290px]"
                >
                  <div className="h-full flex flex-col justify-between group">
                    <div className="mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                        <FeatIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 leading-snug">{feat.title}</h3>
                      <p className="text-xs md:text-sm text-neutral-400 leading-relaxed pb-4">{feat.desc}</p>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/10 flex items-center gap-2 text-xs text-purple-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{feat.tag}</span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Hospital WebApp Callout Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.15)"
            className="w-full p-8 md:p-10 rounded-3xl bg-neutral-950/90 border border-purple-500/20 backdrop-blur-xl shadow-xl hover:border-purple-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                  <Building2 className="w-4 h-4" />
                  Hospital Management Software
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Access the LifeVault Management Portal</h3>
                <p className="text-xs text-neutral-300 max-w-lg leading-relaxed">
                  Monitor real-time blood bank reserves, manage hospital requisitions, and maintain automated cold-chain compliance logs seamlessly.
                </p>
              </div>

              <InteractiveHoverButton
                variant="primary"
                icon={ArrowRight}
                onClick={onOpenHospitalModal}
                className="shrink-0 h-12 min-w-[210px]"
              >
                Launch Hospital Portal
              </InteractiveHoverButton>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};

export default HospitalSection;
