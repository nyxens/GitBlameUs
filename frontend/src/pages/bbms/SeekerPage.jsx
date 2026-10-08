import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserSearch,
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
  Navigation,
  Boxes,
  Activity,
  Sparkles,
  Calendar,
  User,
  HeartHandshake,
  Heart,
  Trash2,
} from 'lucide-react';
import {
  getSeekerProfile,
  getActiveRequest,
  getNearbyInstitutions,
  applySeekerRequest,
  cancelSeekerRequest,
  deleteSeekerRequest,
  getMySeekerRequests,
} from '../../services/seekerService.js';

const STATUS_CONFIG = {
  NOT_VERIFIED: {
    label: 'Awaiting Verification',
    icon: Clock,
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    bannerClass: 'border-amber-500/40 bg-amber-950/30',
  },
  VERIFIED: {
    label: 'Verified — Awaiting Institution',
    icon: ShieldCheck,
    className: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    bannerClass: 'border-cyan-500/40 bg-cyan-950/30',
  },
  PENDING: {
    label: 'Pending Hospital Review',
    icon: Clock,
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    bannerClass: 'border-blue-500/40 bg-blue-950/30',
  },
  ACCEPTED: {
    label: 'Requisition Accepted & Scheduled',
    icon: CalendarCheck,
    className: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    bannerClass: 'border-purple-500/40 bg-purple-950/30',
  },
  COMPLETED: {
    label: 'Blood Units Dispatched',
    icon: CheckCircle2,
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    bannerClass: 'border-emerald-500/40 bg-emerald-950/30',
  },
  REJECTED: {
    label: 'Requisition Rejected',
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

const COMPATIBLE_DONORS = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

const RADIUS_OPTIONS = [
  { label: 'Any Distance', value: '' },
  { label: '≤ 5 km', value: '5' },
  { label: '≤ 10 km', value: '10' },
  { label: '≤ 25 km', value: '25' },
  { label: '≤ 50 km', value: '50' },
];

const TYPE_OPTIONS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Hospitals Only', value: 'HOSPITAL' },
  { label: 'Blood Banks Only', value: 'BLOOD_BANK' },
];

const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];

