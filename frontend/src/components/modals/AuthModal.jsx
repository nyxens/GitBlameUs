import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Building2, Lock, Mail, User as UserIcon, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { loginUser, signupUser, verifyOtpUser } from '../../services/authService.js';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'CITIZEN',
}) => {
  const [authMode, setAuthMode] = useState('signin');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hospitalName: '',
    licenseId: '',
  });

  // Reset states when modal role or mode changes
  useEffect(() => {
    setErrorMsg('');
    setShowOtpVerify(false);
    setOtpCode('');
    setPendingSignupData(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      hospitalName: '',
      licenseId: '',
    });
  }, [authMode, selectedRole, isOpen]);

  // Handle prop changes
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const signinRole = selectedRole === 'CITIZEN' ? 'DONOR' : 'HOSPITAL';
        const result = await loginUser(formData.email, formData.password, signinRole);
        if (result.success) {
          onLoginSuccess(result.user);
          onClose();
        } else {
          setErrorMsg(result.error || 'Invalid credentials');
        }
      } else {
        // signup mode
        if (showOtpVerify) {
          // Verify OTP phase
          const result = await verifyOtpUser(formData.email, otpCode, pendingSignupData);
          if (result.success) {
            onLoginSuccess(result.user);
            onClose();
          } else {
            setErrorMsg(result.error || 'Invalid verification code');
          }
        } else {
          // Request signup phase
          const signupRole = selectedRole === 'CITIZEN' ? 'DONOR' : 'HOSPITAL';
          const signupData = {
            name: selectedRole === 'CITIZEN' ? formData.name : formData.hospitalName,
            email: formData.email,
            password: formData.password,
            role: signupRole,
            ...(selectedRole === 'HOSPITAL' ? { hospitalName: formData.hospitalName, licenseId: formData.licenseId } : {}),
          };

          const result = await signupUser(signupData);
          if (result.success) {
            setPendingSignupData(signupData);
            setShowOtpVerify(true);
          } else {
            setErrorMsg(result.error || 'Failed to sign up');
          }
        }
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="liquid-glass relative w-full max-w-md rounded-3xl bg-neutral-950/90 border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Glowing Top Ambient Accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-500/10 blur-[50px] pointer-events-none rounded-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand & Heading Header */}
          <div className="text-center mb-6 mt-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Life<span className="font-serif italic font-normal text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">Vault</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {showOtpVerify ? 'Please enter the 6-digit OTP code' : 'Select access role below to continue'}
            </p>
          </div>

          {/* Role Selection Tabs */}
          {!showOtpVerify && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900/60 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('CITIZEN')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'CITIZEN'
                    ? 'bg-purple-600/15 text-purple-300 font-bold border border-purple-500/30 shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${selectedRole === 'CITIZEN' ? 'text-purple-400' : 'text-neutral-400'}`} />
                <span>Citizen / Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('HOSPITAL')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'HOSPITAL'
                    ? 'bg-purple-600/15 text-purple-300 font-bold border border-purple-500/30 shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${selectedRole === 'HOSPITAL' ? 'text-purple-400' : 'text-neutral-400'}`} />
                <span>Hospital / Bank</span>
              </button>
            </div>
          )}

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form container */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && showOtpVerify ? (
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Verification OTP Code (sent to {formData.email})
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-mono tracking-widest text-center transition-all"
                    maxLength={6}
                  />
                </div>
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerify(false);
                      setOtpCode('');
                      setErrorMsg('');
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                  >
                    Back to Signup
                  </button>
                </div>
              </div>
            ) : (
              <>
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">
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
                          handleInputChange(
                            selectedRole === 'CITIZEN' ? 'name' : 'hospitalName',
                            e.target.value
                          )
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {selectedRole === 'HOSPITAL' && authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Medical License ID</label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="HOSP-NY-9042"
                        value={formData.licenseId}
                        onChange={(e) => handleInputChange('licenseId', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-mono transition-all"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 disabled:cursor-not-allowed border-2 border-purple-500/50 hover:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'signin'
                      ? `Sign In as ${selectedRole === 'CITIZEN' ? 'Citizen' : 'Hospital'}`
                      : showOtpVerify
                      ? 'Verify Email & Create Account'
                      : `Request Verification Code`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle authentication mode link */}
          {!showOtpVerify && (
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {authMode === 'signin' ? (
                  <span>
                    Don't have an account? <strong className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-bold ml-1">Sign Up</strong>
                  </span>
                ) : (
                  <span>
                    Already have an account? <strong className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-bold ml-1">Sign In</strong>
                  </span>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
