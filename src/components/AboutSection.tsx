import React from 'react';
import { ShieldCheck, Heart, Building2, Truck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 px-6 md:px-20 bg-neutral-950/90 border-t border-white/10 relative overflow-hidden">
      {/* Purple background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Bridging Hospitals, Blood Banks, and Donors{' '}
            <span className="font-serif italic text-purple-400">In Real Time.</span>
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            LifeVault was founded with a singular purpose: to eliminate blood shortages in emergency care. By uniting regional blood banks, hospital trauma units, and voluntary donors on one online platform, we ensure life-saving blood reaches patients without delay.
          </p>
        </div>

        {/* 4 Pillars Grid - Tight Padding & Zero Empty Space */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 text-center hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 w-fit mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">100% Voluntary Donors</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Engaging community donors with digital scheduling, instant compatibility guides, and life-impact updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 text-center hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hospital Network Sync</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Empowering hospital surgical units and ERs to view live blood bank inventories and order units instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 text-center hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mx-auto mb-4 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rapid Emergency Logistics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              15-minute emergency courier dispatch for critical trauma cases with real-time temperature tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 text-center hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mx-auto mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Medical Compliance</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cold-chain storage telemetry, certified donor screening protocols, and HIPAA-compliant data security.
            </p>
          </div>
        </div>

        {/* Stats Row - Compact Padding */}
        <div className="p-8 rounded-2xl bg-neutral-950 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-2xl">
          <div>
            <div className="text-3xl font-bold font-mono text-white mb-1">120+</div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider">Partner Hospitals</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-purple-400 mb-1">45,000+</div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider">Blood Units Vaulted</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-purple-400 mb-1">99.8%</div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider">On-Time ER Delivery</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-red-400 mb-1">15 Mins</div>
            <div className="text-xs text-neutral-400 uppercase tracking-wider">Avg Dispatch Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};
