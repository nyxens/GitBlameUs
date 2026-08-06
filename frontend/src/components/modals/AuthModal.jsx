import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Building2, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'CITIZEN',
}) => {
  const [authMode, setAuthMode] = useState('signin');
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Form State
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/15 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Accent glow bar */}
          <div
            className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
              selectedRole === 'CITIZEN'
                ? 'from-red-600 via-pink-500 to-red-600'
                : 'from-purple-600 via-indigo-500 to-purple-600'
            }`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-extrabold text-white font-brand">
                Life<span className="font-serif italic font-normal text-purple-400">Vault</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {authMode === 'signin' ? 'Sign In to LifeVault' : 'Create Your LifeVault Account'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select your role to access your dedicated workspace
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 rounded-xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('CITIZEN')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'CITIZEN'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Citizen / Donor</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('HOSPITAL')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'HOSPITAL'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital / Bank</span>
            </button>
          </div>

          {/* Quick Demo Instant Access Buttons */}
          <div className="mb-6 p-4 rounded-xl bg-neutral-900/90 border border-white/10 text-xs">
            <div className="text-neutral-400 mb-2 font-medium flex items-center justify-between">
              <span>⚡ One-Click Instant Demo Login:</span>
              <span className="text-emerald-400 font-mono">NO PASSWORD NEEDED</span>
            </div>

            {selectedRole === 'CITIZEN' ? (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CITIZEN')}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-white font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">
                    O-
                  </div>
                  <span>Login as Sarah Jenkins (Donor O- Negative)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('HOSPITAL')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-white font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Launch WebApp as Dr. Vance (St. Jude ER)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-neutral-950 px-3 text-[11px] text-neutral-500 font-mono uppercase">
              Or Enter Details
            </span>
          </div>

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {selectedRole === 'CITIZEN' ? 'Full Name' : 'Hospital / Organization Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  defaultValue="12345678"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {selectedRole === 'CITIZEN' && authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedRole === 'HOSPITAL' && authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Medical License ID</label>
                <input
                  type="text"
                  required
                  value={formData.licenseId}
                  onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'CITIZEN'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-950/60'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/60'
              }`}
            >
              <span>
                {authMode === 'signin'
                  ? `Sign In as ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'}`
                  : `Create ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {authMode === 'signin' ? (
                <span>
                  Don't have an account? <strong className="text-purple-400">Sign Up</strong>
                </span>
              ) : (
                <span>
                  Already have an account? <strong className="text-purple-400">Sign In</strong>
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
