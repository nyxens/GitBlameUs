import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Building2, ArrowRight } from 'lucide-react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDonor: () => void;
  onSelectHospital: () => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  onSelectDonor,
  onSelectHospital,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/15 p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Top accent glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-red-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to LifeVault</h3>
            <p className="text-xs text-neutral-400">Choose how you would like to proceed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hospital Portal Card */}
            <button
              onClick={() => {
                onClose();
                onSelectHospital();
              }}
              className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-500/60 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">For Hospitals</h4>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  Access the blood bank management webapp, connect with vaults, and request emergency blood.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                <span>Hospital Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Individual Donor Card */}
            <button
              onClick={() => {
                onClose();
                onSelectDonor();
              }}
              className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 hover:border-red-500/60 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 fill-red-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">For Donors</h4>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  Schedule a blood donation, check eligibility, and track your life-saving impact.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-red-400 group-hover:text-red-300">
                <span>Schedule Donation</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
