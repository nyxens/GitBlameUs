import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import {
  loginUser,
  signupUser,
  verifyOtpUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from '../../services/authService.js';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'CITIZEN',
}) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot-password'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset Password state
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'verify' | 'new-password' | 'success'
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hospitalName: '',
    licenseId: '',
  });

  // Resend OTP cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset states when modal role or mode changes
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setShowOtpVerify(false);
    setShowPassword(false);
    setOtpCode('');
    setPendingSignupData(null);
    if (authMode !== 'forgot-password') {
      setResetStep('request');
      setResetOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      setResetEmail((prev) => prev || formData.email || '');
    }
    if (authMode === 'signin' || authMode === 'signup') {
      setFormData((prev) => ({
        ...prev,
        password: '',
      }));
    }
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
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const signinRole = selectedRole === 'CITIZEN' ? 'DONOR' : 'HOSPITAL';
        const result = await loginUser(formData.email, formData.password, signinRole);
        if (result.success) {
          const authenticatedUser = {
            ...result.user,
            role: result.role || result.user?.role || signinRole,
          };
          onLoginSuccess(authenticatedUser);
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
            const verifiedUser = {
              ...result.user,
              role: result.role || result.user?.role || pendingSignupData?.role || 'DONOR',
            };
            onLoginSuccess(verifiedUser);
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (resetStep === 'request') {
        const targetEmail = (resetEmail || formData.email || '').trim();
        if (!targetEmail) {
          setErrorMsg('Please enter your email address');
          setLoading(false);
          return;
        }
        const result = await forgotPassword(targetEmail);
        if (result.success) {
          setResetEmail(targetEmail);
          setResetStep('verify');
          setResetOtp('');
          setResendCooldown(30);
          setSuccessMsg(`Verification code sent to ${targetEmail}`);
        } else {
          setErrorMsg(result.error || 'Failed to send verification code');
        }
      } else if (resetStep === 'verify') {
        const cleanedOtp = resetOtp.trim();
        if (!cleanedOtp || cleanedOtp.length !== 6) {
          setErrorMsg('Please enter the 6-digit OTP code');
          setLoading(false);
          return;
        }
        const result = await verifyResetOtp(resetEmail.trim(), cleanedOtp);
        if (result.success) {
          setResetToken(result.resetToken);
          setResetStep('new-password');
          setSuccessMsg('Identity verified! Please set your new password.');
        } else {
          setErrorMsg(result.error || 'Invalid or expired verification code');
        }
      } else if (resetStep === 'new-password') {
        if (!newPassword || newPassword.length < 6) {
          setErrorMsg('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await resetPassword(resetEmail.trim(), resetToken, newPassword);
        if (result.success) {
          setResetStep('success');
          setSuccessMsg('');
        } else {
          setErrorMsg(result.error || 'Failed to reset password');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const result = await forgotPassword(resetEmail.trim());
      if (result.success) {
        setSuccessMsg(`A new verification OTP code has been sent to ${resetEmail.trim()}`);
        setResendCooldown(30);
      } else {
        setErrorMsg(result.error || 'Failed to resend verification code');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend code');
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
              {authMode === 'signin'
                ? 'Welcome Back'
                : authMode === 'signup'
                ? 'Create an Account'
                : resetStep === 'verify'
                ? 'Verify Your Identity'
                : resetStep === 'new-password'
                ? 'Set New Password'
                : resetStep === 'success'
                ? 'Password Reset Complete'
                : 'Reset Password'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {authMode === 'forgot-password' ? (
                resetStep === 'request'
                  ? 'Enter your registered email to receive an OTP'
                  : resetStep === 'verify'
                  ? `Enter the 6-digit OTP code sent to ${resetEmail}`
                  : resetStep === 'new-password'
                  ? 'Identity verified. Create a new secure password'
                  : resetStep === 'success'
                  ? 'Your password was updated successfully'
                  : ''
              ) : showOtpVerify ? (
                'Please enter the 6-digit OTP code'
              ) : (
                'Select access role below to continue'
              )}
            </p>
          </div>

          {/* Role Selection Tabs (Only on Sign In / Sign Up, not on Forgot Password) */}
          {!showOtpVerify && authMode !== 'forgot-password' && (
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

          {/* Success Message Box */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* FORGOT PASSWORD WORKFLOW                             */}
          {/* ---------------------------------------------------- */}
          {authMode === 'forgot-password' ? (
            resetStep === 'success' ? (
              <div className="text-center py-3 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Password Updated!</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                    Your password has been changed successfully. You can now log in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setFormData((prev) => ({ ...prev, email: resetEmail, password: '' }));
                    setResetStep('request');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-500 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : resetStep === 'new-password' ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 disabled:cursor-not-allowed border-2 border-purple-500/50 hover:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </form>
            ) : resetStep === 'verify' ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    6-Digit Verification Code (sent to {resetEmail})
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter 6-digit OTP"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-mono tracking-widest text-center transition-all"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep('request');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change email</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-purple-400 hover:text-purple-300 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length !== 6}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 disabled:cursor-not-allowed border-2 border-purple-500/50 hover:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // resetStep === 'request'
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700/50 disabled:cursor-not-allowed border-2 border-purple-500/50 hover:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            /* ---------------------------------------------------- */
            /* SIGN IN / SIGN UP FORMS                              */
            /* ---------------------------------------------------- */
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-neutral-400">Password</label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot-password');
                            setResetStep('request');
                            setResetEmail(formData.email || '');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                      </button>
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
          )}

          {/* Bottom Switcher: Between Sign In and Sign Up */}
          {!showOtpVerify && authMode !== 'forgot-password' && (
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

          {/* Bottom Switcher: In Forgot Password -> Back to Sign In */}
          {authMode === 'forgot-password' && resetStep !== 'success' && (
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  Remember your password?{' '}
                  <strong className="text-purple-400 hover:text-purple-300 underline underline-offset-4 font-bold ml-1">
                    Sign In
                  </strong>
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
