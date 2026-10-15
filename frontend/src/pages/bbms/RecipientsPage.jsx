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
  User,
  MapPin,
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
import { fulfillSeekerRequest } from '../../services/seekerService.js';

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

  // Tab View State: 'all' | 'emergency' | 'actionable'
  const [activeTab, setActiveTab] = useState('all');

  // Filter States
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

  // Allocate Blood Modal
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

  // Requisition Report Modal State
  const [selectedReportReq, setSelectedReportReq] = useState(null);

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
      console.error('Failed to load requisitions from DB:', err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 1. Accept Requisition
  const handleAccept = async (req) => {
    setActionLoadingId(req.dbId);
    try {
      const res = await acceptRequisition(req.dbId);
      if (res && (res.requisition || res.data || res.success)) {
        setNotification({
          type: 'success',
          message: `Requisition for ${req.patientName} accepted. Ready for inventory allocation.`,
        });
        window.dispatchEvent(new CustomEvent('lifevault:requests-updated'));
        await loadData(false);
      } else {
        throw new Error(res?.error || 'Failed to accept requisition');
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

  // 2. Open Allocate Modal & fetch candidate blood bags from database
  const handleOpenAllocateModal = async (req) => {
    setAllocateModalReq(req);
    setSelectedBagIds([]);
    setAllocationNotes(`Allocated for ${req.patientName} at ${req.hospital}`);
    setLoadingCandidates(true);
    try {
      const bagsRes = await getCandidateBags(req.bloodGroup);
      const bags = bagsRes?.bags || bagsRes?.data || [];
      setCandidateBags(bags);
      // Auto-select needed number of bags if available
      const needed = Number(req.units) || 1;
      const initialSelected = bags.slice(0, needed).map((b) => b.id);
      setSelectedBagIds(initialSelected);
    } catch (err) {
      console.error('Failed to load candidate bags:', err);
      setCandidateBags([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // 3. Confirm Allocation of candidate bags
  const handleConfirmAllocation = async () => {
    if (!allocateModalReq) return;
    setActionLoadingId(allocateModalReq.dbId);
    try {
      if (allocateModalReq.requestType === 'CITIZEN' && allocateModalReq.seekerId) {
        await fulfillSeekerRequest(allocateModalReq.seekerId, {
          bagIds: selectedBagIds,
          notes: allocationNotes,
        });
      } else {
        await allocateRequisition(allocateModalReq.dbId, {
          bagIds: selectedBagIds,
          notes: allocationNotes,
        });
      }

      setNotification({
        type: 'success',
        message: `Allocated ${selectedBagIds.length} blood bags for ${allocateModalReq.patientName}! Inventory updated.`,
      });
      setAllocateModalReq(null);
      await loadData(false);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Allocation failed: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Confirm Deny Requisition
  const handleConfirmDeny = async () => {
    if (!denyModalReq) return;
    setActionLoadingId(denyModalReq.dbId);
    try {
      await denyRequisition(denyModalReq.dbId, denyReason);
      setNotification({
        type: 'success',
        message: `Requisition for ${denyModalReq.patientName} declined.`,
      });
      setDenyModalReq(null);
      await loadData(false);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to deny requisition: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Delete Fulfilled / Cancelled Requisition
  const handleDelete = async (req) => {
    if (!window.confirm(`Delete record for ${req.patientName}? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(req.dbId);
    try {
      await deleteRequisition(req.dbId);
      setNotification({
        type: 'success',
        message: `Requisition for ${req.patientName} removed from queue.`,
      });
      await loadData(false);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to delete record: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Emergency Requisition Submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setActionLoadingId('NEW_ORDER');
    try {
      const res = await submitEmergencyRequisition(newOrder);
      if (res && (res.requisition || res.data || res.success)) {
        setNotification({
          type: 'success',
          message: `Emergency requisition for ${newOrder.patientName} created successfully!`,
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

  // Tab counts
  const emergencyCount = requisitions.filter(
    (r) => r.isEmergency || r.urgency === 'EMERGENCY'
  ).length;
  const actionableCount = requisitions.filter((r) =>
    ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'].includes(r.status)
  ).length;

  // Filter Pipeline based on Tab and active search/dropdown filters
  let processed = [...requisitions];

  if (activeTab === 'emergency') {
    processed = processed.filter(
      (r) => r.isEmergency || r.urgency === 'EMERGENCY'
    );
  } else if (activeTab === 'actionable') {
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
    setBloodGroupFilter('ALL');
    setFacilityFilter('ALL');
    setSearchTerm('');
  };

  const isAnyFilterActive =
    bloodGroupFilter !== 'ALL' ||
    facilityFilter !== 'ALL' ||
    searchTerm.trim() !== '';

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans text-white space-y-6">
      {/* Dynamic Toast / Feedback Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-md border flex items-center justify-between gap-3 text-xs ${
              notification.type === 'success'
                ? 'bg-neutral-900 border-emerald-500/40 text-emerald-400'
                : notification.type === 'error'
                ? 'bg-neutral-900 border-red-500/40 text-red-400'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-neutral-800 rounded transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header matching Profile & History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Recipients & Orders</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Unified queue of hospital transfusion requisitions, emergency trauma orders, and citizen requests.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setOrderModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group"
            title="Create emergency requisition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Emergency Order</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            aria-label="Refresh requisition data"
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-50"
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

      {/* 2. Purely Statistical Metric KPI Cards (Non-interactive summary boxes matching HistoryPage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Requisitions */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Total Requisitions</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.totalRequisitions.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">Hospital & citizen orders</div>
        </div>

        {/* Card 2: Emergency Trauma */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Emergency Priority</span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.emergencyTrauma.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">Immediate critical triage</div>
        </div>

        {/* Card 3: Units Demanded */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Units Demanded</span>
            <Droplet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.totalUnitsRequested.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-400 font-sans">Units</span>
          </div>
          <div className="text-xs text-neutral-500">Cumulative required bags</div>
        </div>

        {/* Card 4: Actionable Orders */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Actionable Orders</span>
            <Inbox className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {metrics.actionableOrders}
          </div>
          <div className="text-xs text-neutral-500">Awaiting allocation & dispatch</div>
        </div>
      </div>

      {/* 3. Rectilinear Segmented Tab Bar matching HistoryPage */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>All Requisitions</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {requisitions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'emergency'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
          <span>Emergency Orders</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {emergencyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('actionable')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'actionable'
              ? 'border-emerald-500 text-emerald-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-emerald-400" />
          <span>Actionable Queue</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {actionableCount}
          </span>
        </button>
      </div>

      {/* 4. Search Bar, Dropdowns & Active Filters Tray */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
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
              className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors caret-emerald-400"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
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
              className={`w-full px-3.5 py-2 rounded-md border flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                isDropdownOpen
                  ? 'bg-neutral-900 border-emerald-500 text-white'
                  : bloodGroupFilter !== 'ALL'
                  ? 'bg-neutral-900 border-emerald-500/50 text-emerald-300 hover:border-emerald-500'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
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
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-md shadow-xl p-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setBloodGroupFilter('ALL');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    bloodGroupFilter === 'ALL'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>All Groups</span>
                  {bloodGroupFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <div className="grid grid-cols-2 gap-1 mt-1 pt-1 border-t border-neutral-800">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setBloodGroupFilter(bg);
                        setIsDropdownOpen(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        bloodGroupFilter === bg
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span>{bg}</span>
                      {bloodGroupFilter === bg && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Facility / Institution Dropdown */}
          {facilities.length > 0 && (
            <div className="relative w-full md:w-64" ref={facilityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                className={`w-full px-3.5 py-2 rounded-md border flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                  isFacilityDropdownOpen
                    ? 'bg-neutral-900 border-emerald-500 text-white'
                    : facilityFilter !== 'ALL'
                    ? 'bg-neutral-900 border-emerald-500/50 text-emerald-300 hover:border-emerald-500'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">
                    {facilityFilter === 'ALL' ? 'All Institutions' : facilityFilter}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isFacilityDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {isFacilityDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-md shadow-xl p-1.5 z-50 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityFilter('ALL');
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      facilityFilter === 'ALL'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    }`}
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
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors truncate cursor-pointer ${
                        facilityFilter === fac
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
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
          <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300">
            <span className="font-semibold text-emerald-400">Active Filters:</span>
            {bloodGroupFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
                <span>Blood Group: {bloodGroupFilter}</span>
                <button
                  type="button"
                  onClick={() => setBloodGroupFilter('ALL')}
                  aria-label="Remove blood group filter"
                  className="p-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {facilityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
                <span>Facility: {facilityFilter}</span>
                <button
                  type="button"
                  onClick={() => setFacilityFilter('ALL')}
                  aria-label="Remove facility filter"
                  className="p-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
                <span>"{searchTerm}"</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search term"
                  className="p-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
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

      {/* 5. Unified Requisitions Table */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1000px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-mono text-xs uppercase tracking-wider select-none">
                <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Patient</th>
                <th className="w-[8%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Blood Group</th>
                <th className="w-[7%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Units</th>
                <th className="w-[17%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Target Institution</th>
                <th className="w-[12%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Required By</th>
                <th className="w-[11%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Status</th>
                <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Actions</th>
                <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
                      <span>Loading blood requisitions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox className="w-8 h-8 text-neutral-600" />
                      <span className="font-semibold text-neutral-300">No requisitions found</span>
                      <span className="text-neutral-500 text-xs">
                        {activeTab === 'emergency'
                          ? 'No emergency trauma orders matching your query'
                          : activeTab === 'actionable'
                          ? 'No actionable orders currently pending clearance'
                          : 'Try adjusting your filters or search terms'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                processed.map((req) => {
                  const isActionLoading = actionLoadingId === req.dbId;
                  const isEmergency = req.isEmergency || req.urgency === 'EMERGENCY';
                  const isPending = ['NOT_VERIFIED', 'PENDING', 'VERIFIED'].includes(req.status);
                  const isAccepted = req.status === 'ACCEPTED';
                  const isFulfilled = req.status === 'COMPLETED' || req.status === 'ALLOCATED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr
                      key={req.dbId || req.id}
                      className="hover:bg-neutral-900/40 transition-colors group"
                    >
                      {/* 1. Patient */}
                      <td className="py-3 px-3.5 text-left">
                        <div className="font-semibold text-white text-xs truncate" title={req.patientName}>
                          {req.patientName}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono truncate" title={req.id}>
                          {req.id}
                        </div>
                      </td>

                      {/* 2. Blood Group */}
                      <td className="py-3 px-3.5 text-center">
                        <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                          {req.bloodGroup}
                        </span>
                      </td>

                      {/* 3. Units */}
                      <td className="py-3 px-3.5 text-center text-neutral-300 text-xs font-mono">
                        {req.units} {Number(req.units) === 1 ? 'Unit' : 'Units'}
                      </td>

                      {/* 4. Target Institution */}
                      <td className="py-3 px-3.5 text-left">
                        <div className="text-neutral-200 text-xs truncate font-medium" title={req.hospital}>
                          {req.hospital}
                        </div>
                        {isEmergency && (
                          <div className="inline-flex items-center gap-1 text-xs text-red-400 mt-0.5 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Emergency Priority</span>
                          </div>
                        )}
                      </td>

                      {/* 5. Required By */}
                      <td className="py-3 px-3.5 text-center text-neutral-300 text-xs font-mono">
                        {req.requiredBy || formatDate(req.date)}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3 px-3.5 text-center">
                        <span className="text-neutral-300 text-xs font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono">
                          {isPending ? 'Pending' : isAccepted ? 'Approved' : isFulfilled ? 'Fulfilled' : isRejected ? 'Denied' : req.status}
                        </span>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleAccept(req)}
                                disabled={isActionLoading}
                                className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Accept blood requisition"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Accept</span>
                              </button>

                              <button
                                onClick={() => {
                                  setDenyModalReq(req);
                                  setDenyReason('Blood requisition denied by medical board / BBMS administration.');
                                }}
                                disabled={isActionLoading}
                                className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Deny blood requisition"
                              >
                                <X className="w-3.5 h-3.5 text-red-400" />
                                <span>Deny</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => handleOpenAllocateModal(req)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                              title="Allocate units from blood bank inventory"
                            >
                              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Allocate</span>
                            </button>
                          )}

                          {isFulfilled && (
                            <span className="text-xs text-emerald-400 font-mono whitespace-nowrap">
                              Allocated ✓
                            </span>
                          )}

                          {isRejected && (
                            <span className="text-xs text-neutral-500 font-mono whitespace-nowrap">
                              Denied ✕
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. Report Action */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReportReq(req)}
                          className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer group whitespace-nowrap"
                          title="Show full requisition dossier report"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span>Show Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Allocate Blood Modal */}
      <AnimatePresence>
        {allocateModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Allocate Blood Inventory</h3>
                    <p className="text-xs text-neutral-400">
                      Match inventory units to patient order
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAllocateModalReq(null)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Patient Order Snapshot */}
              <div className="p-3.5 rounded-md bg-neutral-900 border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Patient</span>
                  <span className="font-semibold text-white block truncate">
                    {allocateModalReq.patientName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Blood Group</span>
                  <span className="font-mono font-bold text-white block">
                    {allocateModalReq.bloodGroup}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Demanded</span>
                  <span className="font-semibold text-white block">
                    {allocateModalReq.units} Units
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Priority</span>
                  <span className={`font-semibold block ${allocateModalReq.isEmergency || allocateModalReq.urgency === 'EMERGENCY' ? 'text-red-400' : 'text-neutral-200'}`}>
                    {allocateModalReq.isEmergency || allocateModalReq.urgency === 'EMERGENCY' ? 'Emergency' : 'Routine'}
                  </span>
                </div>
              </div>

              {/* Candidate Bags in Inventory */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Candidate Blood Bags in Inventory</span>
                  <span className="text-neutral-400 text-xs font-normal">
                    {candidateBags.length} Available Units Found
                  </span>
                </label>

                {loadingCandidates ? (
                  <div className="p-6 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Searching vault inventory...</span>
                  </div>
                ) : candidateBags.length === 0 ? (
                  <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-center space-y-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <p className="font-semibold text-neutral-200">No Available {allocateModalReq.bloodGroup} Units In Vault</p>
                    <p className="text-neutral-400 text-xs">
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
                          className={`p-3 rounded-md border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-neutral-900 border-emerald-500/60 text-white'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-neutral-700 text-emerald-500 focus:ring-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-white block">
                                {bag.barcode}
                              </span>
                              <span className="text-xs text-neutral-400 font-mono">
                                Locker: {bag.cellno} • Shelf: {bag.shelfno}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono text-neutral-300 block">
                              Expires: {formatDate(bag.expiredDate)}
                            </span>
                            {bag.donorName && bag.donorName !== '—' && (
                              <span className="text-xs text-neutral-500">
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
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocateModalReq(null)}
                  className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === allocateModalReq.dbId
                    ? 'Allocating Units...'
                    : `Confirm Allocation (${selectedBagIds.length || allocateModalReq.units} Units)`}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Deny Requisition Modal */}
      <AnimatePresence>
        {denyModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Deny Blood Requisition</h3>
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
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Rejection Reason
                </label>
                <textarea
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  rows={3}
                  placeholder="State reason for declining this requisition..."
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDenyModalReq(null)}
                  className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeny}
                  disabled={actionLoadingId === denyModalReq.dbId}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === denyModalReq.dbId ? 'Processing...' : 'Confirm Deny'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: New Emergency Requisition Modal */}
      <AnimatePresence>
        {orderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Create Blood Requisition</h3>
                    <p className="text-xs text-neutral-400">Submit new transfusion order into unified BBMS queue</p>
                  </div>
                </div>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-3.5 pt-2">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.patientName}
                    onChange={(e) => setNewOrder({ ...newOrder, patientName: e.target.value })}
                    placeholder="Full patient legal name"
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Blood Group
                    </label>
                    <select
                      value={newOrder.bloodGroup}
                      onChange={(e) => setNewOrder({ ...newOrder, bloodGroup: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Units Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newOrder.unitsRequested}
                      onChange={(e) => setNewOrder({ ...newOrder, unitsRequested: e.target.value })}
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Hospital / Institution
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrder.hospitalName}
                    onChange={(e) => setNewOrder({ ...newOrder, hospitalName: e.target.value })}
                    placeholder="Enter hospital or blood bank name"
                    className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      value={newOrder.pincode}
                      onChange={(e) => setNewOrder({ ...newOrder, pincode: e.target.value })}
                      placeholder="Enter postal pincode"
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-medium">
                      <input
                        type="checkbox"
                        checked={newOrder.isEmergency}
                        onChange={(e) => setNewOrder({ ...newOrder, isEmergency: e.target.checked })}
                        className="rounded border-neutral-700 text-red-500 focus:ring-0"
                      />
                      <span>Emergency Priority</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'NEW_ORDER'}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === 'NEW_ORDER' ? 'Submitting...' : 'Submit Requisition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Clinical Requisition Comprehensive Report Modal */}
      {selectedReportReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Clinical Requisition Dossier
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedReportReq.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedReportReq.patientName} — Requisition Report
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportReq(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Blood Group</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                  {selectedReportReq.bloodGroup}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Units Demanded</div>
                <div className="text-sm font-semibold text-white mt-1 font-mono">
                  {selectedReportReq.units} {Number(selectedReportReq.units) === 1 ? 'Unit' : 'Units'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Priority</div>
                <div className={`text-xs font-semibold mt-1 ${selectedReportReq.isEmergency ? 'text-red-400' : 'text-neutral-200'}`}>
                  {selectedReportReq.isEmergency ? 'Emergency Trauma' : 'Routine Clinical'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Current Status</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                  {selectedReportReq.status}
                </div>
              </div>
            </div>

            {/* Information Section 1: Patient & Medical Profile */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Patient & Clinical Requisition Profile</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Patient Name</span>
                  <span className="text-white font-medium">{selectedReportReq.patientName}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Blood Component</span>
                  <span className="text-white">{selectedReportReq.component || 'Whole Blood (450 ml)'}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Required By Date / Deadline</span>
                  <span className="text-white font-mono">{selectedReportReq.requiredBy}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Requisition Type</span>
                  <span className="text-white font-medium">
                    {selectedReportReq.requestType === 'CITIZEN' ? 'Citizen Direct Seeker Request' : 'Institutional Hospital Requisition'}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Section 2: Hospital & Attending Staff */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Institutional & Clinician Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Target Hospital / Medical Center</span>
                  <span className="text-white font-medium">{selectedReportReq.hospital}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Authorized Medical Officer</span>
                  <span className="text-white font-medium">{selectedReportReq.authorizedStaff}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Hospital Area Pincode</span>
                  <span className="text-white font-mono">{selectedReportReq.pincode}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Date of Request</span>
                  <span className="text-white font-mono">{selectedReportReq.date}</span>
                </div>
              </div>
            </div>

            {/* Information Section 3: Clinical Notes & Bag Allocation */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Allocation Telemetry & Clinical Notes</span>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-neutral-500 block">Clinical Intent / Medical Notes</span>
                  <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 mt-1 leading-relaxed">
                    {selectedReportReq.notes ||
                      'Standard emergency blood requisition for immediate clinical transfusion.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-neutral-500 block">Allocated Bag Barcodes</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {selectedReportReq.allocatedBags?.length > 0
                        ? selectedReportReq.allocatedBags.map((b) => b.barcode || b).join(', ')
                        : 'Awaiting Bag Allocation in Inventory'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Cold-Chain Standard</span>
                    <span className="text-white">2°C – 6°C Regulated Transport</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Seal */}
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">
                  Verified in LifeVault BBMS Clinical Network
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">AUDIT CLEARED</span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportReq(null)}
                className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientsPage;
