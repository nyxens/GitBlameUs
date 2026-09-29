import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandHeart,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Building2,
  Droplets,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  ChevronDown,
  Loader2,
  Send,
  X,
  SlidersHorizontal,
  Ban,
  ArrowUpDown,
  Syringe,
} from 'lucide-react';
import {
  getDonorProfile,
  getActiveRequest,
  getNearbyInstitutions,
  applyDonationRequest,
  cancelDonationRequest,
} from '../../services/giverService.js';

const STATUS_CONFIG = {
  NOT_VERIFIED: {
    label: 'Awaiting Verification',
    icon: Clock,
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    bannerClass: 'border-amber-500/40 bg-amber-950/30',
  },
  VERIFIED: {
    label: 'Verified — Awaiting Hospital',
    icon: ShieldCheck,
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    bannerClass: 'border-emerald-500/40 bg-emerald-950/30',
  },
  PENDING: {
    label: 'Pending Hospital Review',
    icon: Clock,
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    bannerClass: 'border-blue-500/40 bg-blue-950/30',
  },
  ACCEPTED: {
    label: 'Appointment Scheduled',
    icon: CalendarCheck,
    className: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    bannerClass: 'border-purple-500/40 bg-purple-950/30',
  },
  COMPLETED: {
    label: 'Donation Completed',
    icon: CheckCircle2,
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    bannerClass: 'border-emerald-500/40 bg-emerald-950/30',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
    bannerClass: 'border-red-500/40 bg-red-950/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: Ban,
    className: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30',
    bannerClass: 'border-neutral-500/40 bg-neutral-950/30',
  },
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RADIUS_OPTIONS = [
  { label: 'Any Distance', value: '' },
  { label: '≤ 5 km zone', value: '5' },
  { label: '≤ 10 km zone', value: '10' },
  { label: '≤ 25 km zone', value: '25' },
  { label: '≤ 50 km zone', value: '50' },
];
const TYPE_OPTIONS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Hospitals Only', value: 'HOSPITAL' },
  { label: 'Blood Banks Only', value: 'BLOOD_BANK' },
];
const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];

// ─── Confirm Request Modal ───────────────────────────────────────────────────
function ConfirmRequestModal({ institution, formData, onConfirm, onClose, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl bg-neutral-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent rounded-t-3xl" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Confirm Donation Request</h3>
            <p className="text-xs text-neutral-400">Review details before submitting</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4 space-y-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${
            institution.institution_type === 'HOSPITAL'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
              : 'bg-red-500/15 text-red-400 border border-red-500/25'
          }`}>
            {institution.institution_type === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'}
          </span>
          <p className="text-sm font-bold text-white">{institution.name}</p>
          <p className="text-xs text-neutral-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Pincode: {institution.pincode}
          </p>
          {institution.phone && (
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {institution.phone}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-5 space-y-1.5">
          <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-2">Your Details</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-300">
            <span className="text-neutral-500">Name</span><span className="text-white font-medium">{formData.name || '—'}</span>
            <span className="text-neutral-500">Blood Group</span><span className="text-red-400 font-bold">{formData.bloodgroup || '—'}</span>
            <span className="text-neutral-500">Pincode</span><span>{formData.pincode || '—'}</span>
            {formData.preferred_date && (
              <><span className="text-neutral-500">Preferred Date</span><span>{formData.preferred_date}</span></>
            )}
          </div>
          {formData.donor_notes && (
            <p className="text-xs text-neutral-400 mt-2 italic">"{formData.donor_notes}"</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 border border-purple-500/50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Submit Request</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Institution Card ────────────────────────────────────────────────────────
function InstitutionCard({ inst, onRequest, disabled }) {
  const isHospital = inst.institution_type === 'HOSPITAL';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
        disabled
          ? 'border-white/5 bg-neutral-950/40 opacity-60'
          : 'border-white/10 bg-neutral-950/70 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isHospital ? 'bg-blue-500/15 border border-blue-500/20' : 'bg-red-500/15 border border-red-500/20'
          }`}>
            {isHospital
              ? <Building2 className="w-4 h-4 text-blue-400" />
              : <Droplets className="w-4 h-4 text-red-400" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{inst.name}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
              isHospital ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {isHospital ? 'Hospital' : 'Blood Bank'}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-neutral-500 mb-0.5">Proximity</div>
          <div className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
            inst.distance_score === 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : inst.distance_score < 500
              ? 'bg-blue-500/15 text-blue-400'
              : inst.distance_score < 2000
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-neutral-500/15 text-neutral-400'
          }`}>
            {inst.distance_score === 0 ? 'Same Area' : `Δ ${inst.distance_score}`}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 shrink-0 text-neutral-600" />
          <span>Pincode: <span className="text-neutral-300 font-mono">{inst.pincode}</span></span>
        </div>
        {inst.address && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 shrink-0 text-neutral-600 mt-0.5" />
            <span className="text-neutral-400">{inst.address}</span>
          </div>
        )}
        {inst.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0 text-neutral-600" />
            <span>{inst.phone}</span>
          </div>
        )}
        {inst.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 shrink-0 text-neutral-600" />
            <span>{inst.email}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => !disabled && onRequest(inst)}
        disabled={disabled}
        className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          disabled
            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5'
            : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/50 cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
        }`}
      >
        <Send className="w-3.5 h-3.5" />
        {disabled ? 'Request Unavailable' : 'Send Donation Request'}
      </button>
    </motion.div>
  );
}

