import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  CheckCircle2,
  Heart,
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
  ShieldCheck,
  Calendar,
  MapPin,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import { getRegisteredDonors } from '../../services/donorService.js';
import {
  getAllGiverRequests,
  acceptDonationRequest,
  denyDonationRequest,
  fulfillDonationReceipt,
} from '../../services/giverService.js';

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

export const DonorsPage = () => {
  // Donor Data & Loading State
  const [donors, setDonors] = useState([]);
  const [giverRequests, setGiverRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    registeredDonors: 0,
    eligibleNow: 0,
    totalDonatedUnits: 0,
    incomingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Tab View State: 'donors' (Registered Donors) | 'requests' (Incoming Requests)
  const [activeTab, setActiveTab] = useState('donors');

  // Filter States
  const [donorSearch, setDonorSearch] = useState('');
  const [donorGroupFilter, setDonorGroupFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Action states for accept / deny / fulfill
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [denyModalRequest, setDenyModalRequest] = useState(null);
  const [denyReason, setDenyReason] = useState('Donation request denied by BBMS administration.');

  // Report Modal states
  const [selectedReportDonor, setSelectedReportDonor] = useState(null);
  const [selectedReportRequest, setSelectedReportRequest] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch donors and giver requests from database
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const [donorData, giverData] = await Promise.all([
        getRegisteredDonors().catch((err) => {
          console.warn('Failed to load donors from DB:', err);
          return null;
        }),
        getAllGiverRequests().catch((err) => {
          console.warn('Failed to load giver requests from DB:', err);
          return null;
        }),
      ]);

      const reqs = giverData?.requests || giverData?.data || [];
      setGiverRequests(reqs);

      if (donorData && donorData.donors) {
        setDonors(donorData.donors);
        const incomingCount = reqs.filter(
          (r) => ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'].includes(r.status)
        ).length;

        if (donorData.metrics) {
          setMetrics({
            ...donorData.metrics,
            incomingRequests: donorData.metrics.incomingRequests ?? incomingCount ?? reqs.length,
          });
        } else {
          const eligibleCount = donorData.donors.filter((d) => d.eligibility?.startsWith('ELIGIBLE')).length;
          const totalUnits = donorData.donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0);
          setMetrics({
            registeredDonors: donorData.donors.length,
            eligibleNow: eligibleCount,
            totalDonatedUnits: totalUnits,
            incomingRequests: incomingCount || reqs.length,
          });
        }
        setDbConnected(true);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
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

  // Accept a voluntary donation intake
  const handleAcceptRequest = async (req) => {
    setActionLoadingId(req._id);
    try {
      const res = await acceptDonationRequest(req._id);
      if (res && (res.request || res.data || res.success)) {
        setNotification({
          type: 'success',
          message: `Donation request for ${req.u_id?.name || 'Donor'} accepted. Donor scheduled for intake.`,
        });
        window.dispatchEvent(new CustomEvent('lifevault:requests-updated'));
        await loadData(false);
      } else {
        throw new Error(res?.error || 'Failed to accept request');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to accept request: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Deny a voluntary donation intake
  const handleDenySubmit = async () => {
    if (!denyModalRequest) return;
    const req = denyModalRequest;
    setActionLoadingId(req._id);
    try {
      const res = await denyDonationRequest(req._id, denyReason);
      if (res && (res.request || res.data || res.success)) {
        setNotification({
          type: 'success',
          message: `Donation request for ${req.u_id?.name || 'Donor'} has been denied.`,
        });
        setDenyModalRequest(null);
        await loadData(false);
      } else {
        throw new Error(res?.error || 'Failed to deny request');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to deny request: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Fulfill donation intake and create inventory unit
  const handleFulfillDonation = async (req) => {
    setActionLoadingId(req._id);
    try {
      const res = await fulfillDonationReceipt(req._id, {
        component: 'Whole Blood (450 ml)',
        notes: `Fulfilled intake from voluntary donor ${req.u_id?.name || 'Donor'}`,
      });
      if (res && (res.request || res.data || res.success)) {
        setNotification({
          type: 'success',
          message: `Donation fulfilled! Blood unit credited to vault inventory ledger.`,
        });
        await loadData(false);
      } else {
        throw new Error(res?.error || 'Failed to fulfill donation receipt');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to fulfill receipt: ${err.message}`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Blood group list for dropdown
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // Process Registered Donors list
  let processedDonors = [...donors];

  if (donorGroupFilter !== 'ALL') {
    processedDonors = processedDonors.filter((d) => d.bloodGroup === donorGroupFilter);
  }

  if (donorSearch.trim()) {
    const q = donorSearch.toLowerCase().trim();
    processedDonors = processedDonors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q) ||
        d.bloodGroup?.toLowerCase().includes(q) ||
        d.pincode?.toLowerCase().includes(q)
    );
  }

  // Process Incoming Giver Requests list
  let processedRequests = [...giverRequests];

  if (donorGroupFilter !== 'ALL') {
    processedRequests = processedRequests.filter((r) => {
      const bg = r.u_id?.bloodgroup || r.bloodgroup;
      return bg === donorGroupFilter;
    });
  }

  if (donorSearch.trim()) {
    const q = donorSearch.toLowerCase().trim();
    processedRequests = processedRequests.filter(
      (r) =>
        r.u_id?.name?.toLowerCase().includes(q) ||
        r.u_id?.username?.toLowerCase().includes(q) ||
        r.u_id?.phone?.toLowerCase().includes(q) ||
        r.u_id?.email?.toLowerCase().includes(q) ||
        r.hospital_id?.hos_name?.toLowerCase().includes(q) ||
        r.bloodbank_id?.bank_name?.toLowerCase().includes(q) ||
        r.donor_notes?.toLowerCase().includes(q)
    );
  }

  const clearAllFilters = () => {
    setDonorGroupFilter('ALL');
    setDonorSearch('');
  };

  const isAnyFilterActive = donorGroupFilter !== 'ALL' || donorSearch.trim() !== '';

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

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Voluntary Donors Ledger</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Verified donor roster, biological eligibility telemetry, and scheduled intake requests.
          </p>
        </div>

        {/* Right Header Actions: Refresh Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            aria-label="Refresh donor data"
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-red-400 group-hover:rotate-180 transition-transform duration-500 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Purely Statistical Metric KPI Cards (Non-interactive summary boxes matching HistoryPage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Donors */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Registered Donors</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.registeredDonors.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">Voluntary donor database</div>
        </div>

        {/* Card 2: Eligible Now */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Eligible Now</span>
            <CheckCircle2 className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-400">
            {metrics.eligibleNow.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">Cooldown cleared for intake</div>
        </div>

        {/* Card 3: Total Donated */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Total Donated</span>
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {metrics.totalDonatedUnits.toLocaleString()}{' '}
            <span className="text-xs font-normal text-red-400 font-sans">Units</span>
          </div>
          <div className="text-xs text-neutral-500">Actual vault ledger donations</div>
        </div>

        {/* Card 4: INCOMING DONATION REQUESTS */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Incoming Requests</span>
            <Inbox className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-400">
            {giverRequests.length}
          </div>
          <div className="text-xs text-neutral-500">Scheduled intake appointments</div>
        </div>
      </div>

      {/* 3. Rectilinear Segmented Tab Bar matching HistoryPage */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('donors')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'donors'
              ? 'border-red-500 text-red-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-red-400" />
          <span>Registered Donors</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {processedDonors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-red-500 text-red-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-red-400" />
          <span>Incoming Requests</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {processedRequests.length}
          </span>
        </button>
      </div>

      {/* 4. Search Bar, Dropdown & Active Filters Tray */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
          {/* Search Bar */}
          <div className="relative flex-1 w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
            </div>

            <input
              type="text"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder={
                activeTab === 'requests'
                  ? 'Search by donor name, phone, hospital, or notes...'
                  : 'Search by donor name, ID, phone, or pincode...'
              }
              className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors caret-red-400"
            />

            {donorSearch && (
              <button
                type="button"
                onClick={() => setDonorSearch('')}
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
                  ? 'bg-neutral-900 border-red-500 text-white'
                  : donorGroupFilter !== 'ALL'
                  ? 'bg-neutral-900 border-red-500/50 text-red-300 hover:border-red-500'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Droplet
                  className={`w-4 h-4 ${
                    donorGroupFilter !== 'ALL' ? 'text-red-400 fill-red-400/20' : 'text-neutral-500'
                  }`}
                />
                <span className="truncate">
                  {donorGroupFilter === 'ALL' ? 'All Blood Groups' : `Blood: ${donorGroupFilter}`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-red-400' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-md shadow-xl p-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setDonorGroupFilter('ALL');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    donorGroupFilter === 'ALL'
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>All Groups</span>
                  {donorGroupFilter === 'ALL' && <Check className="w-3.5 h-3.5 text-red-400" />}
                </button>
                <div className="grid grid-cols-2 gap-1 mt-1 pt-1 border-t border-neutral-800">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setDonorGroupFilter(bg);
                        setIsDropdownOpen(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        donorGroupFilter === bg
                          ? 'bg-red-500/10 text-red-300 border border-red-500/20 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span>{bg}</span>
                      {donorGroupFilter === bg && (
                        <Check className="w-3 h-3 text-red-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary Tray */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300">
            <span className="font-semibold text-red-400">Active Filters:</span>
            {donorGroupFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
                <span>Blood Group: {donorGroupFilter}</span>
                <button
                  type="button"
                  onClick={() => setDonorGroupFilter('ALL')}
                  aria-label="Remove blood group filter"
                  className="p-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {donorSearch.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
                <span>"{donorSearch}"</span>
                <button
                  type="button"
                  onClick={() => setDonorSearch('')}
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

      {/* 5. MAIN DATA TABLES SWITCHED BY TAB BAR */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'requests' ? (
            /* =========================================================================
               INCOMING DONATION REQUESTS TABLE (FROM GIVERREQUEST MODEL)
               ========================================================================= */
            <table className="w-full table-fixed min-w-[1000px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-mono text-xs uppercase tracking-wider select-none">
                  <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">
                    Donor
                  </th>
                  <th className="w-[9%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Blood Group
                  </th>
                  <th className="w-[16%] py-3 px-3.5 font-semibold text-neutral-300 text-left">
                    Target Institution
                  </th>
                  <th className="w-[12%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Preferred Date
                  </th>
                  <th className="w-[13%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Donor Contact
                  </th>
                  <th className="w-[10%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Status
                  </th>
                  <th className="w-[12%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Actions
                  </th>
                  <th className="w-[13%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Report
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/80 font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
                        <span>Loading donation requests from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="w-8 h-8 text-neutral-600" />
                        <span className="font-semibold text-neutral-300">No donation requests found</span>
                        <span className="text-neutral-500 text-xs">
                          Try adjusting your filters or search terms
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedRequests.map((req) => {
                    const donorName =
                      req.u_id?.name || req.u_id?.username || 'Voluntary Donor';
                    const bloodGroup =
                      req.u_id?.bloodgroup || req.bloodgroup || 'O+';
                    const targetFacility =
                      req.hospital_id?.hos_name ||
                      req.bloodbank_id?.bank_name ||
                      (req.target_type === 'BLOOD_BANK' ? 'Blood Bank' : 'Hospital');
                    const isPending = ['NOT_VERIFIED', 'PENDING', 'VERIFIED'].includes(req.status);
                    const isAccepted = req.status === 'ACCEPTED';
                    const isCompleted = req.status === 'COMPLETED';
                    const isRejected = req.status === 'REJECTED';
                    const isActionLoading = actionLoadingId === req._id;

                    return (
                      <tr
                        key={req._id}
                        className="hover:bg-neutral-900/40 transition-colors group"
                      >
                        {/* 1. Donor */}
                        <td className="py-3 px-3.5 text-left">
                          <span className="font-semibold text-white text-xs truncate block" title={donorName}>
                            {donorName}
                          </span>
                        </td>

                        {/* 2. Blood Group */}
                        <td className="py-3 px-3.5 text-center">
                          <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                            {bloodGroup}
                          </span>
                        </td>

                        {/* 3. Target Institution */}
                        <td className="py-3 px-3.5 text-left">
                          <span className="text-neutral-200 font-medium text-xs truncate block" title={targetFacility}>
                            {targetFacility}
                          </span>
                        </td>

                        {/* 4. Preferred Date */}
                        <td className="py-3 px-3.5 text-neutral-300 text-xs font-mono text-center">
                          {formatDate(req.preferred_date || req.createdAt)}
                        </td>

                        {/* 5. Donor Contact */}
                        <td className="py-3 px-3.5 text-neutral-300 text-xs font-mono text-center">
                          {req.u_id?.phone || req.phone || '—'}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3 px-3.5 text-center">
                          <span className="text-neutral-300 text-xs font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono">
                            {isPending ? 'Pending' : isAccepted ? 'Unfulfilled' : isCompleted ? 'Fulfilled' : isRejected ? 'Denied' : req.status}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleAcceptRequest(req)}
                                  disabled={isActionLoading}
                                  className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                  title="Accept donation request"
                                >
                                  <Check className="w-3.5 h-3.5 text-red-400" />
                                  <span>Accept</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setDenyModalRequest(req);
                                    setDenyReason('Donation request denied by BBMS administration.');
                                  }}
                                  disabled={isActionLoading}
                                  className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                  title="Deny donation request"
                                >
                                  <X className="w-3.5 h-3.5 text-red-400" />
                                  <span>Deny</span>
                                </button>
                              </>
                            )}

                            {isAccepted && (
                              <button
                                onClick={() => handleFulfillDonation(req)}
                                disabled={isActionLoading}
                                className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Blood received at BBMS. Fulfill inventory entry."
                              >
                                <PackageCheck className="w-3.5 h-3.5 text-red-400" />
                                <span>Fulfill Receipt</span>
                              </button>
                            )}

                            {isCompleted && (
                              <span className="text-xs text-red-400 font-mono whitespace-nowrap">
                                Fulfilled ✓
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
                            onClick={() => setSelectedReportRequest(req)}
                            className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/40 text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer group whitespace-nowrap"
                            title="Show full donation request dossier report"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span>Show Report</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* =========================================================================
               REGISTERED DONORS TABLE (ORIGINAL TABLE VIEW)
               ========================================================================= */
            <table className="w-full table-fixed min-w-[1000px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-mono text-xs uppercase tracking-wider select-none">
                  <th className="w-[16%] py-3 px-3.5 font-semibold text-neutral-300 text-left">
                    Donor
                  </th>
                  <th className="w-[10%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Blood Group
                  </th>
                  <th className="w-[14%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Total Donations
                  </th>
                  <th className="w-[14%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Last Donation
                  </th>
                  <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Phone
                  </th>
                  <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Pincode
                  </th>
                  <th className="w-[16%] py-3 px-3.5 font-semibold text-neutral-300 text-center">
                    Report
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/80 font-sans">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
                        <span>Loading registered donors from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedDonors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="w-8 h-8 text-neutral-600" />
                        <span className="font-semibold text-neutral-300">No donors found</span>
                        <span className="text-neutral-500 text-xs">
                          Try adjusting your filters or search terms
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedDonors.map((d, index) => {
                    return (
                      <tr
                        key={d.dbId || d.id || `dnr-row-${index}`}
                        className="hover:bg-neutral-900/40 transition-colors group"
                      >
                        <td className="py-3 px-3.5 text-left">
                          <span className="font-semibold text-white text-xs truncate block" title={d.name}>
                            {d.name}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                            {d.bloodGroup}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <span className="text-neutral-200 text-xs font-medium">
                            {d.totalDonations} {d.totalDonations === 1 ? 'donation' : 'donations'}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-neutral-300 text-xs font-mono text-center">
                          {d.lastDonation}
                        </td>

                        <td className="py-3 px-3.5 text-neutral-300 text-xs font-mono text-center">
                          {d.phone}
                        </td>

                        <td className="py-3 px-3.5 text-neutral-300 text-xs font-mono text-center">
                          {d.pincode || d.city || '—'}
                        </td>

                        {/* Report Action */}
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedReportDonor(d)}
                            className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/40 text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer group whitespace-nowrap"
                            title="Show full donor dossier & health report"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span>Show Report</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Deny Request Modal */}
      <AnimatePresence>
        {denyModalRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Deny Donation Request</h3>
                    <p className="text-xs text-neutral-400">
                      Donor:{' '}
                      <span className="text-white font-semibold">
                        {denyModalRequest.u_id?.name || denyModalRequest.u_id?.username || 'Voluntary Donor'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDenyModalRequest(null)}
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
                  placeholder="State clinical reason for declining this request..."
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDenyModalRequest(null)}
                  className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDenySubmit}
                  disabled={actionLoadingId === denyModalRequest._id}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === denyModalRequest._id ? 'Processing...' : 'Confirm Denial'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Registered Donor Dossier Report Modal */}
      {selectedReportDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider bg-red-500/10 text-red-300 border border-red-500/20">
                      Donor Record Dossier
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedReportDonor.id || selectedReportDonor.dbId}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedReportDonor.name} — Medical Audit Profile
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportDonor(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Blood Group</div>
                <div className="text-xl font-mono font-bold text-red-400 mt-0.5">
                  {selectedReportDonor.bloodGroup}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Lifetime Donations</div>
                <div className="text-sm font-semibold text-white mt-1 font-mono">
                  {selectedReportDonor.totalDonations} {selectedReportDonor.totalDonations === 1 ? 'Unit' : 'Units'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Eligibility Status</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                  {selectedReportDonor.eligibility || 'ELIGIBLE'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Last Intake</div>
                <div className="text-xs font-semibold text-neutral-200 mt-1 font-mono">
                  {selectedReportDonor.lastDonation}
                </div>
              </div>
            </div>

            {/* Information Section 1: Demographics */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Activity className="w-4 h-4 text-red-400" />
                <span>Contact & Demographic Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Donor Legal Name</span>
                  <span className="text-white font-medium">{selectedReportDonor.name}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Biological Gender</span>
                  <span className="text-white font-medium">{selectedReportDonor.gender || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Phone Number</span>
                  <span className="text-white font-mono">{selectedReportDonor.phone}</span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Postal Pincode / Area</span>
                  <span className="text-white font-mono">{selectedReportDonor.pincode || selectedReportDonor.city || '—'}</span>
                </div>
              </div>
            </div>

            {/* Information Section 2: Clinical Clearance */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Clinical Screening & Physiological History</span>
              </div>
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-500 block">Transfusion Safety Code</span>
                    <span className="font-mono text-emerald-400 font-semibold">CLEARED (HIV/HCV/HBsAg Negative)</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Hemoglobin Assessment</span>
                    <span className="text-white font-mono">&gt; 12.5 g/dL (Normal Range)</span>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 block">Medical History / Allergies</span>
                  <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 mt-1 leading-relaxed">
                    {selectedReportDonor.medicalConditions || 'No chronic cardiovascular or blood-borne contraindications recorded.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Seal */}
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-medium">
                  Verified in LifeVault BBMS Central Database
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">RECORD AUDITED</span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportDonor(null)}
                className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Voluntary Donation Intake Dossier Modal */}
      {selectedReportRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-400 shrink-0">
                  <HeartHandshake className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider bg-red-500/10 text-red-300 border border-red-500/20">
                      Donation Intake Dossier
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedReportRequest._id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedReportRequest.u_id?.name || selectedReportRequest.u_id?.username || 'Voluntary Donor'} — Intake Request
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportRequest(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Blood Group</div>
                <div className="text-xl font-mono font-bold text-red-400 mt-0.5">
                  {selectedReportRequest.u_id?.bloodgroup || selectedReportRequest.bloodgroup || '—'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Target Units</div>
                <div className="text-sm font-semibold text-white mt-1 font-mono">
                  1 Unit (Donation)
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Intake Status</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                  {selectedReportRequest.status}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Preferred Date</div>
                <div className="text-xs font-semibold text-neutral-200 mt-1 font-mono">
                  {formatDate(selectedReportRequest.preferred_date || selectedReportRequest.createdAt)}
                </div>
              </div>
            </div>

            {/* Information Section 1: Donor & Institution Details */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <Building2 className="w-4 h-4 text-red-400" />
                <span>Donor & Designated Medical Center</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Donor Name</span>
                  <span className="text-white font-medium">
                    {selectedReportRequest.u_id?.name || selectedReportRequest.u_id?.username || 'Voluntary Donor'}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Contact Phone</span>
                  <span className="text-white font-mono">
                    {selectedReportRequest.u_id?.phone || selectedReportRequest.phone || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Designated Facility</span>
                  <span className="text-white font-medium">
                    {selectedReportRequest.hospital_id?.hos_name ||
                      selectedReportRequest.bloodbank_id?.bank_name ||
                      (selectedReportRequest.target_type === 'BLOOD_BANK' ? 'Central Blood Bank' : 'General Hospital')}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Intake Type</span>
                  <span className="text-white font-medium">
                    {selectedReportRequest.target_type === 'BLOOD_BANK' ? 'Blood Bank Intake' : 'Hospital Direct Intake'}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Section 2: Clinical Intake Notes */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Intake Notes & Telemetry</span>
              </div>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-neutral-500 block">Donor Notes & Intent</span>
                  <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 mt-1 leading-relaxed">
                    {selectedReportRequest.donor_notes || 'Voluntary donation appointment scheduled through LifeVault Portal.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Seal */}
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-medium">
                  Verified in LifeVault BBMS Intake Network
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">INTAKE VERIFIED</span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportRequest(null)}
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

export default DonorsPage;
