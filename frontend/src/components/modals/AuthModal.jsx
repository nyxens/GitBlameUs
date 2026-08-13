import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Building2, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'CITIZEN',
}) => {
  const [authMode, setAuthMode] = useState('signin');
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Form State (Purely local frontend state, not wired to backend)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bloodGroup: 'O+',
    hospitalName: 'St. Jude Emergency Center',
    licenseId: 'HOSP-NY-9042',
  });

  const handleQuickDemoLogin = (role) => {
    let demoUser;
    if (role === 'CITIZEN') {
      demoUser = {
        id: 'LV-DONOR-8821',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        role: 'CITIZEN',
        phone: '+1 (555) 234-5678',
        bloodGroup: 'O-',
        city: 'New York Central',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
    } else if (role === 'HOSPITAL') {
      demoUser = {
        id: 'HOSP-USER-9042',
        name: 'Dr. Marcus Vance',
        email: 'm.vance@stjudehospital.org',
        role: 'HOSPITAL',
        phone: '+1 (555) 904-2200',
        hospitalName: 'St. Jude General Hospital',
        licenseId: 'HOSP-NY-9042',
        city: 'New York',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      };
    } else {
      demoUser = {
        id: 'BBA-ADMIN-1001',
        name: 'Elena Rostova',
        email: 'elena@lifevault.org',
        role: 'BBA',
        phone: '+1 (555) 888-1000',
        city: 'Metro Hub',
      };
    }

    onLoginSuccess(demoUser);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: selectedRole === 'CITIZEN' ? `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}` : `HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name || (selectedRole === 'CITIZEN' ? 'John Doe' : formData.hospitalName),
      email: formData.email || 'user@lifevault.org',
      role: selectedRole,
      phone: formData.phone || '+1 (555) 000-0000',
      bloodGroup: formData.bloodGroup,
      hospitalName: formData.hospitalName,
      licenseId: formData.licenseId,
      city: 'New York',
    };
    onLoginSuccess(newUser);
    onClose();
  };

  if (!isOpen) return null;

  // Landing Page Role Theme Palettes
  const roleThemes = {
    CITIZEN: {
      accentGradient: 'from-red-600 via-rose-500 to-amber-500',
      glowBg: 'bg-red-600/20',
      borderAccent: 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]',
      tabActive: 'bg-gradient-to-r from-red-600/30 to-rose-600/20 text-white font-bold border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      buttonBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-950/60 border-red-400/40',
      focusRing: 'focus:border-red-500/60 focus:ring-red-500/20',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      iconColor: 'text-red-400',
    },
    HOSPITAL: {
      accentGradient: 'from-purple-600 via-indigo-500 to-blue-500',
      glowBg: 'bg-purple-600/20',
      borderAccent: 'border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]',
      tabActive: 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white font-bold border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      buttonBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-950/60 border-purple-400/40',
      focusRing: 'focus:border-purple-500/60 focus:ring-purple-500/20',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  };

  const currentTheme = roleThemes[selectedRole] || roleThemes.CITIZEN;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-md rounded-3xl bg-neutral-950/95 border ${currentTheme.borderAccent} p-6 md:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto backdrop-blur-2xl transition-colors duration-500`}
        >
          {/* Dynamic Ambient Background Color Orb matching Landing Theme */}
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${currentTheme.glowBg} blur-[90px] pointer-events-none transition-all duration-700`} />
          <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full ${currentTheme.glowBg} blur-[90px] pointer-events-none transition-all duration-700`} />

          {/* Glowing Top Accent Border Line */}
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${currentTheme.accentGradient} transition-all duration-500`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                Life<span className="font-serif italic font-normal text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">Vault</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <span>{authMode === 'signin' ? 'Sign In to Portal' : 'Create New Account'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select your system role to access tailored telemetry & services
            </p>
          </div>

          {/* Role Selection Tabs with Radiant Theme Colors */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-900/80 rounded-2xl border border-white/10 mb-6 backdrop-blur-md relative z-10">
            <button
              type="button"
              onClick={() => setSelectedRole('CITIZEN')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                selectedRole === 'CITIZEN'
                  ? roleThemes.CITIZEN.tabActive
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${selectedRole === 'CITIZEN' ? 'fill-red-500 text-red-500' : ''}`} />
              <span>Citizen / Donor</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('HOSPITAL')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                selectedRole === 'HOSPITAL'
                  ? roleThemes.HOSPITAL.tabActive
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${selectedRole === 'HOSPITAL' ? 'text-purple-400' : ''}`} />
              <span>Hospital / Bank</span>
            </button>
          </div>

          {/* Quick Demo Instant Access Buttons */}
          <div className={`mb-6 p-4 rounded-2xl bg-neutral-900/70 border ${currentTheme.borderAccent} text-xs backdrop-blur-md relative z-10 transition-colors duration-300`}>
            <div className="text-neutral-400 mb-2.5 font-medium flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                <Sparkles className={`w-3.5 h-3.5 ${currentTheme.iconColor}`} />
                <span>Instant Demo Access:</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${currentTheme.badgeBg}`}>
                No Backend Call Needed
              </span>
            </div>

            {selectedRole === 'CITIZEN' ? (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CITIZEN')}
                className="w-full py-2.5 px-3.5 rounded-xl text-neutral-200 hover:text-white bg-gradient-to-r from-red-950/40 to-neutral-900/80 hover:from-red-900/50 hover:to-neutral-800/80 border border-red-500/30 transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-400 shadow-sm">
                    O-
                  </div>
                  <span className="text-white font-medium">Sarah Jenkins (Donor)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('HOSPITAL')}
                className="w-full py-2.5 px-3.5 rounded-xl text-neutral-200 hover:text-white bg-gradient-to-r from-purple-950/40 to-neutral-900/80 hover:from-purple-900/50 hover:to-neutral-800/80 border border-purple-500/30 transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold text-purple-400 shadow-sm">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white font-medium">Dr. Marcus Vance (St. Jude ER)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6 relative z-10">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-neutral-950 px-3 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
              Or Enter Credentials
            </span>
          </div>

          {/* Main Auth Form (Pure Frontend Client-Side State) */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {selectedRole === 'CITIZEN' ? 'Full Name' : 'Hospital / Organization Name'}
                </label>
                <div className="relative">
                  <UserIcon className={`w-4 h-4 ${currentTheme.iconColor} absolute left-3 top-3`} />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'CITIZEN' ? 'John Doe' : 'St. Jude Emergency Center'}
                    value={selectedRole === 'CITIZEN' ? formData.name : formData.hospitalName}
                    onChange={(e) =>
                      selectedRole === 'CITIZEN'
                        ? setFormData({ ...formData, name: e.target.value })
                        : setFormData({ ...formData, hospitalName: e.target.value })
                    }
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none ${currentTheme.focusRing} focus:ring-2 transition-all`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className={`w-4 h-4 ${currentTheme.iconColor} absolute left-3 top-3`} />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none ${currentTheme.focusRing} focus:ring-2 transition-all`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className={`w-4 h-4 ${currentTheme.iconColor} absolute left-3 top-3`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  defaultValue="12345678"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none ${currentTheme.focusRing} focus:ring-2 transition-all`}
                />
              </div>
            </div>

            {selectedRole === 'CITIZEN' && authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-white focus:outline-none ${currentTheme.focusRing} focus:ring-2 transition-all`}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg} className="bg-neutral-900 text-white">
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedRole === 'HOSPITAL' && authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Medical License ID</label>
                <input
                  type="text"
                  required
                  value={formData.licenseId}
                  onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/15 text-xs text-white focus:outline-none ${currentTheme.focusRing} focus:ring-2 font-mono transition-all`}
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-white ${currentTheme.buttonBg} border transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer group tracking-wide mt-2`}
            >
              <span>
                {authMode === 'signin'
                  ? `Sign In as ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'}`
                  : `Create ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'} Account`}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center mt-6 pt-4 border-t border-white/10 relative z-10">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {authMode === 'signin' ? (
                <span>
                  Don't have an account? <strong className="text-white underline underline-offset-4 font-semibold">Sign Up</strong>
                </span>
              ) : (
                <span>
                  Already have an account? <strong className="text-white underline underline-offset-4 font-semibold">Sign In</strong>
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