// ─── Main GiverPage ──────────────────────────────────────────────────────────
export const GiverPage = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', bloodgroup: '', pincode: '', preferred_date: '', donor_notes: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [radiusFilter, setRadiusFilter] = useState('');
  const [sortBy, setSortBy] = useState('proximity');

  useEffect(() => {
    async function init() {
      setProfileLoading(true);
      try {
        const [profileRes, activeRes] = await Promise.all([
          getDonorProfile(),
          getActiveRequest(),
        ]);
        if (profileRes?.success && profileRes.data) {
          const p = profileRes.data;
          setFormData(prev => ({
            ...prev,
            name: p.name || '',
            phone: p.phone || '',
            bloodgroup: p.bloodgroup || '',
            pincode: p.pincode || '',
          }));
        }
        if (activeRes?.success) setActiveRequest(activeRes.data);
      } catch (e) {
        console.error('Giver init error:', e);
      } finally {
        setProfileLoading(false);
      }
    }
    init();
  }, [user]);

  const handleFormChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSearch = async () => {
    if (!formData.pincode.trim()) {
      setError('Please enter a pincode to search nearby institutions.');
      return;
    }
    setError(''); setSuccessMsg('');
    setSearchLoading(true); setHasSearched(true);
    try {
      const res = await getNearbyInstitutions({
        pincode: formData.pincode.trim(),
        type: typeFilter,
        radius: radiusFilter,
      });
      if (res?.success) {
        setInstitutions(res.data || []);
      } else {
        setError(res?.error || 'Failed to fetch nearby institutions.');
        setInstitutions([]);
      }
    } catch (e) {
      setError(e.message || 'Search failed.'); setInstitutions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!confirmTarget) return;
    setSubmitting(true); setError('');
    try {
      const userId = user?.id || user?._id || user?.sub;
      const isHospital = confirmTarget.institution_type === 'HOSPITAL';
      const payload = {
        u_id: userId,
        target_type: isHospital ? 'HOSPITAL' : 'BLOOD_BANK',
        hospital_id: isHospital ? confirmTarget._id : undefined,
        bloodbank_id: !isHospital ? confirmTarget._id : undefined,
        preferred_date: formData.preferred_date || undefined,
        donor_notes: formData.donor_notes || undefined,
      };
      const res = await applyDonationRequest(payload);
      if (res?.success) {
        setSuccessMsg(`Request submitted to ${confirmTarget.name}! Awaiting admin verification.`);
        setConfirmTarget(null);
        const activeRes = await getActiveRequest();
        if (activeRes?.success) setActiveRequest(activeRes.data);
      } else {
        setError(res?.error || 'Failed to submit request.');
        setConfirmTarget(null);
      }
    } catch (e) {
      setError(e.message || 'Failed to submit request.');
      setConfirmTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!requestId) return;
    setCancellingId(requestId); setError('');
    try {
      const res = await cancelDonationRequest(requestId, 'Cancelled by donor.');
      if (res?.success) {
        setActiveRequest(null);
        setSuccessMsg('Request cancelled. You can now submit a new donation request.');
      } else {
        setError(res?.error || 'Failed to cancel request.');
      }
    } catch (e) {
      setError(e.message || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  const sortedInstitutions = [...institutions].sort((a, b) =>
    sortBy === 'name'
      ? a.name.localeCompare(b.name)
      : a.distance_score - b.distance_score
  );

  const isBlocking = Boolean(activeRequest) && !TERMINAL_STATUSES.includes(activeRequest?.status);
  const activeStatusCfg = activeRequest ? STATUS_CONFIG[activeRequest.status] : null;
  const ActiveIcon = activeStatusCfg?.icon;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm text-neutral-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <HandHeart className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Donate <span className="font-serif italic font-normal text-red-400">Blood</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Find hospitals and blood banks near you and submit your donation request.
          </p>
        </div>
      </div>

      {/* Success */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center justify-between gap-3"
          >
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-white cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Request Banner */}
      <AnimatePresence>
        {activeRequest && activeStatusCfg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border p-4 ${activeStatusCfg.bannerClass}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {ActiveIcon && <ActiveIcon className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">
                    {isBlocking ? '⚠️ You have an active request — resolve or cancel it before submitting a new one.' : 'Recent request:'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeStatusCfg.className}`}>
                      {activeStatusCfg.label}
                    </span>
                    {activeRequest.hospital_id && (
                      <span className="text-xs text-neutral-300">→ {activeRequest.hospital_id.hos_name}</span>
                    )}
                    {activeRequest.bloodbank_id && (
                      <span className="text-xs text-neutral-300">→ {activeRequest.bloodbank_id.bank_name}</span>
                    )}
                  </div>
                  {activeRequest.appointment_date && (
                    <p className="text-xs text-neutral-400 mt-1">
                      📅 {new Date(activeRequest.appointment_date).toLocaleDateString()}{activeRequest.appointment_time ? ` at ${activeRequest.appointment_time}` : ''}
                    </p>
                  )}
                  {activeRequest.appointment_venue && (
                    <p className="text-xs text-neutral-400">📍 {activeRequest.appointment_venue}</p>
                  )}
                  {activeRequest.rejection_reason && (
                    <p className="text-xs text-red-400 mt-1">Reason: {activeRequest.rejection_reason}</p>
                  )}
                </div>
              </div>
              {isBlocking && (
                <button
                  onClick={() => handleCancelRequest(activeRequest._id)}
                  disabled={!!cancellingId}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {cancellingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  Cancel Request
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span></div>
            <button onClick={() => setError('')} className="shrink-0 cursor-pointer hover:text-white"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">
        {/* ═══ LEFT: Donor Form ═══ */}
        <div className="rounded-3xl bg-neutral-950/80 border border-white/10 p-5 space-y-4 sticky top-24">
          <div className="flex items-center gap-2 mb-1">
            <Syringe className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Your Donation Details</h2>
          </div>
          <p className="text-xs text-neutral-500">Pre-filled from your profile — edit if needed.</p>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Full Name</label>
            <input type="text" value={formData.name} onChange={e => handleFormChange('name', e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)}
              placeholder="+1-555-0100"
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all" />
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Blood Group</label>
            <div className="relative">
              <select value={formData.bloodgroup} onChange={e => handleFormChange('bloodgroup', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer">
                <option value="" className="bg-neutral-900">Select blood group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg} className="bg-neutral-900">{bg}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
              Your Pincode <span className="text-purple-400">*</span>
              <span className="text-neutral-600 ml-1">(used for proximity search)</span>
            </label>
            <input type="text" value={formData.pincode} onChange={e => handleFormChange('pincode', e.target.value)}
              placeholder="e.g. 110001"
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 font-mono transition-all" />
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Preferred Date <span className="text-neutral-600">(optional)</span></label>
            <input type="date" value={formData.preferred_date} min={new Date().toISOString().split('T')[0]}
              onChange={e => handleFormChange('preferred_date', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all [color-scheme:dark]" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Notes <span className="text-neutral-600">(optional)</span></label>
            <textarea value={formData.donor_notes} onChange={e => handleFormChange('donor_notes', e.target.value)}
              placeholder="Any medical notes or special conditions..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 resize-none transition-all" />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Institution Type</label>
              <div className="relative">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer">
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-neutral-900">{o.label}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Distance Zone</label>
              <div className="relative">
                <select value={radiusFilter} onChange={e => setRadiusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer">
                  {RADIUS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-neutral-900">{o.label}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={searchLoading || !formData.pincode.trim()}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-600 border border-purple-500/50 disabled:border-white/5 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {searchLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...</>
              : <><Search className="w-3.5 h-3.5" /> Find Nearby Institutions</>
            }
          </button>
        </div>

        {/* ═══ RIGHT: Results ═══ */}
        <div className="space-y-4">
          {!hasSearched && !searchLoading && (
            <div className="rounded-3xl border border-white/5 bg-neutral-950/40 p-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-purple-400/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-300">Enter your pincode and click "Find Nearby"</p>
                <p className="text-xs text-neutral-600 mt-1">Hospitals and blood banks will appear here, sorted by proximity.</p>
              </div>
            </div>
          )}

          {searchLoading && (
            <div className="rounded-3xl border border-white/5 bg-neutral-950/40 p-12 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-neutral-400">Searching nearby institutions...</p>
            </div>
          )}

          {hasSearched && !searchLoading && (
            <>
              {/* Results header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-semibold text-white">
                    {sortedInstitutions.length > 0
                      ? `${sortedInstitutions.length} institution${sortedInstitutions.length !== 1 ? 's' : ''} found`
                      : 'No institutions found'}
                  </span>
                  {formData.pincode && (
                    <span className="text-xs text-neutral-500">near <span className="font-mono text-neutral-400">{formData.pincode}</span></span>
                  )}
                </div>
                {sortedInstitutions.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                    <button onClick={() => setSortBy('proximity')}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${sortBy === 'proximity' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white bg-white/5'}`}>
                      Nearest
                    </button>
                    <button onClick={() => setSortBy('name')}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${sortBy === 'name' ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white bg-white/5'}`}>
                      A→Z
                    </button>
                  </div>
                )}
              </div>

              {/* Blocking warning */}
              {isBlocking && sortedInstitutions.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Cancel your active request above before sending a new one.
                </div>
              )}

              {/* No results */}
              {sortedInstitutions.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-neutral-950/40 p-10 flex flex-col items-center text-center gap-3">
                  <Search className="w-10 h-10 text-neutral-700" />
                  <p className="text-sm font-semibold text-neutral-400">No institutions found</p>
                  <p className="text-xs text-neutral-600">Try widening the radius or changing the institution type.</p>
                  <button onClick={() => { setRadiusFilter(''); setTypeFilter('ALL'); }}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3" /> Reset Filters
                  </button>
                </div>
              )}

              {/* Cards grid */}
              {sortedInstitutions.length > 0 && (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedInstitutions.map(inst => (
                    <InstitutionCard
                      key={`${inst.institution_type}-${inst._id}`}
                      inst={inst}
                      onRequest={setConfirmTarget}
                      disabled={isBlocking}
                    />
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmTarget && (
          <ConfirmRequestModal
            institution={confirmTarget}
            formData={formData}
            onConfirm={handleSendRequest}
            onClose={() => !submitting && setConfirmTarget(null)}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GiverPage;
