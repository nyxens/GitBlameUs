import React from 'react';
import { Building2, ShieldCheck, Activity, Truck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HospitalSectionProps {
  onOpenHospitalModal: () => void;
}

export const HospitalSection: React.FC<HospitalSectionProps> = ({ onOpenHospitalModal }) => {
  return (
    <section id="for-hospitals" className="py-24 px-6 md:px-20 bg-black relative border-t border-white/10 overflow-hidden">
      {/* Pure Purple ambient background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Seamless Header Block */}
        <div className="max-w-3xl mb-14">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Hospital Portal & <span className="font-serif italic text-purple-400">Emergency Network.</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
            Empower emergency rooms, intensive care units, and blood bank directors with real-time blood stock management, emergency dispatches, and cold-chain compliance.
          </p>
        </div>

        {/* Feature Cards Grid - Pure Dark Purple Look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mb-4 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Emergency Dispatch</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Order urgent blood units for trauma cases with 15-minute dispatch response times across regional vaults.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real-time Courier Tracking</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cold-Chain Telemetry</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automated temperature monitoring (2°C - 6°C) for blood refrigerators with instant anomaly alerts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Automated Compliance Logs</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Hospital Network Sync</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Seamless integration with hospital management systems for instant inventory sync and automated reordering.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Direct Hospital System Sync</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit mb-4 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">HIPAA Compliant Security</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Bank-grade encryption for donor records, hospital requests, and patient transfusion data.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Certified Data Encryption</span>
            </div>
          </div>
        </div>

        {/* Hospital WebApp Callout Card - Pure Dark Purple */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-950/90 via-neutral-950 to-purple-950/90 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-purple-950/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4" />
              Hospital Management Portal
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Hospital to LifeVault</h3>
            <p className="text-xs text-neutral-300 max-w-lg leading-relaxed">
              Access live regional blood vault inventories, place urgent transfusion orders, and manage your hospital’s blood bank reserves seamlessly.
            </p>
          </div>

          <button
            onClick={onOpenHospitalModal}
            className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2"
          >
            <span>Hospital Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
