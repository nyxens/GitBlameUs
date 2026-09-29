import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserSearch,
  Droplet,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Send,
  Boxes,
  RefreshCw,
  Check,
  Building2,
  Thermometer,
  ShieldCheck,
  Activity,
  Sparkles,
  Filter,
  Trash2,
} from 'lucide-react';
import { fetchApi } from '../../services/apiConfig.js';
import { getInventoriesByPincode } from '../../services/inventoryService.js';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// ABO Compatibility map for instant user feedback
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

export const SeekerPage = ({ user }) => {
  // Form State
  const [seekerName, setSeekerName] = useState(user?.name || user?.username || '');
  const [bloodType, setBloodType] = useState(user?.bloodgroup || 'O-');
  const [pincode, setPincode] = useState(user?.pincode || '10001');
  const [isEmergency, setIsEmergency] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [units, setUnits] = useState(1);

  // Submitting / UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  // Deletion states
  const [deletingReqId, setDeletingReqId] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState(null);

  // Inventory query state for right column
  const [availableInventories, setAvailableInventories] = useState([]);
  const [isLoadingInventories, setIsLoadingInventories] = useState(false);
  const [isFallbackNearby, setIsFallbackNearby] = useState(false);
  const [onlyCompatibleFilter, setOnlyCompatibleFilter] = useState(false);
  const [requestingInvId, setRequestingInvId] = useState(null);

  // Track user-submitted requests in this session
  const [recentRequests, setRecentRequests] = useState([
    {
      id: 'REQ-8091',
      seekerName: 'David Miller',
      bloodType: 'O-',
      pincode: '10001',
      facilityName: 'Metro Regional Blood Center (CELL-RBC-A1)',
      isEmergency: true,
      scheduleDate: null,
      units: 2,
      status: 'ALLOCATED',
      submittedAt: 'Today, 10:15 AM',
    },
    {
      id: 'REQ-8092',
      seekerName: 'Sophia Lin',
      bloodType: 'A+',
      pincode: '10014',
      facilityName: 'Downtown Emergency CryoVault',
      isEmergency: false,
      scheduleDate: '2026-09-15',
      units: 1,
      status: 'PENDING',
      submittedAt: 'Today, 09:30 AM',
    },
  ]);

  // Load existing requisitions from database on mount
  useEffect(() => {
    async function loadRequisitions() {
      try {
        const res = await fetchApi('/requisitions');
        if (res && res.requisitions && res.requisitions.length > 0) {
          const mapped = res.requisitions.map((r) => ({
            id: `REQ-${r._id.slice(-4).toUpperCase()}`,
            apiId: r._id,
            seekerName: r.u_id?.name || r.u_id?.username || 'Registered Seeker',
            bloodType: r.bloodgroup || 'O+',
            pincode: r.pincode || '10001',
            facilityName: r.A_id ? 'Allocated via BBMS Staff' : `Regional Vault (PIN ${r.pincode})`,
            isEmergency: r.status === 'ALLOCATED',
            scheduleDate: r.date_of_requirement ? new Date(r.date_of_requirement).toISOString().split('T')[0] : null,
            units: Math.round((r.weight || 450) / 450) || 1,
            status: r.status || 'PENDING',
            submittedAt: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          }));
          setRecentRequests(mapped);
        }
      } catch (err) {
        console.warn('Could not load backend requisitions:', err);
      }
    }
    loadRequisitions();
  }, []);

  // Fetch available inventories whenever pincode changes
  const fetchInventories = useCallback(async (pin) => {
    setIsLoadingInventories(true);
    try {
      const data = await getInventoriesByPincode(pin);
      if (data && data.inventories) {
        setAvailableInventories(data.inventories);
        setIsFallbackNearby(Boolean(data.isFallbackNearby));
      } else {
        setAvailableInventories([]);
      }
    } catch (err) {
      console.warn('Failed to fetch inventories for pincode:', err);
    } finally {
      setIsLoadingInventories(false);
    }
  }, []);

  useEffect(() => {
    fetchInventories(pincode);
  }, [pincode, fetchInventories]);

  // Standard Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetPin = pincode.trim() || '10001';
    const generatedId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest = {
      id: generatedId,
      seekerName: seekerName.trim() || 'Patient Seeker',
      bloodType,
      pincode: targetPin,
      facilityName: `Regional Network (PIN ${targetPin})`,
      isEmergency,
      scheduleDate: isEmergency ? null : scheduleDate,
      units: Number(units) || 1,
      status: isEmergency ? 'ALLOCATED' : 'PENDING',
      submittedAt: 'Just now',
    };

    // Try posting to backend requisition API if reachable
    try {
      const res = await fetchApi('/requisitions', {
        method: 'POST',
        body: JSON.stringify({
          u_id: user?._id || null,
          bloodgroup: bloodType,
          weight: (Number(units) || 1) * 450,
          pincode: targetPin,
          date_of_requirement: isEmergency
            ? new Date().toISOString()
            : new Date(`${scheduleDate}T09:00:00.000Z`).toISOString(),
        }),
      });
      if (res?.requisition?._id) {
        newRequest.apiId = res.requisition._id;
      }
    } catch (err) {
      console.warn('API sync fallback, continuing with local state:', err);
    }

    setRecentRequests((prev) => [newRequest, ...prev]);
    setLastSubmitted(newRequest);
    setIsSubmitting(false);
  };

  // Direct "Request" from an inventory locker card
  const handleRequestFromInventory = async (inv) => {
    const invKey = inv.id || inv.cellno;
    setRequestingInvId(invKey);

    const activeSeeker = seekerName.trim() || user?.name || user?.username || 'Emergency Seeker';
    if (!seekerName) {
      setSeekerName(activeSeeker);
    }

    const targetPin = inv.pincode || pincode || '10001';
    const generatedId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = {
      id: generatedId,
      seekerName: activeSeeker,
      bloodType,
      pincode: targetPin,
      facilityName: `${inv.facilityName} (${inv.cellno})`,
      isEmergency,
      scheduleDate: isEmergency ? null : scheduleDate,
      units: Number(units) || 1,
      status: isEmergency ? 'ALLOCATED' : 'APPROVED',
      submittedAt: 'Just now',
    };

    try {
      const res = await fetchApi('/requisitions', {
        method: 'POST',
        body: JSON.stringify({
          u_id: user?._id || null,
          bloodgroup: bloodType,
          weight: (Number(units) || 1) * 450,
          pincode: targetPin,
          date_of_requirement: isEmergency
            ? new Date().toISOString()
            : new Date(`${scheduleDate}T09:00:00.000Z`).toISOString(),
        }),
      });
      if (res?.requisition?._id) {
        newRequest.apiId = res.requisition._id;
      }
    } catch (err) {
      console.warn('Requisition API fallback:', err);
    }

    setRecentRequests((prev) => [newRequest, ...prev]);
    setLastSubmitted({
      ...newRequest,
      specificVault: `${inv.facilityName} - ${inv.cellno}`,
    });

    setTimeout(() => {
      setRequestingInvId(null);
    }, 2500);
  };

  // Handle Delete a Requisition Request
  const handleDeleteRequest = async (reqToDelete) => {
    const targetId = reqToDelete.id;
    setDeletingReqId(targetId);

    // Call backend DELETE endpoint if we have apiId or MongoDB ObjectId
    const deleteId = reqToDelete.apiId || (reqToDelete.id?.startsWith('REQ-') ? null : reqToDelete.id);
    if (deleteId) {
      try {
        await fetchApi(`/requisitions/${deleteId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete requisition from backend API:', err);
      }
    }

    // Remove from local state
    setRecentRequests((prev) => prev.filter((r) => r.id !== targetId && (!reqToDelete.apiId || r.apiId !== reqToDelete.apiId)));

    if (lastSubmitted?.id === targetId) {
      setLastSubmitted(null);
    }

    setDeleteNotice(`Request ${targetId} (${reqToDelete.seekerName} • ${reqToDelete.bloodType}) was successfully deleted.`);
    setDeletingReqId(null);

    setTimeout(() => {
      setDeleteNotice(null);
    }, 4000);
  };

  const handleReset = () => {
    setSeekerName('');
    setBloodType('O-');
    setPincode('10001');
    setIsEmergency(false);
    setUnits(1);
    setLastSubmitted(null);
  };

  // Compute aggregate stats for current area
  const totalUnitsInArea = availableInventories.reduce((acc, inv) => acc + (inv.availableUnits || 0), 0);
  const compatibleTypes = COMPATIBLE_DONORS[bloodType] || [bloodType];
  const compatibleUnitsInArea = availableInventories.reduce((acc, inv) => {
    if (!inv.countsByGroup) return acc;
    return (
      acc +
      compatibleTypes.reduce((cAcc, bg) => cAcc + (inv.countsByGroup[bg] || 0), 0)
    );
  }, 0);

  // Filter inventories if "only compatible" is toggled
  const displayedInventories = availableInventories.filter((inv) => {
    if (!onlyCompatibleFilter) return true;
    if (!inv.countsByGroup) return false;
    return compatibleTypes.some((bg) => (inv.countsByGroup[bg] || 0) > 0);
  });

  return (
    <div className="w-full space-y-8 animate-fadeIn font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_24px_rgba(6,182,212,0.15)]">
            <UserSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Blood <span className="font-serif italic font-normal text-cyan-400">Seeker</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Request compatible blood units from regional vaults and certified hospital networks.
            </p>
          </div>
        </div>

        {/* Quick telemetry badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>VAULT TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout: Form on Left, Available Inventories on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: BLOOD REQUEST FORM ================= */}
        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-6 md:p-7 shadow-2xl overflow-hidden">
            {/* Top cyan gradient accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400" />

            {/* Form Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Droplet className="w-5 h-5 fill-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Blood Request Form</h3>
                <p className="text-xs text-neutral-400">
                  Submit an urgent or scheduled blood requisition to the LifeVault FEFO network.
                </p>
              </div>
            </div>

            {/* Success Banner if just submitted */}
            <AnimatePresence>
              {lastSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Request {lastSubmitted.id} Dispatched!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {lastSubmitted.status}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] font-sans">
                    Blood request for <strong className="text-white">{lastSubmitted.seekerName}</strong> (
                    {lastSubmitted.bloodType}) at pincode{' '}
                    <strong className="text-white">{lastSubmitted.pincode}</strong> has been logged into the queue.{' '}
                    {lastSubmitted.specificVault && (
                      <span className="text-cyan-400 block mt-1 font-mono">
                        Target Vault: {lastSubmitted.specificVault}
                      </span>
                    )}
                    {lastSubmitted.isEmergency ? (
                      <span className="text-red-400 font-semibold block mt-1">
                        Priority emergency dispatch active (&lt; 30 mins).
                      </span>
                    ) : (
                      <span className="block mt-1">Scheduled for {lastSubmitted.scheduleDate}.</span>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* 1. Seeker's Name */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Seeker's Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={seekerName}
                  onChange={(e) => setSeekerName(e.target.value)}
                  placeholder="Enter patient or seeker's full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* 2. Blood Type Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Blood Type</span>
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Compatible:{' '}
                    <span className="text-cyan-400 font-semibold">
                      {COMPATIBLE_DONORS[bloodType]?.join(', ') || 'O-'}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((type) => {
                    const isSelected = bloodType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setBloodType(type)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.02]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:border-white/25 hover:bg-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Pincode & Units in a 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Area Pincode</span>
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">Auto-filters vaults</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 10001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Units Needed</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={units}
                      onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap">
                      ≈ {units * 450} ml
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Emergency Toggle Box */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 transition-colors">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-neutral-900 border-white/20 text-red-500 focus:ring-0 cursor-pointer accent-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">This is an Emergency Request</span>
                      {isEmergency && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-mono text-[10px] font-bold border border-red-500/30">
                          CRITICAL STAT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isEmergency
                        ? 'Immediate dispatch protocol activated (< 30 minutes). Scheduling is bypassed.'
                        : 'Uncheck if this is not an emergency, and specify a scheduled date below.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* 5. Schedule Date (Only visible if NOT emergency) */}
              <AnimatePresence>
                {!isEmergency && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-1.5"
                  >
                    <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Schedule Date (Non-Emergency)</span>
                    </label>
                    <input
                      type="date"
                      required={!isEmergency}
                      value={scheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Select the preferred date by which the blood units should be reserved at the medical center.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                  <span>{isSubmitting ? 'Processing...' : 'Submit Blood Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: AVAILABLE INVENTORIES IN AREA ================= */}
        <div className="lg:col-span-7 w-full space-y-4">
          <div className="relative rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-6 md:p-7 shadow-2xl overflow-hidden flex flex-col">
            {/* Top emerald accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400" />

            {/* Header with Pincode badge and Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">Available Inventories</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                      PIN {pincode || '10001'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Live vault lockers & certified facilities with available blood units.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchInventories(pincode)}
                disabled={isLoadingInventories}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInventories ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Quick Pincode Switcher Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-3 pb-1 text-[11px] font-mono">
              <span className="text-neutral-400 text-xs">Quick Pincodes:</span>
              {['10001', '10002', '10003', '10014'].map((pin) => (
                <button
                  key={pin}
                  type="button"
                  onClick={() => setPincode(pin)}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    pincode === pin
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {pin}
                </button>
              ))}
            </div>

            {/* Area Stock KPI Summary Bar */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Total Area Stock</div>
                <div className="text-lg font-extrabold text-white mt-0.5 font-mono">
                  {totalUnitsInArea} <span className="text-xs font-normal text-neutral-400">Units</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Matches {bloodType}</span>
                </div>
                <div className="text-lg font-extrabold text-cyan-300 mt-0.5 font-mono">
                  {compatibleUnitsInArea} <span className="text-xs font-normal text-cyan-500/80">Units</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Active Lockers</div>
                <div className="text-lg font-extrabold text-white mt-0.5 font-mono">
                  {availableInventories.length}{' '}
                  <span className="text-xs font-normal text-neutral-400">Vaults</span>
                </div>
              </div>
            </div>

            {/* Filter Toggle: All vs Compatible Only */}
            <div className="flex items-center justify-between pb-3 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-400 font-medium">Inventory Filter</span>
              </div>
              <button
                type="button"
                onClick={() => setOnlyCompatibleFilter((prev) => !prev)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                  onlyCompatibleFilter
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {onlyCompatibleFilter ? `Showing Compatible (${bloodType})` : 'Show All Types'}
              </button>
            </div>

            {/* Fallback notification when nearest vaults are shown */}
            {isFallbackNearby && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  No direct locker in PIN {pincode}. Showing nearest regional distribution centers.
                </span>
              </div>
            )}

            {/* List of Available Inventory Lockers / Centers */}
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {isLoadingInventories ? (
                <div className="py-12 flex flex-col items-center justify-center text-neutral-400 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs font-mono">Querying Cold Storage Telemetry & Vaults...</span>
                </div>
              ) : displayedInventories.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                  <AlertTriangle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">No available inventory found</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    Try switching to another pincode or toggling "Show All Types" to view available donors.
                  </p>
                </div>
              ) : (
                displayedInventories.map((inv) => {
                  const isDirectMatch = inv.isDirectMatch !== false;
                  const invKey = inv.id || inv.cellno;
                  const isRequestingThis = requestingInvId === invKey;
                  const requestedTypeCount = inv.countsByGroup?.[bloodType] || 0;

                  return (
                    <motion.div
                      key={invKey}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDirectMatch
                          ? 'bg-neutral-900/90 border-white/10 hover:border-cyan-500/40'
                          : 'bg-neutral-900/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Facility Details & Telemetry */}
                        <div className="space-y-2 min-w-0 flex-1">
                          {/* Facility Name + Type Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm tracking-tight truncate">
                              {inv.facilityName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                                inv.facilityType === 'Hospital'
                                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {inv.facilityType === 'Hospital' ? 'Trauma Hospital' : 'Blood Bank'}
                            </span>
                            {isDirectMatch ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                                In Area
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                                Regional Backup
                              </span>
                            )}
                          </div>

                          {/* Cell, Shelf, Temperature & Location Info */}
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono flex-wrap">
                            <span className="text-neutral-300">
                              Locker: <strong className="text-white">{inv.cellno}</strong>
                              {inv.shelfno ? ` • ${inv.shelfno}` : ''}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Thermometer className="w-3 h-3" />
                              <span>{inv.temp || '2.4°C'}</span>
                            </span>
                            <span>•</span>
                            <span>PIN {inv.pincode}</span>
                          </div>

                          {/* Blood Unit Stock breakdown */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {/* Primary Badge for the user's selected blood type */}
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border ${
                                requestedTypeCount > 0
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                              }`}
                            >
                              <span>{bloodType}:</span>
                              <span>{requestedTypeCount} {requestedTypeCount === 1 ? 'Unit' : 'Units'}</span>
                            </span>

                            {/* Secondary chips for other available groups in this locker */}
                            {inv.countsByGroup &&
                              Object.entries(inv.countsByGroup)
                                .filter(([group]) => group !== bloodType)
                                .map(([group, count]) => {
                                  const isCompatible = compatibleTypes.includes(group);
                                  return (
                                    <span
                                      key={group}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                                        isCompatible
                                          ? 'bg-white/10 text-cyan-200 border-cyan-500/30 font-bold'
                                          : 'bg-white/5 text-neutral-400 border-white/5'
                                      }`}
                                    >
                                      {group}: {count}
                                    </span>
                                  );
                                })}
                          </div>
                        </div>

                        {/* ================= REQUEST BUTTON BESIDE INVENTORY ================= */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRequestFromInventory(inv)}
                            disabled={isRequestingThis}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-75 ${
                              isRequestingThis
                                ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-950/40 hover:shadow-[0_0_16px_rgba(6,182,212,0.4)]'
                            }`}
                          >
                            {isRequestingThis ? (
                              <>
                                <Check className="w-4 h-4 text-black stroke-[3]" />
                                <span>Requested ✓</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 text-black" />
                                <span>Request</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: FULL-WIDTH REQUISITIONS HISTORY ================= */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs uppercase font-mono tracking-widest text-neutral-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Seeker Request History ({recentRequests.length})</span>
          </h4>
          <span className="text-[11px] text-neutral-500 font-mono">Live Telemetry Synchronized</span>
        </div>

        {/* Delete feedback alert */}
        <AnimatePresence>
          {deleteNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>{deleteNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteNotice(null)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer ml-4"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {recentRequests.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-950/60 border border-white/10 text-center text-xs text-neutral-400 font-mono">
            No active requisitions in history. Submit a blood request above or click "Request" from any regional vault.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm">
                    {req.bloodType}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{req.seekerName}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{req.id}</span>
                      {req.facilityName && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-mono">
                          {req.facilityName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Pincode: {req.pincode} • {req.units} {req.units === 1 ? 'Unit' : 'Units'} • {req.submittedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px]">
                  <div>
                    {req.isEmergency ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                        Emergency STAT
                      </span>
                    ) : (
                      <span className="text-neutral-300">
                        Scheduled: <strong className="text-white">{req.scheduleDate}</strong>
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      req.status === 'ALLOCATED'
                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {req.status}
                  </span>

                  {/* Delete Request Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(req)}
                    disabled={deletingReqId === req.id}
                    title={`Delete request ${req.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {deletingReqId === req.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                    )}
                    <span className="text-[11px] font-mono">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerPage;