// ─── Confirm Requisition Modal ────────────────────────────────────────────────
function ConfirmRequestModal({ institution, formData, onConfirm, onClose, submitting }) {
  const unitsCount = Math.max(1, parseInt(formData.units, 10) || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl bg-neutral-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-t-3xl" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Confirm Blood Request</h3>
            <p className="text-xs text-neutral-400">Review patient details and target facility</p>
          </div>
        </div>

        {/* Institution Card Summary */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4 space-y-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${
              institution.institution_type === 'HOSPITAL'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                : 'bg-red-500/15 text-red-400 border border-red-500/25'
            }`}
          >
            {institution.institution_type === 'HOSPITAL' ? 'Trauma Hospital' : 'Blood Bank'}
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

        {/* Patient & Request Details */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Patient Details</p>
            {formData.is_emergency && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                CRITICAL STAT EMERGENCY
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-300">
            <span className="text-neutral-500">Patient Name</span>
            <span className="text-white font-medium">{formData.patient_name || '—'}</span>
            <span className="text-neutral-500">Blood Group</span>
            <span className="text-cyan-400 font-bold">{formData.bloodgroup || '—'}</span>
            <span className="text-neutral-500">Units Needed</span>
            <span className="font-mono text-white">{unitsCount} Units (≈ {unitsCount * 450} ml)</span>
            <span className="text-neutral-500">Area Pincode</span>
            <span className="font-mono">{formData.pincode || '—'}</span>
            {formData.required_date && !formData.is_emergency && (
              <>
                <span className="text-neutral-500">Required Date</span>
                <span>{formData.required_date}</span>
              </>
            )}
          </div>
          {formData.seeker_notes && (
            <p className="text-xs text-neutral-400 mt-2 italic border-t border-white/5 pt-2">
              "{formData.seeker_notes}"
            </p>
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
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 border border-cyan-400/50 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-[0_0_16px_rgba(6,182,212,0.35)]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Dispatch Request
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Institution Card ────────────────────────────────────────────────────────
function InstitutionCard({ inst, bloodgroup, onRequest, disabled }) {
  const isHospital = inst.institution_type === 'HOSPITAL';
  const matchingStock = inst.stockByGroup?.[bloodgroup] || 0;
  const totalStock = inst.totalUnits || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
        disabled
          ? 'border-white/5 bg-neutral-950/40 opacity-60'
          : 'border-white/10 bg-neutral-950/70 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isHospital
                ? 'bg-blue-500/15 border border-blue-500/20'
                : 'bg-red-500/15 border border-red-500/20'
            }`}
          >
            {isHospital ? (
              <Building2 className="w-4 h-4 text-blue-400" />
            ) : (
              <Droplets className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{inst.name}</p>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                isHospital ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'
              }`}
            >
              {isHospital ? 'Trauma Hospital' : 'Blood Bank'}
            </span>
          </div>
        </div>

        {/* Distance indicator */}
        <div className="text-right shrink-0">
          <div className="text-[10px] text-neutral-500 mb-0.5">
            {inst.distance_km !== undefined ? 'Distance' : 'Proximity'}
          </div>
          {inst.distance_km !== undefined ? (
            <div
              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                inst.distance_km === null
                  ? 'bg-neutral-500/15 text-neutral-400'
                  : inst.distance_km < 5
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : inst.distance_km < 15
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : inst.distance_km < 40
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-neutral-500/15 text-neutral-400'
              }`}
            >
              {inst.distance_km === null ? 'Unknown' : `${inst.distance_km} km`}
            </div>
          ) : (
            <div
              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                inst.distance_score === 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : inst.distance_score < 500
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : inst.distance_score < 2000
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-neutral-500/15 text-neutral-400'
              }`}
            >
              {inst.distance_score === 0 ? 'Same Area' : `Δ ${inst.distance_score}`}
            </div>
          )}
        </div>
      </div>

      {/* Available Stock Indicator */}
      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono">
          <Boxes className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-neutral-400">Target Group ({bloodgroup}):</span>
          <span
            className={`font-bold ${
              matchingStock > 0 ? 'text-emerald-400' : 'text-neutral-500'
            }`}
          >
            {matchingStock > 0 ? `${matchingStock} Units In Stock` : 'Out of Stock'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">
          Total: {totalStock} Units
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 shrink-0 text-neutral-600" />
          <span>
            Pincode: <span className="text-neutral-300 font-mono">{inst.pincode}</span>
          </span>
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
        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
          disabled
            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5'
            : 'bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400/50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]'
        }`}
      >
        <Send className="w-3.5 h-3.5" />
        {disabled ? 'Request Unavailable' : 'Request Blood Units'}
      </button>
    </motion.div>
  );
}

