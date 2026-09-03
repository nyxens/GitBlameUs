import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Lock, ShieldCheck, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authenticateHospital } from '../../services/hospitalService.js';

export const HospitalPortalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hospitalName, setHospitalName] = useState('St. Jude General Hospital');
  const [licenseId, setLicenseId] = useState('HOSP-NY-9042');
  const [showPasscode, setShowPasscode] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    await authenticateHospital(licenseId, hospitalName);
    setIsAuthenticated(true);
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    onClose();
  };

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
          {/* Top blue accent glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!isAuthenticated ? (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hospital & Blood Bank WebApp</h3>
                  <p className="text-xs text-neutral-400">Authorized Medical Organization Portal</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'signin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Hospital WebApp Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'register'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Register New Hospital
                </button>
              </div>

              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Hospital / Bank Name</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Medical License ID</label>
                    <input
                      type="text"
                      required
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Passcode / Access Key</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        required
                        defaultValue="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-2.5 top-2 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                        aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                      >
                        {showPasscode ? (
                          <EyeOff className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>HIPAA & Medical Compliance Verified Connection.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-950/60 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Hospital WebApp Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 space-y-3">
                    <h4 className="font-semibold text-white text-sm">Join the LifeVault Emergency Network</h4>
                    <p className="leading-relaxed">
                      Register your hospital, surgical center, or blood bank to gain instant access to regional blood reserves, cold-chain monitoring, and automated emergency dispatches.
                    </p>
                    <ul className="space-y-1 text-neutral-400">
                      <li>✓ Direct API for Automated Emergency Orders</li>
                      <li>✓ Cold-Chain Vault Storage Sync</li>
                      <li>✓ Regional Donor Fleet Coordination</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAuthenticated(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
                  >
                    Submit Hospital Onboarding Request
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Authenticated Successfully</h3>
              <p className="text-sm text-neutral-300 max-w-sm mx-auto mb-6 leading-relaxed">
                Welcome back, <strong className="text-white">{hospitalName}</strong> (<span className="text-blue-400 font-mono">{licenseId}</span>). You are now connected to the LifeVault Online Blood Bank WebApp.
              </p>

              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-left text-xs space-y-2 mb-6 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Network Node:</span>
                  <span className="text-white">NODE-EAST-01</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Vault Sync Status:</span>
                  <span className="text-emerald-400 font-bold">ONLINE (0ms latency)</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Access Live WebApp Dashboard Below
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
