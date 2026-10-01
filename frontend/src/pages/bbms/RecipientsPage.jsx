import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Droplet,
  ChevronDown,
  X,
  RefreshCw,
  Inbox,
  Check,
  PackageCheck,
  XCircle,
  Building2,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  AlertTriangle,
  Plus,
  ShieldCheck,
  HeartPulse,
  Trash2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import {
  getRequisitions,
  acceptRequisition,
  allocateRequisition,
  denyRequisition,
  getCandidateBags,
  submitEmergencyRequisition,
  deleteRequisition,
} from '../../services/hospitalService.js';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const RecipientsPage = () => {
  // Requisition Data & Loading State
  const [requisitions, setRequisitions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequisitions: 0,
    emergencyTrauma: 0,
    totalUnitsRequested: 0,
    actionableOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Filter States: 'ALL', 'EMERGENCY', 'TOTAL_UNITS', 'ACTIONABLE'
  const [activeCardFilter, setActiveCardFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  // Action states for accept / allocate / deny / modals
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Deny Modal
  const [denyModalReq, setDenyModalReq] = useState(null);
  const [denyReason, setDenyReason] = useState('Blood requisition denied by medical board / BBMS administration.');

  // Allocate Blood Modal (Problem 5)
  const [allocateModalReq, setAllocateModalReq] = useState(null);
  const [candidateBags, setCandidateBags] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedBagIds, setSelectedBagIds] = useState([]);
  const [allocationNotes, setAllocationNotes] = useState('');

  // Emergency Order Creation Modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    patientName: '',
    hospitalName: '',
    bloodGroup: 'O-',
    unitsRequested: 1,
    pincode: '',
    isEmergency: false,
  });

  const dropdownRef = useRef(null);
  const facilityDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (facilityDropdownRef.current && !facilityDropdownRef.current.contains(e.target)) {
        setIsFacilityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unified requisitions from database
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await getRequisitions();
      const list = data?.requisitions || [];
      setRequisitions(list);

      // Compute dynamic metrics
      const emergencyCount = list.filter(
        (r) => r.isEmergency || r.urgency === 'EMERGENCY'
      ).length;
      const totalUnits = list.reduce((sum, r) => sum + (Number(r.units) || 1), 0);
      const actionableCount = list.filter(
        (r) => ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'].includes(r.status)
      ).length;

      setMetrics({
        totalRequisitions: list.length,
        emergencyTrauma: emergencyCount,
        totalUnitsRequested: totalUnits,
        actionableOrders: actionableCount,
      });
      setDbConnected(true);
    } catch (err) {
      console.error('Failed to load requisitions:', err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-dismiss notification after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle Card Clicks
  const handleCardClick = (cardType) => {
    if (activeCardFilter === cardType) {
      setActiveCardFilter('ALL');
    } else {
      setActiveCardFilter(cardType);
    }
  };

  // Action: Accept Requisition
  const handleAccept = async (req) => {
    setActionLoadingId(req.dbId);
    try {
      const res = await acceptRequisition(req.dbId);
      if (res && res.success) {
        setNotification({
          type: 'success',
          message: `Requisition for ${req.patientName} (${req.bloodGroup}, ${req.units} Units) ACCEPTED! Status updated.`,
        });
        setRequisitions((prev) =>
          prev.map((r) => (r.dbId === req.dbId ? { ...r, status: 'ACCEPTED' } : r))
        );
        loadData(false);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to accept requisition: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Open Allocate Blood Modal (Problem 5)
  const handleOpenAllocateModal = async (req) => {
    setAllocateModalReq(req);
    setSelectedBagIds([]);
    setAllocationNotes('');
    setLoadingCandidates(true);
    try {
      const res = await getCandidateBags(req.bloodGroup, req.facilityId);
      const bags = res?.bags || [];
      setCandidateBags(bags);
      // Pre-select required number of units
      const unitsNeeded = req.units || 1;
      const initialSelected = bags.slice(0, unitsNeeded).map((b) => b.id);
      setSelectedBagIds(initialSelected);
    } catch (err) {
      console.warn('Failed to load candidate bags:', err);
      setCandidateBags([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Action: Confirm Allocation (Problem 3 & Problem 5)
  const handleConfirmAllocation = async () => {
    if (!allocateModalReq) return;
    setActionLoadingId(allocateModalReq.dbId);
    try {
      const res = await allocateRequisition(allocateModalReq.dbId, {
        bag_ids: selectedBagIds,
        notes: allocationNotes,
      });

      if (res && res.success) {
        setNotification({
          type: 'success',
          message: `Blood allocated to ${allocateModalReq.patientName}! ${selectedBagIds.length || allocateModalReq.units} unit(s) reserved and vault inventory decremented.`,
        });

        setRequisitions((prev) =>
          prev.map((r) =>
            r.dbId === allocateModalReq.dbId
              ? { ...r, status: 'ALLOCATED', allocatedBags: selectedBagIds }
              : r
          )
        );
        setAllocateModalReq(null);
        loadData(false);
      } else {
        throw new Error(res?.error || 'Allocation could not be completed.');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Allocation failed: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Deny Requisition
  const handleConfirmDeny = async () => {
    if (!denyModalReq) return;
    setActionLoadingId(denyModalReq.dbId);
    try {
      const res = await denyRequisition(denyModalReq.dbId, denyReason);
      if (res && res.success) {
        setNotification({
          type: 'info',
          message: `Requisition for ${denyModalReq.patientName} has been DENIED.`,
        });
        setRequisitions((prev) =>
          prev.map((r) =>
            r.dbId === denyModalReq.dbId
              ? { ...r, status: 'REJECTED', rejection_reason: denyReason }
              : r
          )
        );
        setDenyModalReq(null);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to deny requisition: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Submit Emergency Requisition
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setActionLoadingId('NEW_ORDER');
    try {
      const res = await submitEmergencyRequisition({
        patient_name: newOrder.patientName,
        hospital_name: newOrder.hospitalName,
        bloodgroup: newOrder.bloodGroup,
        units: Number(newOrder.unitsRequested) || 1,
        pincode: newOrder.pincode,
        is_emergency: newOrder.isEmergency,
      });

      if (res && res.success) {
        setNotification({
          type: 'success',
          message: `Emergency blood order created for ${newOrder.patientName} (${newOrder.bloodGroup})! Added to requisition queue.`,
        });
        setOrderModalOpen(false);
        setNewOrder({
          patientName: '',
          hospitalName: '',
          bloodGroup: 'O-',
          unitsRequested: 1,
          pincode: '',
          isEmergency: false,
        });
        await loadData(false);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to create order: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Blood group list for dropdown
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // Extract distinct facilities from requisitions for isolation filter
  const facilities = Array.from(
    new Set(requisitions.map((r) => r.hospital).filter(Boolean))
  );

  // Filter Pipeline
  let processed = [...requisitions];

  if (activeCardFilter === 'EMERGENCY') {
    processed = processed.filter(
      (r) => r.isEmergency || r.urgency === 'EMERGENCY'
    );
  } else if (activeCardFilter === 'TOTAL_UNITS') {
    processed.sort((a, b) => (Number(b.units) || 0) - (Number(a.units) || 0));
  } else if (activeCardFilter === 'ACTIONABLE') {
    processed = processed.filter((r) =>
      ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'].includes(r.status)
    );
  }

  if (bloodGroupFilter !== 'ALL') {
    processed = processed.filter((r) => r.bloodGroup === bloodGroupFilter);
  }

  if (facilityFilter !== 'ALL') {
    processed = processed.filter((r) => r.hospital === facilityFilter);
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    processed = processed.filter(
      (r) =>
        r.patientName?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.hospital?.toLowerCase().includes(q) ||
        r.bloodGroup?.toLowerCase().includes(q) ||
        r.pincode?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
    );
  }

  const clearAllFilters = () => {
    setActiveCardFilter('ALL');
    setBloodGroupFilter('ALL');
    setFacilityFilter('ALL');
    setSearchTerm('');
  };

  const isAnyFilterActive =
    activeCardFilter !== 'ALL' ||
    bloodGroupFilter !== 'ALL' ||
    facilityFilter !== 'ALL' ||
    searchTerm.trim() !== '';

  return (
    <section className="w-full flex flex-col gap-5 animate-fadeIn relative">
      {/* Dynamic Toast / Feedback Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-2xl backdrop-blur-xl ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
              )}
              <span className="text-xs font-medium leading-relaxed">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header: Logo + Title + Primary Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              Blood <span className="font-serif italic font-normal text-emerald-400">Recipients</span> & Requisitions
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Active transfusion orders, emergency triage queue, and cryogenic blood bag allocation.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-[0_0_16px_rgba(16,185,129,0.35)]"
          >
            <Plus className="w-4 h-4" />
            <span>Emergency Order</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            aria-label="Refresh requisition data"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold group disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-500 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Requisitions */}
        <div
          onClick={() => handleCardClick('ALL')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('ALL')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none ${
            activeCardFilter === 'ALL'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-emerald-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                Total Requisitions
              </span>
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  activeCardFilter === 'ALL'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-neutral-400 group-hover:text-emerald-400'
                }`}
              >
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalRequisitions.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Hospital & Citizen Orders</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'ALL' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card 2: Emergency Trauma */}
        <div
          onClick={() => handleCardClick('EMERGENCY')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('EMERGENCY')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none ${
            activeCardFilter === 'EMERGENCY'
              ? 'bg-red-950/30 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-red-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-red-400 transition-colors">
                Emergency Priority
              </span>
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  activeCardFilter === 'EMERGENCY'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-neutral-400 group-hover:text-red-400'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-red-400 tracking-tight">
              {metrics.emergencyTrauma.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Immediate priority triage</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'EMERGENCY' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card 3: Total Units Requested */}
        <div
          onClick={() => handleCardClick('TOTAL_UNITS')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('TOTAL_UNITS')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none ${
            activeCardFilter === 'TOTAL_UNITS'
              ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_24px_rgba(6,182,212,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-cyan-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                Units Demanded
              </span>
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  activeCardFilter === 'TOTAL_UNITS'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-white/5 text-neutral-400 group-hover:text-cyan-400'
                }`}
              >
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalUnitsRequested.toLocaleString()}{' '}
              <span className="text-sm font-normal text-neutral-400">Bags</span>
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Across 8 ABO Groups</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'TOTAL_UNITS' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card 4: Actionable Orders (with glow ping) */}
        <div
          onClick={() => handleCardClick('ACTIONABLE')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('ACTIONABLE')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none ${
            activeCardFilter === 'ACTIONABLE'
              ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-amber-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                Actionable Orders
                {metrics.actionableOrders > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </span>
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  activeCardFilter === 'ACTIONABLE'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/5 text-neutral-400 group-hover:text-amber-400'
                }`}
              >
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 tracking-tight flex items-baseline gap-2">
              {metrics.actionableOrders}{' '}
              <span className="text-xs font-normal text-neutral-400 font-sans">
                Awaiting Allocation
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">
              Click to view & allocate blood
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'ACTIONABLE' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              SELECTED
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar, Dropdowns & Active Filters Tray */}
      <div className="flex flex-col">
        <div className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10 flex flex-col md:flex-row items-center gap-3 relative z-30 shadow-xl">
          {/* Search Bar */}
          <div className="relative flex-1 w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder="Search by patient name, ID, hospital, blood group, or notes..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#141417] text-white placeholder-neutral-500 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/80 transition-colors text-xs caret-emerald-400 ring-0 focus:ring-0"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Blood Type Dropdown */}
          <div className="relative w-full md:w-56" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                isDropdownOpen
                  ? 'bg-[#18181c] border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : bloodGroupFilter !== 'ALL'
                  ? 'bg-[#18181c] border-emerald-500/50 text-emerald-300 hover:border-emerald-500'
                  : 'bg-[#141417] border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Droplet
                  className={`w-4 h-4 ${
                    bloodGroupFilter !== 'ALL' ? 'text-emerald-400 fill-emerald-400/20' : 'text-neutral-500'
                  }`}
                />
                <span className="truncate">
                  {bloodGroupFilter === 'ALL' ? 'All Blood Groups' : `Blood: ${bloodGroupFilter}`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#121216] border border-white/15 rounded-2xl shadow-2xl p-2 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setBloodGroupFilter('ALL');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    bloodGroupFilter === 'ALL'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>All Groups</span>
                  {bloodGroupFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <div className="grid grid-cols-2 gap-1 mt-1 pt-1 border-t border-white/10">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setBloodGroupFilter(bg);
                        setIsDropdownOpen(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center justify-between ${
                        bloodGroupFilter === bg
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{bg}</span>
                      {bloodGroupFilter === bg && (
                        <Check className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Facility / Institution Dropdown (Problem 6 Isolation) */}
          {facilities.length > 0 && (
            <div className="relative w-full md:w-64" ref={facilityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                  isFacilityDropdownOpen
                    ? 'bg-[#18181c] border-emerald-500 text-white'
                    : facilityFilter !== 'ALL'
                    ? 'bg-[#18181c] border-emerald-500/50 text-emerald-300'
                    : 'bg-[#141417] border-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">
                    {facilityFilter === 'ALL' ? 'All Institutions' : facilityFilter}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${
                    isFacilityDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {isFacilityDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#121216] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityFilter('ALL');
                      setIsFacilityDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/5 hover:text-white"
                  >
                    All Institutions
                  </button>
                  {facilities.map((fac) => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => {
                        setFacilityFilter(fac);
                        setIsFacilityDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-white/5 hover:text-white truncate"
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters Summary Tray */}
        {isAnyFilterActive && (
          <div className="flex items-center gap-2 px-4 py-2 mt-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-neutral-300 animate-fadeIn">
            <span className="font-semibold text-emerald-400">Active Filters:</span>
            {activeCardFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                Card: {activeCardFilter}
              </span>
            )}
            {bloodGroupFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                Blood: {bloodGroupFilter}
              </span>
            )}
            {facilityFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                Facility: {facilityFilter}
              </span>
            )}
            {searchTerm.trim() && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px]">
                "{searchTerm}"
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 4. Unified Requisitions Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0e0e11] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#141418] text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Patient / Requester</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Units & Urgency</th>
                <th className="py-3.5 px-4">Target Institution</th>
                <th className="py-3.5 px-4">Required By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span>Loading blood requisitions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 text-neutral-600" />
                      <span className="font-semibold text-neutral-300">No requisitions found</span>
                      <span className="text-neutral-500 text-[11px]">
                        Try adjusting your filters or search terms
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                processed.map((req) => {
                  const isActionable = ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'].includes(req.status);
                  const isAllocated = req.status === 'ALLOCATED';
                  const isCompleted = req.status === 'COMPLETED' || req.status === 'FULFILLED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr
                      key={req.dbId}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* 1. Patient & ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs shrink-0">
                            {req.patientName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs tracking-tight flex items-center gap-1.5">
                              <span>{req.patientName}</span>
                              {req.requestType === 'CITIZEN' && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  Citizen
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                              {req.id} • {req.date}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Blood Group */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold flex items-center justify-center text-xs">
                            {req.bloodGroup}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {req.component || 'Whole Blood'}
                          </span>
                        </div>
                      </td>

                      {/* 3. Units & Urgency */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs">
                            {req.units} {req.units === 1 ? 'Unit' : 'Units'}{' '}
                            <span className="text-neutral-500 font-normal">
                              ({(req.units * 450)} ml)
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-block ${
                              req.isEmergency || req.urgency === 'EMERGENCY'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}
                          >
                            {req.isEmergency || req.urgency === 'EMERGENCY' ? 'Emergency' : 'Routine'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Target Institution */}
                      <td className="py-4 px-4">
                        <div className="text-neutral-300 font-medium text-xs truncate max-w-[180px]">
                          {req.hospital}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          Pincode: {req.pincode}
                        </div>
                      </td>

                      {/* 5. Required By */}
                      <td className="py-4 px-4 text-neutral-300 text-xs font-mono">
                        {req.requiredBy}
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1.5 ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isAllocated
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : isRejected
                              ? 'bg-neutral-800 text-neutral-400 border-neutral-700 line-through'
                              : req.status === 'ACCEPTED'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-400'
                                : isAllocated
                                ? 'bg-cyan-400 animate-ping'
                                : isActionable
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-neutral-500'
                            }`}
                          />
                          {req.status}
                        </span>
                      </td>

                      {/* 7. Action Buttons (Problem 5 & Problem 3) */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* If NOT_VERIFIED: Accept / Verify Button */}
                          {req.status === 'NOT_VERIFIED' && (
                            <button
                              onClick={() => handleAccept(req)}
                              disabled={actionLoadingId === req.dbId}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all cursor-pointer disabled:opacity-50"
                              title="Accept requisition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          )}

                          {/* Problem 5: ALLOCATE BLOOD BUTTON (for PENDING, VERIFIED, ACCEPTED) */}
                          {['PENDING', 'VERIFIED', 'ACCEPTED'].includes(req.status) && (
                            <button
                              onClick={() => handleOpenAllocateModal(req)}
                              disabled={actionLoadingId === req.dbId}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
                              title="Allocate matching blood bags from inventory"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Allocate Blood</span>
                            </button>
                          )}

                          {/* Deny / Reject Button (if actionable) */}
                          {isActionable && (
                            <button
                              onClick={() => setDenyModalReq(req)}
                              disabled={actionLoadingId === req.dbId}
                              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                              title="Deny requisition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deny</span>
                            </button>
                          )}

                          {/* If Allocated: Ready for dispatch */}
                          {isAllocated && (
                            <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Allocated ✓
                            </span>
                          )}

                          {/* If Completed */}
                          {isCompleted && (
                            <span className="text-[11px] text-emerald-400 font-mono">
                              Dispatched ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Allocate Blood Modal (Problem 5 & Problem 3) */}
      <AnimatePresence>
        {allocateModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0e0e12] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Allocate Blood to Requisition
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Patient:{' '}
                      <span className="text-white font-semibold">
                        {allocateModalReq.patientName}
                      </span>{' '}
                      • Blood Group:{' '}
                      <span className="text-red-400 font-mono font-bold">
                        {allocateModalReq.bloodGroup}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAllocateModalReq(null)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Requirement Summary Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                    Required Units
                  </span>
                  <span className="font-bold text-white text-sm">
                    {allocateModalReq.units} Bags ({(allocateModalReq.units * 450)} ml)
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                    Institution
                  </span>
                  <span className="font-semibold text-white truncate block">
                    {allocateModalReq.hospital}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                    Urgency
                  </span>
                  <span className="font-semibold text-amber-400 block">
                    {allocateModalReq.isEmergency || allocateModalReq.urgency === 'EMERGENCY' ? 'Emergency' : 'Routine'}
                  </span>
                </div>
              </div>

              {/* Candidate Bags in Inventory */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Candidate Blood Bags in Cryogenic Vault</span>
                  <span className="text-neutral-400 text-[11px] font-normal">
                    {candidateBags.length} Available Units Found
                  </span>
                </label>

                {loadingCandidates ? (
                  <div className="p-6 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Searching cryogenic vault inventory...</span>
                  </div>
                ) : candidateBags.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs text-center space-y-1">
                    <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <p className="font-semibold">No Available {allocateModalReq.bloodGroup} Units In Vault</p>
                    <p className="text-[11px] text-neutral-400">
                      Cannot allocate immediately. Blood donations must first be fulfilled into inventory.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {candidateBags.map((bag) => {
                      const isSelected = selectedBagIds.includes(bag.id);
                      return (
                        <div
                          key={bag.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBagIds(selectedBagIds.filter((id) => id !== bag.id));
                            } else {
                              setSelectedBagIds([...selectedBagIds, bag.id]);
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                              : 'bg-neutral-900 border-white/10 text-neutral-300 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-white/20 text-emerald-500 focus:ring-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-white block">
                                {bag.barcode}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Locker: {bag.cellno} • Shelf: {bag.shelfno}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] font-mono text-neutral-300 block">
                              Expires: {formatDate(bag.expiredDate)}
                            </span>
                            {bag.donorName && bag.donorName !== '—' && (
                              <span className="text-[10px] text-neutral-500">
                                Donor: {bag.donorName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Staff Allocation Notes
                </label>
                <input
                  type="text"
                  value={allocationNotes}
                  onChange={(e) => setAllocationNotes(e.target.value)}
                  placeholder="Enter allocation notes..."
                  className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocateModalReq(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAllocation}
                  disabled={
                    actionLoadingId === allocateModalReq.dbId ||
                    (candidateBags.length > 0 && selectedBagIds.length === 0)
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === allocateModalReq.dbId
                    ? 'Allocating Units...'
                    : `Confirm Allocation (${selectedBagIds.length || allocateModalReq.units} Units)`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Deny Requisition Modal */}
      <AnimatePresence>
        {denyModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e0e12] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Deny Blood Requisition</h3>
                    <p className="text-xs text-neutral-400">
                      Patient:{' '}
                      <span className="text-white font-semibold">
                        {denyModalReq.patientName}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDenyModalReq(null)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Rejection Reason
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for declining this requisition..."
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDenyModalReq(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeny}
                  disabled={actionLoadingId === denyModalReq.dbId}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg shadow-red-950/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === denyModalReq.dbId ? 'Processing...' : 'Confirm Deny'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: New Emergency Requisition Modal */}
      <AnimatePresence>
        {orderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              className="w-full max-w-lg bg-[#0e0e12] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Create Blood Requisition</h3>
                    <p className="text-xs text-neutral-400">Submit new transfusion order into unified BBMS queue</p>
                  </div>
                </div>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-3.5 pt-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.patientName}
                    onChange={(e) => setNewOrder({ ...newOrder, patientName: e.target.value })}
                    placeholder="Full patient legal name"
                    className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Blood Group
                    </label>
                    <select
                      value={newOrder.bloodGroup}
                      onChange={(e) => setNewOrder({ ...newOrder, bloodGroup: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Units Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newOrder.unitsRequested}
                      onChange={(e) => setNewOrder({ ...newOrder, unitsRequested: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Hospital / Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.hospitalName}
                    onChange={(e) => setNewOrder({ ...newOrder, hospitalName: e.target.value })}
                    placeholder="Enter hospital or blood bank name"
                    className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      value={newOrder.pincode}
                      onChange={(e) => setNewOrder({ ...newOrder, pincode: e.target.value })}
                      placeholder="Enter postal pincode"
                      className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-medium">
                      <input
                        type="checkbox"
                        checked={newOrder.isEmergency}
                        onChange={(e) => setNewOrder({ ...newOrder, isEmergency: e.target.checked })}
                        className="rounded border-white/20 text-red-500 focus:ring-0"
                      />
                      <span>Emergency Priority</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'NEW_ORDER'}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === 'NEW_ORDER' ? 'Submitting...' : 'Submit Requisition'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RecipientsPage;
