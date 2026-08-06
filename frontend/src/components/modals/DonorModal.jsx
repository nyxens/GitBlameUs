import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, MapPin, CheckCircle2, User, Phone, Mail, ShieldCheck } from 'lucide-react';

export const DonorModal = ({ isOpen, onClose }) => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'New York Central Hub',
    date: '2026-08-05',
    time: '10:00 AM',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('success');
  };

  const handleReset = () => {
    setStep('form');
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
          {/* Top red glow accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 'form' ? (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
                  <Heart className="w-6 h-6 fill-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Schedule Blood Donation</h3>
                  <p className="text-xs text-neutral-400">Save up to 3 lives with a single donation</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Select Blood Group */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Select Your Blood Group
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodGroups.map((group) => (
                      <button
                        type="button"
                        key={group}
                        onClick={() => setBloodGroup(group)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                          bloodGroup === group
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/50 scale-[1.03]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Preferred Location & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Blood Center Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500 appearance-none"
                      >
                        <option value="New York Central Hub">New York Central Hub</option>
                        <option value="Chicago General Vault">Chicago General Vault</option>
                        <option value="Los Angeles Metro Bank">Los Angeles Metro Bank</option>
                        <option value="Houston Life Center">Houston Life Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility check badge */}
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Must be 18+ years old, weigh over 50kg, and be in good health.</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Confirm Donation Appointment</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Appointment Confirmed!</h3>
              <p className="text-sm text-neutral-300 max-w-sm mx-auto mb-6 leading-relaxed">
                Thank you, <strong className="text-white">{formData.name || 'Donor'}</strong>. Your appointment for <strong className="text-red-400">{bloodGroup}</strong> donation at <strong className="text-white">{formData.city}</strong> has been scheduled for <strong className="text-white">{formData.date}</strong>.
              </p>

              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-left text-xs space-y-2 mb-6 font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Donor ID:</span>
                  <span className="text-white">#LV-DONOR-8821</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Blood Group:</span>
                  <span className="text-red-400 font-bold">{bloodGroup}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Location:</span>
                  <span className="text-white">{formData.city}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-xl border border-white/15 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