// ─── Main SeekerPage Component ───────────────────────────────────────────────
export const SeekerPage = ({ user }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    phone: '',
    bloodgroup: 'O-',
    units: 1,
    is_emergency: false,
    pincode: '',
    required_date: '',
    seeker_notes: '',
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [radiusFilter, setRadiusFilter] = useState('');
  const [sortBy, setSortBy] = useState('proximity');
  const [locationMode, setLocationMode] = useState('pincode'); // 'pincode' | 'location'
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);

  // Geolocation detector
  const detectLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          setLocating(false);
          resolve(c);
        },
        (err) => {
          setLocating(false);
          const msgs = {
            1: 'Location permission denied. Allow location access or switch to Pincode.',
            2: 'Could not determine your location. Try again or use Pincode.',
            3: 'Location request timed out. Try again or use Pincode.',
          };
          reject(new Error(msgs[err.code] || 'Failed to get your location.'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });

  const handleModeChange = async (mode) => {
    setLocationMode(mode);
    setError('');
    if (mode === 'location' && !coords) {
      try {
        await detectLocation();
      } catch (e) {
        setError(e.message);
      }
    }
  };

  // Initialize data on mount
  useEffect(() => {
    async function init() {
      setProfileLoading(true);
      try {
        const userId = user?.id || user?._id || user?.sub;
        const [profileRes, activeRes, myReqsRes] = await Promise.all([
          getSeekerProfile(),
          getActiveRequest(),
          getMySeekerRequests(userId),
        ]);

        if (profileRes?.success && profileRes.data) {
          const p = profileRes.data;
          setFormData((prev) => ({
            ...prev,
            patient_name: p.name || p.username || '',
            phone: p.phone || '',
            bloodgroup: p.bloodgroup || 'O-',
            pincode: p.pincode || '',
          }));
        } else if (user) {
          setFormData((prev) => ({
            ...prev,
            patient_name: user.name || user.username || '',
            phone: user.phone || '',
            bloodgroup: user.bloodgroup || 'O-',
            pincode: user.pincode || '10001',
          }));
        }

        if (activeRes?.success) setActiveRequest(activeRes.data);
        if (myReqsRes?.success && myReqsRes.data) {
          setMyRequests(myReqsRes.data);
        }
      } catch (e) {
        console.error('Seeker init error:', e);
      } finally {
        setProfileLoading(false);
      }
    }
    init();
  }, [user]);

  const handleFormChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Search Nearby Institutions
  const handleSearch = async () => {
    const useLocation = locationMode === 'location';
    if (!useLocation && !formData.pincode.trim()) {
      setError('Please enter an area pincode to search nearby institutions.');
      return;
    }
    setError('');
    setSuccessMsg('');
    let point = coords;
    if (useLocation) {
      try {
        point = await detectLocation();
      } catch (e) {
        if (!point) {
          setError(e.message);
          return;
        }
      }
    }

    setSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await getNearbyInstitutions({
        ...(useLocation ? { lat: point.lat, lng: point.lng } : { pincode: formData.pincode.trim() }),
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
      setError(e.message || 'Search failed.');
      setInstitutions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Submit blood request to selected institution
  const handleSendRequest = async () => {
    if (!confirmTarget) return;
    setSubmitting(true);
    setError('');

    try {
      const userId = user?.id || user?._id || user?.sub;
      const isHospital = confirmTarget.institution_type === 'HOSPITAL';
      const payload = {
        u_id: userId,
        patient_name: formData.patient_name || undefined,
        bloodgroup: formData.bloodgroup,
        units: Math.max(1, parseInt(formData.units, 10) || 1),
        is_emergency: formData.is_emergency,
        target_type: isHospital ? 'HOSPITAL' : 'BLOOD_BANK',
        hospital_id: isHospital ? confirmTarget._id : undefined,
        bloodbank_id: !isHospital ? confirmTarget._id : undefined,
        pincode: formData.pincode || confirmTarget.pincode || undefined,
        required_date: formData.is_emergency ? undefined : formData.required_date || undefined,
        seeker_notes: formData.seeker_notes || undefined,
      };

      const res = await applySeekerRequest(payload);
      if (res?.success) {
        setSuccessMsg(
          `Requisition dispatched to ${confirmTarget.name}! Awaiting medical verification.`
        );
        setConfirmTarget(null);

        // Refresh active request and history
        const [activeRes, myReqsRes] = await Promise.all([
          getActiveRequest(),
          getMySeekerRequests(userId),
        ]);
        if (activeRes?.success) setActiveRequest(activeRes.data);
        if (myReqsRes?.success && myReqsRes.data) setMyRequests(myReqsRes.data);
        window.dispatchEvent(new CustomEvent('lifevault:requests-updated'));
      } else {
        setError(res?.error || 'Failed to submit blood request.');
        setConfirmTarget(null);
      }
    } catch (e) {
      setError(e.message || 'Failed to submit blood request.');
      setConfirmTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel an active request
  const handleCancelRequest = async (requestId) => {
    if (!requestId) return;
    setCancellingId(requestId);
    setError('');

    try {
      const res = await cancelSeekerRequest(requestId, 'Cancelled by seeker.');
      if (res?.success) {
        setActiveRequest(null);
        setSuccessMsg('Requisition cancelled. You can now submit a new blood request.');
        const userId = user?.id || user?._id || user?.sub;
        const myReqsRes = await getMySeekerRequests(userId);
        if (myReqsRes?.success && myReqsRes.data) setMyRequests(myReqsRes.data);
        window.dispatchEvent(new CustomEvent('lifevault:requests-updated'));
      } else {
        setError(res?.error || 'Failed to cancel blood request.');
      }
    } catch (e) {
      setError(e.message || 'Failed to cancel blood request.');
    } finally {
      setCancellingId(null);
    }
  };

  // Delete a specific history requisition
  const handleDeleteHistory = async (requestId) => {
    if (!requestId) return;
    setDeletingId(requestId);
    setError('');

    try {
      const res = await deleteSeekerRequest(requestId);
      if (res?.success) {
        setMyRequests((prev) => prev.filter((r) => (r._id || r.id) !== requestId));
        if (activeRequest && (activeRequest._id === requestId || activeRequest.id === requestId)) {
          setActiveRequest(null);
        }
        setSuccessMsg('Blood request history entry deleted.');
        setConfirmDeleteId(null);
        window.dispatchEvent(new CustomEvent('lifevault:requests-updated'));
      } else {
        setError(res?.error || 'Failed to delete blood request history.');
      }
    } catch (e) {
      setError(e.message || 'Failed to delete blood request history.');
    } finally {
      setDeletingId(null);
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
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-neutral-400">Loading your profile & telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6 animate-fadeIn font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_24px_rgba(6,182,212,0.15)]">
            <UserSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Request <span className="font-serif italic font-normal text-cyan-400">Blood</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Find certified hospitals and blood banks with matching inventory and dispatch your requisition.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center justify-between gap-3 shadow-lg"
          >
            <span>✅ {successMsg}</span>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-500 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Request Banner (Matching GiverPage) */}
      <AnimatePresence>
        {activeRequest && activeStatusCfg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border p-4 shadow-xl ${activeStatusCfg.bannerClass}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {ActiveIcon && <ActiveIcon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">
                    {isBlocking
                      ? '⚠️ You have an active requisition in progress — complete or cancel it before submitting a new one.'
                      : 'Recent requisition:'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${activeStatusCfg.className}`}>
                      {activeStatusCfg.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                      {activeRequest.bloodgroup} • {activeRequest.units || 1} {activeRequest.units === 1 ? 'Unit' : 'Units'}
                    </span>
                    {activeRequest.is_emergency && (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">
                        CRITICAL STAT
                      </span>
                    )}
                    {activeRequest.hospital_id && (
                      <span className="text-xs text-neutral-300">
                        → {activeRequest.hospital_id.hos_name}
                      </span>
                    )}
                    {activeRequest.bloodbank_id && (
                      <span className="text-xs text-neutral-300">
                        → {activeRequest.bloodbank_id.bank_name}
                      </span>
                    )}
                  </div>

                  {activeRequest.schedule_date && (
                    <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Pickup: <strong>{new Date(activeRequest.schedule_date).toLocaleDateString()}</strong>
                        {activeRequest.schedule_time ? ` at ${activeRequest.schedule_time}` : ''}
                      </span>
                    </p>
                  )}
                  {activeRequest.pickup_venue && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeRequest.pickup_venue}</span>
                    </p>
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

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="shrink-0 cursor-pointer hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Responsive Layout: Form on Left (Sticky), Results on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">
        {/* ═══ LEFT COLUMN: Seeker Request Details Form ═══ */}
        <div className="rounded-3xl bg-neutral-950/80 border border-white/10 p-5 space-y-4 sticky top-24 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <UserSearch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Your Blood Requisition</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Specify patient requirements to match available blood lockers and certified centers.
          </p>

          {/* Patient Name */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Patient Full Name</label>
            <input
              type="text"
              value={formData.patient_name}
              onChange={(e) => handleFormChange('patient_name', e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Contact Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="+1-555-0199"
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Blood Group & Compatible Donors preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium text-neutral-400">Required Blood Group</label>
              <span className="text-[10px] text-neutral-500 font-mono">
                Accepts:{' '}
                <strong className="text-cyan-400">
                  {COMPATIBLE_DONORS[formData.bloodgroup]?.join(', ') || 'Any'}
                </strong>
              </span>
            </div>
            <div className="relative">
              <select
                value={formData.bloodgroup}
                onChange={(e) => handleFormChange('bloodgroup', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/40 appearance-none cursor-pointer font-bold"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg} className="bg-neutral-900 font-normal">
                    {bg}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Units Needed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-medium text-neutral-400">Units Needed</label>
              <span className="text-[10px] text-neutral-500 font-mono">
                ≈ {formData.units * 450} ml Whole Blood
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={formData.units}
                onChange={(e) =>
                  handleFormChange('units', Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
              <div className="flex items-center gap-1 shrink-0">
                {[1, 2, 4].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleFormChange('units', u)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                      formData.units === u
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {u}U
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency STAT Toggle */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 transition-colors">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_emergency}
                onChange={(e) => handleFormChange('is_emergency', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded bg-neutral-900 border-white/20 text-red-500 focus:ring-0 cursor-pointer accent-red-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Emergency Request</span>
                  {formData.is_emergency && (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/30">
                      CRITICAL STAT
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {formData.is_emergency
                    ? 'Immediate trauma dispatch protocol activated (< 30 minutes).'
                    : 'Scheduled procedure or standard replenishment.'}
                </p>
              </div>
            </label>
          </div>

          {/* Search-by toggle: Pincode / Current Location (GPS) */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
              Search Location By <span className="text-cyan-400">*</span>
            </label>
            <div className="relative grid grid-cols-2 p-1 rounded-xl bg-neutral-900/60 border border-white/10">
              <motion.div
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-cyan-600 shadow-[0_0_16px_rgba(6,182,212,0.35)]"
                animate={{ x: locationMode === 'pincode' ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
              {[
                { value: 'pincode', label: 'Pincode', Icon: MapPin },
                { value: 'location', label: 'Current GPS', Icon: Navigation },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleModeChange(value)}
                  className={`relative z-10 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    locationMode === value ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Mode Details */}
          <AnimatePresence mode="wait" initial={false}>
            {locationMode === 'pincode' ? (
              <motion.div
                key="pincode"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium text-neutral-400">
                    Area Pincode <span className="text-cyan-400">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {['10001', '10002', '10014'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleFormChange('pincode', p)}
                        className="text-neutral-500 hover:text-cyan-400 cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleFormChange('pincode', e.target.value)}
                  placeholder="e.g. 10001"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
                />
              </motion.div>
            ) : (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  Your Location <span className="text-neutral-600">(GPS real distance)</span>
                </label>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10">
                  <span className="text-xs font-mono text-neutral-300 truncate">
                    {locating
                      ? 'Detecting location...'
                      : coords
                      ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                      : 'Location not detected'}
                  </span>
                  <button
                    type="button"
                    onClick={() => detectLocation().catch((e) => setError(e.message))}
                    disabled={locating}
                    className="shrink-0 text-[11px] text-cyan-400 hover:text-cyan-300 disabled:text-neutral-600 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                    {coords ? 'Refresh' : 'Detect'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Required Date (if not emergency) */}
          <AnimatePresence>
            {!formData.is_emergency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  Required By Date <span className="text-neutral-600">(optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.required_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFormChange('required_date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all [color-scheme:dark]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Medical Notes */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
              Clinical / Medical Notes <span className="text-neutral-600">(optional)</span>
            </label>
            <textarea
              value={formData.seeker_notes}
              onChange={(e) => handleFormChange('seeker_notes', e.target.value)}
              placeholder="Surgery details, trauma code, or hemoglobin levels..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">Institution Type</label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/40 appearance-none cursor-pointer"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-neutral-900">
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                {locationMode === 'location' ? 'Max Distance' : 'Distance Zone'}
              </label>
              <div className="relative">
                <select
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/40 appearance-none cursor-pointer"
                >
                  {RADIUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-neutral-900">
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={searchLoading || locating || (locationMode === 'pincode' && !formData.pincode.trim())}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-neutral-800 disabled:text-neutral-600 border border-cyan-400/50 disabled:border-white/5 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.25)]"
          >
            {searchLoading ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-black text-black animate-pulse" />
                <span>Finding Nearby Institutions...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-black" />
                <span>Find Nearby Institutions</span>
              </>
            )}
          </button>
        </div>

        {/* ═══ RIGHT COLUMN: Institutions & Available Inventory ═══ */}
        <div className="space-y-4">
          {!hasSearched && !searchLoading && (
            <div className="rounded-3xl border border-white/5 bg-neutral-950/40 p-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-cyan-400/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-300">
                  Select your blood group and pincode, then click "Find Nearby Institutions"
                </p>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Live hospitals and cryogenic blood banks with available inventory units will appear here, sorted by proximity.
                </p>
              </div>
            </div>
          )}

          {searchLoading && (
            <div className="rounded-3xl border border-red-500/20 bg-neutral-950/60 p-12 flex flex-col items-center justify-center text-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
              {/* Heart & Heartbeat Line Container from Landing Page */}
              <div className="relative w-28 h-24 flex items-center justify-center mb-1">
                <div className="absolute w-16 h-16 bg-red-600/30 rounded-full blur-xl animate-pulse" />
                <motion.div
                  animate={{ scale: [1, 1.15, 1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
                >
                  <Heart className="w-14 h-14 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                </motion.div>

                {/* ECG Heartbeat Line crossing over the heart */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-visible">
                  <svg viewBox="0 0 160 50" className="w-48 h-14 overflow-visible">
                    <defs>
                      <linearGradient id="seeker-heartbeat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                        <stop offset="25%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="75%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                      <filter id="seeker-heartbeat-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Static baseline trace */}
                    <path
                      d="M 0 25 H 52 Q 58 17, 64 25 L 68 28 L 76 5 L 82 43 L 86 25 Q 93 15, 100 25 H 160"
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-70"
                    />

                    {/* Animated ECG Pulse line */}
                    <path
                      d="M 0 25 H 52 Q 58 17, 64 25 L 68 28 L 76 5 L 82 43 L 86 25 Q 93 15, 100 25 H 160"
                      fill="none"
                      stroke="url(#seeker-heartbeat-grad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#seeker-heartbeat-glow)"
                      className="heartbeat-pulse-line-active"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Finding Nearby Institutions...</p>
                <p className="text-xs text-neutral-400 font-mono mt-1">Querying Cold Vault Telemetry & Matching Inventory...</p>
              </div>
            </div>
          )}

          {hasSearched && !searchLoading && (
            <>
              {/* Results Control Header */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-semibold text-white">
                    {sortedInstitutions.length > 0
                      ? `${sortedInstitutions.length} institution${
                          sortedInstitutions.length !== 1 ? 's' : ''
                        } found`
                      : 'No institutions found'}
                  </span>
                  {locationMode === 'location' && coords ? (
                    <span className="text-xs text-neutral-500">
                      from <span className="font-mono text-neutral-400">your GPS position</span>
                    </span>
                  ) : locationMode === 'pincode' && formData.pincode ? (
                    <span className="text-xs text-neutral-500">
                      near pincode <span className="font-mono text-neutral-400">{formData.pincode}</span>
                    </span>
                  ) : null}
                </div>

                {sortedInstitutions.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                    <button
                      onClick={() => setSortBy('proximity')}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        sortBy === 'proximity'
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'text-neutral-400 hover:text-white bg-white/5'
                      }`}
                    >
                      Nearest
                    </button>
                    <button
                      onClick={() => setSortBy('name')}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        sortBy === 'name'
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'text-neutral-400 hover:text-white bg-white/5'
                      }`}
                    >
                      A→Z
                    </button>
                  </div>
                )}
              </div>

              {/* Blocking Warning */}
              {isBlocking && sortedInstitutions.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    You have an active request in progress. Cancel or wait for it to complete before sending another request.
                  </span>
                </div>
              )}

              {/* No results */}
              {sortedInstitutions.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-neutral-950/40 p-10 flex flex-col items-center text-center gap-3">
                  <Search className="w-10 h-10 text-neutral-700" />
                  <p className="text-sm font-semibold text-neutral-400">No matching institutions found</p>
                  <p className="text-xs text-neutral-600">
                    Try widening the distance radius or changing the institution type filter.
                  </p>
                  <button
                    onClick={() => {
                      setRadiusFilter('');
                      setTypeFilter('ALL');
                    }}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Filters
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              {sortedInstitutions.length > 0 && (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedInstitutions.map((inst) => (
                    <InstitutionCard
                      key={`${inst.institution_type}-${inst._id}`}
                      inst={inst}
                      bloodgroup={formData.bloodgroup}
                      onRequest={setConfirmTarget}
                      disabled={isBlocking}
                    />
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* ═══ BOTTOM SECTION: Seeker Requisition History ═══ */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono tracking-widest text-neutral-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>My Blood Request History ({myRequests.length})</span>
              </h4>
              <button
                type="button"
                onClick={async () => {
                  const userId = user?.id || user?._id || user?.sub;
                  const res = await getMySeekerRequests(userId);
                  if (res?.success && res.data) setMyRequests(res.data);
                }}
                className="text-xs font-mono text-neutral-500 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh History
              </button>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-neutral-950/60 border border-white/10 text-center text-xs text-neutral-500 font-mono">
                No past requisitions found. Search for nearby institutions above to submit a blood request.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myRequests.map((req) => {
                  const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.NOT_VERIFIED;
                  const isCancelable = !TERMINAL_STATUSES.includes(req.status);
                  const instName =
                    req.hospital_id?.hos_name ||
                    req.bloodbank_id?.bank_name ||
                    (req.target_type === 'HOSPITAL' ? 'Hospital' : 'Blood Bank');

                  return (
                    <div
                      key={req._id || req.id}
                      className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm">
                          {req.bloodgroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">
                              {req.patient_name || req.displayName || 'Patient'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-500">
                              {req.requestId ? `ID: ${String(req.requestId).slice(-6).toUpperCase()}` : ''}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-mono">
                              {instName}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {req.units || 1} {req.units === 1 ? 'Unit' : 'Units'} (≈ {(req.units || 1) * 450} ml)
                            {req.pincode ? ` • PIN ${req.pincode}` : ''}
                            {req.createdAt ? ` • ${new Date(req.createdAt).toLocaleDateString()}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px]">
                        <div>
                          {req.is_emergency ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                              Emergency STAT
                            </span>
                          ) : req.required_date ? (
                            <span className="text-neutral-400">
                              Need: {new Date(req.required_date).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.className}`}
                        >
                          {statusCfg.label}
                        </span>

                        {isCancelable && (
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(req._id)}
                            disabled={cancellingId === req._id}
                            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {cancellingId === req._id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            <span className="text-[10px]">Cancel</span>
                          </button>
                        )}

                        {/* Delete history button */}
                        {confirmDeleteId === (req._id || req.id) ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDeleteHistory(req._id || req.id)}
                              disabled={deletingId === (req._id || req.id)}
                              className="px-2 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-sm"
                            >
                              {deletingId === (req._id || req.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <span>Delete</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(req._id || req.id)}
                            title="Delete this history entry"
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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

export default SeekerPage;
