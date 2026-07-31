import React, { useState } from 'react';
import { Heart, Calendar, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { AnimatedButton } from './AnimatedButton';

interface DonorSectionProps {
  onOpenDonorModal: () => void;
}

export const DonorSection: React.FC<DonorSectionProps> = ({ onOpenDonorModal }) => {
  const [selectedBloodType, setSelectedBloodType] = useState<string>('O-');

  const bloodCompatibility: Record<string, { canGiveTo: string[]; rarity: string }> = {
    'O-': { canGiveTo: ['Every Blood Type (Universal Donor)'], rarity: 'High Emergency Demand (7% of population)' },
    'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], rarity: 'Most Needed (37% of population)' },
    'A+': { canGiveTo: ['A+', 'AB+'], rarity: 'High Demand (34% of population)' },
    'A-': { canGiveTo: ['A+', 'A-', 'AB+', 'AB-'], rarity: 'Rare (6% of population)' },
    'B+': { canGiveTo: ['B+', 'AB+'], rarity: 'Moderate Demand (9% of population)' },
    'B-': { canGiveTo: ['B+', 'B-', 'AB+', 'AB-'], rarity: 'Rare (2% of population)' },
    'AB+': { canGiveTo: ['AB+ Only'], rarity: 'Universal Recipient (3% of population)' },
    'AB-': { canGiveTo: ['AB+', 'AB-'], rarity: 'Ultra Rare (1% of population)' },
  };

  return (
    <section id="for-donors" className="py-24 px-6 md:px-20 bg-neutral-950/80 relative border-t border-white/10 overflow-hidden">
      {/* Red ambient background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Seamless Header Block */}
        <div className="max-w-3xl mb-14">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Donate Blood. <span className="font-serif italic text-red-400">Save Lives.</span>
          </h2>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
            Every donation saves up to three lives. LifeVault makes scheduling a donation fast, convenient, and transparent with real-time tracking of where your blood goes.
          </p>
        </div>

        {/* 3 Step Donor Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)" className="rounded-2xl bg-neutral-950 border border-white/10 hover:border-red-500/50 shadow-xl">
            <div className="p-6 h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Check Eligibility</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Check your blood type compatibility, weight, and health requirements in under 60 seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-red-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Instant Digital Check</span>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)" className="rounded-2xl bg-neutral-950 border border-white/10 hover:border-red-500/50 shadow-xl">
            <div className="p-6 h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Book Appointment</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Choose a nearby certified LifeVault blood center or mobile donor drive with zero waiting time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-red-400 font-medium">
                <Calendar className="w-4 h-4" />
                <span>Flexible Time Slots</span>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)" className="rounded-2xl bg-neutral-950 border border-white/10 hover:border-red-500/50 shadow-xl">
            <div className="p-6 h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Track Impact</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Receive notifications when your donated blood is dispatched to emergency care to save a patient.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-red-400 font-medium">
                <Award className="w-4 h-4" />
                <span>Live Life-Saver Updates</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Interactive Blood Type Compatibility Tool */}
        <div className="p-8 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">Interactive Blood Compatibility Guide</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Select your blood type to see who your donation can help in urgent hospital cases.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(bloodCompatibility).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedBloodType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedBloodType === type
                      ? 'bg-red-600 border-red-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Selected Blood Group:</span>
                <span className="text-red-400 font-bold">{selectedBloodType}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Can Be Donated To:</span>
                <span className="text-white">{bloodCompatibility[selectedBloodType].canGiveTo.join(', ')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Rarity & Demand:</span>
                <span className="text-amber-400">{bloodCompatibility[selectedBloodType].rarity}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-red-950/40 border border-red-500/30 text-center min-w-[280px] shadow-lg">
            <Heart className="w-12 h-12 text-red-500 fill-red-500 animate-pulse mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Ready to Save a Life?</h4>
            <p className="text-xs text-neutral-300 mb-4">Book your appointment in 60 seconds</p>
            <AnimatedButton
              variant="danger"
              size="lg"
              onClick={onOpenDonorModal}
              className="w-full"
            >
              <span>Schedule Donation</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
};
