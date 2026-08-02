import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Sparkles, Building2, Droplet, ArrowRight } from 'lucide-react';
import { SpotlightCard, InteractiveHoverButton } from '@ui/index';

export const PricingSection = ({ onOpenAuthModal }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingTiers = [
    {
      id: 'community',
      name: 'Community Center',
      tagline: 'Ideal for local clinics and single-site community blood banks.',
      monthlyPrice: 149,
      annualPrice: 119,
      popular: false,
      icon: Droplet,
      accentColor: 'border-purple-500/20 hover:border-purple-500/50',
      buttonVariant: 'secondary',
      features: [
        'Up to 1,000 active blood units tracked',
        'Standard FEFO expiration queueing',
        'Citizen donor scheduling & SMS alerts',
        'Basic cold-chain temp logs (1–4°C)',
        'Standard emergency stock lookups',
        'Email & community support (24hr SLA)',
      ],
    },
    {
      id: 'regional',
      name: 'Regional Health Hub',
      tagline: 'Built for multi-facility blood networks & trauma centers.',
      monthlyPrice: 499,
      annualPrice: 399,
      popular: true,
      icon: Sparkles,
      accentColor: 'border-purple-500/60 hover:border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.25)]',
      buttonVariant: 'primary',
      features: [
        'Unlimited active blood unit volume',
        'Automated FEFO dispatch queueing',
        'IoT cold-chain telemetry (4-locker)',
        'Emergency cross-match portal',
        'Instant multi-hospital stock sync',
        '24/7 Priority Emergency Support',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Network',
      tagline: 'Infrastructure for statewide health systems & national registries.',
      monthlyPrice: 1299,
      annualPrice: 999,
      popular: false,
      icon: Building2,
      accentColor: 'border-red-500/40 hover:border-red-400/80',
      buttonVariant: 'danger',
      features: [
        'Multi-region blood bank federation',
        'AI blood demand forecasting',
        'HL7 & FHIR EHR system integrations',
        'HIPAA & AABB compliance reports',
        'Custom cold-chain hardware webhooks',
        'Dedicated Technical Account Manager',
      ],
    },
  ];

  return (
    <section id="pricing" className="relative w-full py-24 bg-black overflow-hidden border-t border-white/10">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-900/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Plans Scaled for Every <span className="font-serif italic font-normal text-purple-400">Health Network.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-purple-200/80 leading-relaxed text-balance"
          >
            Zero hidden fees. Scale cold-chain storage compliance, FEFO inventory tracking, and emergency cross-hospital blood dispatching effortlessly.
          </motion.p>

          {/* Redesigned Themed Billing Toggle Switch (Zero Light Grey) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 inline-flex items-center p-1.5 rounded-full bg-black border border-purple-500/40 shadow-2xl relative select-none"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative z-10 px-6 py-2.5 rounded-full text-xs font-bold transition-colors duration-200 ${
                !isAnnual ? 'text-white' : 'text-purple-300/70 hover:text-white'
              }`}
            >
              {!isAnnual && (
                <motion.span
                  layoutId="pricingTabHighlight"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-purple-600 rounded-full z-[-1] shadow-lg shadow-purple-950/80"
                />
              )}
              Monthly Billing
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`relative z-10 px-6 py-2.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center gap-2 ${
                isAnnual ? 'text-white' : 'text-purple-300/70 hover:text-white'
              }`}
            >
              {isAnnual && (
                <motion.span
                  layoutId="pricingTabHighlight"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-purple-600 rounded-full z-[-1] shadow-lg shadow-purple-950/80"
                />
              )}
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/40">
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {pricingTiers.map((tier, index) => {
            const TierIcon = tier.icon;
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex flex-col pt-4"
              >
                {/* Floating MOST POPULAR Pill Tag Above the Card */}
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center gap-1.5 border border-purple-400 z-30">
                    <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <SpotlightCard
                  className={`w-full flex-1 flex flex-col justify-between p-8 rounded-3xl bg-neutral-950/90 border transition-all duration-300 ${tier.accentColor}`}
                >
                  {/* Card Content Top Section */}
                  <div className="flex-1 flex flex-col">
                    {/* Header Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <TierIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-xs text-purple-200/70 h-10 leading-relaxed mb-6">
                      {tier.tagline}
                    </p>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-white/10">
                      <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs text-purple-300 font-medium">/ month</span>
                      {isAnnual && (
                        <span className="ml-2 text-[11px] text-emerald-400 font-semibold">
                          (billed annually)
                        </span>
                      )}
                    </div>

                    {/* Feature Checklist */}
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-3 text-xs text-purple-100">
                          <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button - Perfectly Aligned at Bottom */}
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <InteractiveHoverButton
                      variant={tier.buttonVariant}
                      icon={ArrowRight}
                      onClick={() => onOpenAuthModal(tier.id === 'enterprise' ? 'HOSPITAL' : 'CITIZEN')}
                      className="w-full justify-center h-12"
                    >
                      {tier.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    </InteractiveHoverButton>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Guarantee Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 p-6 rounded-2xl bg-black border border-purple-500/30 flex flex-wrap items-center justify-around gap-6 text-center md:text-left shadow-xl"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">HIPAA & AABB Compliant</div>
              <div className="text-xs text-purple-200/70">Audited cold-chain logs for accreditation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">Instant Provisioning</div>
              <div className="text-xs text-purple-200/70">Deploy your hospital portal in under 10 minutes</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">Enterprise SLA</div>
              <div className="text-xs text-purple-200/70">99.99% operational uptime guaranteed</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
