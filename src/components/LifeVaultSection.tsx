import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldAlert, Droplets, Users, Activity, CheckCircle, RefreshCw, Send } from 'lucide-react';

export const LifeVaultSection: React.FC = () => {
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const bloodTypes = [
    { type: 'O-', units: 48, status: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    { type: 'O+', units: 210, status: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { type: 'A+', units: 185, status: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { type: 'A-', units: 62, status: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { type: 'B+', units: 140, status: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { type: 'B-', units: 35, status: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    { type: 'AB+', units: 92, status: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { type: 'AB-', units: 28, status: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
  ];

  const handleDispatch = (type: string) => {
    setDispatchStatus(`Emergency dispatch of 5 units of ${type} initiated to General Hospital Emergency Care.`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  return (
    <section id="lifevault" className="py-24 px-8 md:px-28 bg-black relative border-t border-white/10 overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
              LifeVault Blood Bank Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
              Smart Blood Bank Management & <span className="font-serif italic text-red-400">Live Telemetry.</span>
            </h2>
          </div>

          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
            LifeVault connects regional blood banks, donor networks, and emergency centers with real-time inventory monitoring and cold-chain precision.
          </p>
        </div>

        {/* Dispatch Notification Alert */}
        {dispatchStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
              <span className="text-sm font-medium">{dispatchStatus}</span>
            </div>
            <span className="text-xs text-red-400 font-mono">STATUS: DISPATCHED</span>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Inventory Card */}
          <div className="lg:col-span-2 rounded-2xl bg-neutral-950/90 border border-white/10 p-6 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-white">Real-Time Blood Supply Inventory</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500 animate-spin" />
                  <span>Syncing Live (2.4s)</span>
                </div>
              </div>

              {/* Grid of Blood Types */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {bloodTypes.map((item) => (
                  <div
                    key={item.type}
                    className={`p-4 rounded-xl border ${item.bg} flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer group`}
                    onClick={() => handleDispatch(item.type)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-white">{item.type}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.color} bg-black/40`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white mb-1">
                      {item.units} <span className="text-xs text-neutral-400 font-normal">units</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-white transition-colors">
                      <Send className="w-3 h-3 text-red-400" />
                      <span>Dispatch</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-4">
                <span>Total Vault Units: <strong className="text-white font-mono">800 Units</strong></span>
                <span>Cold Chain Temp: <strong className="text-emerald-400 font-mono">2.4°C</strong></span>
              </div>
              <div className="text-neutral-500 font-mono">Vault ID: #LV-BLOOD-9042</div>
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="flex flex-col gap-6">
            {/* Active Donor Network */}
            <div className="rounded-2xl bg-neutral-950/90 border border-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Donor Telemetry</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Registered Donors</span>
                    <span className="text-white font-mono font-semibold">14,280</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[78%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Repeat Donor Rate</span>
                    <span className="text-white font-mono font-semibold">68.4%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[68%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Hospital Fulfillment</span>
                    <span className="text-white font-mono font-semibold">99.2%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full w-[99%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 p-6 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  System Status
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">LifeVault Core Operational</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Automated notifications active for O-Negative & B-Negative donors. All regional blood storage lockers in sync.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>All 12 Regional Lockers Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
