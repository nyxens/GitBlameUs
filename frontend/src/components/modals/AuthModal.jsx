import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Building2, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { loginUser } from '../../services/authService.js';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email) {
      await loginUser(formData.email, formData.password);
    }
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
          className="relative w-full max-w-md rounded-3xl bg-neutral-950 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Subtle elegant border line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Life<span className="font-serif italic font-normal text-white/80">Vault</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {authMode === 'signin' ? 'Sign In to Account' : 'Create Account'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Select your access role to continue
            </p>
          </div>

          {/* Role Selection Tabs - Clean Elegant Button Styles */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900/60 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('CITIZEN')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'CITIZEN'
                  ? 'bg-white/10 text-white font-bold border border-white/15 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Citizen / Donor</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('HOSPITAL')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'HOSPITAL'
                  ? 'bg-white/10 text-white font-bold border border-white/15 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital / Bank</span>
            </button>
          </div>

          {/* Quick Demo Instant Access Buttons */}
          <div className="mb-6 p-3.5 rounded-2xl bg-neutral-900/50 border border-white/10 text-xs">
            <div className="text-neutral-400 mb-2.5 font-medium flex items-center justify-between text-[11px]">
              <span>Quick Demo Access:</span>
              <span className="text-neutral-300 font-mono text-[10px]">Instant Sign In</span>
            </div>

            {selectedRole === 'CITIZEN' ? (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('CITIZEN')}
                className="w-full py-2 px-3.5 rounded-xl text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white">
                    O-
                  </div>
                  <span>Sarah Jenkins (Donor)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('HOSPITAL')}
                className="w-full py-2 px-3.5 rounded-xl text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 flex items-center justify-between text-xs font-semibold cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Dr. Marcus Vance (St. Jude ER)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-neutral-950 px-3 text-[10px] text-neutral-500 font-mono uppercase">
              Or Enter Credentials
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
                  <UserIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  defaultValue="12345678"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {selectedRole === 'CITIZEN' && authMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
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
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 font-mono transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer group shadow-sm"
            >
              <span>
                {authMode === 'signin'
                  ? `Sign In as ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'}`
                  : `Create ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'} Account`}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                  Don't have an account? <strong className="text-white underline underline-offset-4">Sign Up</strong>
                </span>
              ) : (
                <span>
                  Already have an account? <strong className="text-white underline underline-offset-4">Sign In</strong>
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
