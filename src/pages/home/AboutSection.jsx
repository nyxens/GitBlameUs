import React from 'react';
import { ShieldCheck, Heart, Building2, Truck } from 'lucide-react';
import { SpotlightCard } from '@ui/index';

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 md:px-20 bg-black border-t border-white/10 relative overflow-hidden">
      {/* Purple background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Bridging Hospitals, Blood Banks, and Donors{' '}
            <span className="font-serif italic font-normal text-purple-400">In Real Time.</span>
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed text-balance">
            LifeVault was founded with a singular purpose: to eliminate blood shortages in emergency care. By uniting regional blood banks, hospital trauma units, and voluntary donors on one online platform, we ensure life-saving blood reaches patients without delay.
          </p>
        </div>

        {/* 4 Pillars Grid - SpotlightCard Design Matching Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch mb-16">
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.15)"
            className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl text-center group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Voluntary Donors</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Engaging community donors with digital scheduling, instant compatibility guides, and life-impact updates.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.18)"
            className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl text-center group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hospital Network Sync</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Empowering hospital surgical units and ERs to view live blood bank inventories and order units instantly.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.18)"
            className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl text-center group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rapid Emergency Logistics</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                15-minute emergency courier dispatch for critical trauma cases with real-time temperature tracking.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(168, 85, 247, 0.18)"
            className="w-full flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative shadow-2xl text-center group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Medical Compliance</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cold-chain storage telemetry, certified donor screening protocols, and HIPAA-compliant data security.
              </p>
            </div>
          </SpotlightCard>
        </div>

        {/* Stats Card - SpotlightCard Design Matching Pricing */}
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
      </div>
    </section>
  );
};
