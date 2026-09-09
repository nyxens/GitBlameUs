import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  CheckCircle2,
  Heart,
  Calendar,
  Droplet,
  ChevronDown,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';
import { getRegisteredDonors } from '../../services/donorService.js';

export const DonorsPage = () => {
  // Donor Data & Loading State
  const [donors, setDonors] = useState([]);
  const [metrics, setMetrics] = useState({
    registeredDonors: 0,
    eligibleNow: 0,
    totalDonatedUnits: 0,
    activeDrives: 6,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Filter States
  const [activeCardFilter, setActiveCardFilter] = useState('ALL'); // 'ALL', 'ELIGIBLE', 'TOTAL_DONATED', 'ACTIVE_DRIVES'
  const [donorSearch, setDonorSearch] = useState('');
  const [donorGroupFilter, setDonorGroupFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  // Fetch donors from database
  const loadDonors = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await getRegisteredDonors();
      if (data && data.donors) {
        setDonors(data.donors);
        if (data.metrics) {
          setMetrics(data.metrics);
        } else {
          const eligibleCount = data.donors.filter((d) => d.eligibility?.startsWith('ELIGIBLE')).length;
          const totalUnits = data.donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0);
          setMetrics({
            registeredDonors: data.donors.length,
            eligibleNow: eligibleCount,
            totalDonatedUnits: totalUnits,
            activeDrives: 6,
          });
        }
        setDbConnected(true);
      }
    } catch (err) {
      console.error('Failed to load donors from DB:', err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  // Handle Card Clicks
  const handleCardClick = (cardType) => {
    if (activeCardFilter === cardType) {
      // Toggle off if already active
      setActiveCardFilter('ALL');
    } else {
      setActiveCardFilter(cardType);
    }
  };

  // Blood group list for dropdown
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // Filter & Sort Pipeline
  let processedDonors = [...donors];

  // 1. Card Filter logic
  if (activeCardFilter === 'ELIGIBLE') {
    processedDonors = processedDonors.filter((d) => d.eligibility?.startsWith('ELIGIBLE'));
  } else if (activeCardFilter === 'TOTAL_DONATED') {
    // Sort descending by total donations and highlight top life-saving contributors
    processedDonors.sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0));
  } else if (activeCardFilter === 'ACTIVE_DRIVES') {
    // Filter donors associated with active metro community drives / participating zones
    processedDonors = processedDonors.filter((d) => d.isDriveParticipant || ['New York, NY', 'Manhattan, NY', '10001', '10002'].includes(d.city) || ['10001', '10002'].includes(d.pincode));
  }

  // 2. Blood Group Dropdown Filter
  if (donorGroupFilter !== 'ALL') {
    processedDonors = processedDonors.filter((d) => d.bloodGroup === donorGroupFilter);
  }

  // 3. Search Term Filter
  if (donorSearch.trim()) {
    const q = donorSearch.toLowerCase().trim();
    processedDonors = processedDonors.filter((d) =>
      d.name?.toLowerCase().includes(q) ||
      d.id?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q) ||
      d.bloodGroup?.toLowerCase().includes(q)
    );
  }

  const clearAllFilters = () => {
    setActiveCardFilter('ALL');
    setDonorGroupFilter('ALL');
    setDonorSearch('');
  };

  const isAnyFilterActive = activeCardFilter !== 'ALL' || donorGroupFilter !== 'ALL' || donorSearch.trim() !== '';

  return (
    <section className="w-full flex flex-col gap-5 animate-fadeIn">
      {/* 1. Header: Perfectly realigned Logo + Text without subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Realigned Logo & Heading Lockup */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(239,68,68,0.2)]">
            <Users className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              Registered <span className="font-serif italic font-normal text-red-400">Donors</span>
            </h1>
          </div>
        </div>

        {/* Right Header Actions: Refresh Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => loadDonors(true)}
            disabled={isRefreshing}
            aria-label="Refresh donor data"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold group disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-400 group-hover:rotate-180 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Donors */}
        <div
          onClick={() => handleCardClick('ALL')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('ALL')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none focus:outline-none focus:ring-0 ${
            activeCardFilter === 'ALL'
              ? 'bg-red-950/30 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-red-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-red-400 transition-colors">
                Registered Donors
              </span>
              <div className={`p-1.5 rounded-lg transition-colors ${activeCardFilter === 'ALL' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-neutral-400 group-hover:text-red-400'}`}>
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.registeredDonors.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">All voluntary DB donors</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'ALL' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card 2: Eligible Now */}
        <div
          onClick={() => handleCardClick('ELIGIBLE')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('ELIGIBLE')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none focus:outline-none focus:ring-0 ${
            activeCardFilter === 'ELIGIBLE'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-emerald-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                Eligible Now
              </span>
              <div className={`p-1.5 rounded-lg transition-colors ${activeCardFilter === 'ELIGIBLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-400 group-hover:text-emerald-400'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {metrics.eligibleNow.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Cooldown period passed</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'ELIGIBLE' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Card 3: Total Donated */}
        <div
          onClick={() => handleCardClick('TOTAL_DONATED')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('TOTAL_DONATED')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none focus:outline-none focus:ring-0 ${
            activeCardFilter === 'TOTAL_DONATED'
              ? 'bg-purple-950/30 border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-purple-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-purple-400 transition-colors">
                Total Donated
              </span>
              <div className={`p-1.5 rounded-lg transition-colors ${activeCardFilter === 'TOTAL_DONATED' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-neutral-400 group-hover:text-purple-400'}`}>
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalDonatedUnits.toLocaleString()} <span className="text-lg font-normal text-purple-400">Units</span>
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Sort by top contributors</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'TOTAL_DONATED' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              SORTED
            </span>
          </div>
        </div>

        {/* Card 4: Active Drives */}
        <div
          onClick={() => handleCardClick('ACTIVE_DRIVES')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick('ACTIVE_DRIVES')}
          className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none focus:outline-none focus:ring-0 ${
            activeCardFilter === 'ACTIVE_DRIVES'
              ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)]'
              : 'bg-[#0b0b0e] border-white/10 hover:border-amber-500/40 hover:bg-[#141418]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                Active Drives
              </span>
              <div className={`p-1.5 rounded-lg transition-colors ${activeCardFilter === 'ACTIVE_DRIVES' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-neutral-400 group-hover:text-amber-400'}`}>
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.activeDrives} <span className="text-lg font-normal text-amber-400">Drives</span>
            </div>
          </div>
          <div className="flex items-center justify-between h-5">
            <span className="text-[11px] text-neutral-400 truncate">Filter metro drive donors</span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 transition-opacity duration-200 shrink-0 ml-2 ${
                activeCardFilter === 'ACTIVE_DRIVES' ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar, Dropdown & Expandable Active Filters Tray */}
      <div className="flex flex-col">
        {/* Main Search & Blood Type Bar */}
        <div className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10 flex flex-col md:flex-row items-center gap-3 relative z-30 shadow-xl">
          {/* Modern Search Bar */}
          <div className="relative flex-1 w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-red-400 transition-colors" />
            </div>

            <input
              type="text"
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Search by donor name, ID, phone, or location..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#141417] text-white placeholder-neutral-500 rounded-xl border border-white/10 focus:outline-none focus:border-red-500/80 focus:bg-[#141417] transition-colors duration-150 text-xs caret-red-400 ring-0 focus:ring-0"
            />

            {/* Clear Search button */}
            {donorSearch && (
              <button
                type="button"
                onClick={() => setDonorSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Custom Aesthetic Blood Type Dropdown Menu */}
          <div className="relative w-full md:w-60" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors duration-150 ${
                isDropdownOpen
                  ? 'bg-[#18181c] border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : donorGroupFilter !== 'ALL'
                  ? 'bg-[#18181c] border-red-500/50 text-red-300 hover:border-red-500'
                  : 'bg-[#141417] border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <Droplet className={`w-4 h-4 ${donorGroupFilter !== 'ALL' ? 'text-red-400 fill-red-400/20' : 'text-neutral-500'}`} />
                <span>
                  {donorGroupFilter === 'ALL' ? (
                    'All Blood Groups'
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      Group:
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold">
                        {donorGroupFilter}
                      </span>
                    </span>
                  )}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-400' : ''}`}
              />
            </button>

            {/* Animated Custom Dropdown Popover */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 left-0 mt-2 p-2 rounded-2xl bg-[#09090c] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.9)] z-50 overflow-hidden"
                  style={{ backgroundColor: '#09090c' }}
                >
                  {/* 'All Blood Groups' Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setDonorGroupFilter('ALL');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      donorGroupFilter === 'ALL'
                        ? 'bg-red-500/15 text-red-400 font-bold border border-red-500/30'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-neutral-400" />
                      All Blood Groups
                    </span>
                    {donorGroupFilter === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>

                  <div className="my-1.5 border-t border-white/10" />

                  {/* Grid of Blood Types */}
                  <div className="grid grid-cols-2 gap-1">
                    {bloodGroups.map((bg) => {
                      const isSelected = donorGroupFilter === bg;
                      return (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => {
                            setDonorGroupFilter(bg);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2 rounded-xl text-left text-xs font-mono font-bold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                              : 'bg-neutral-900/60 text-neutral-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-red-400'}`} />
                            {bg}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. Active Filters Tray with CSS Grid Smooth Transition (Zero Jumps, Zero Unmount Snaps) */}
        <div
          className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAnyFilterActive
              ? 'grid-rows-[1fr] opacity-100 mt-5'
              : 'grid-rows-[0fr] opacity-0 pointer-events-none mt-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-[#0d0d10] border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 mr-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Active Filters:
                  </span>
                </div>

                {/* Card Filter Pill */}
                {activeCardFilter !== 'ALL' && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-sm ${
                      activeCardFilter === 'ELIGIBLE'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : activeCardFilter === 'TOTAL_DONATED'
                        ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {activeCardFilter === 'ELIGIBLE' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Eligible Donors Only</span>
                      </>
                    )}
                    {activeCardFilter === 'TOTAL_DONATED' && (
                      <>
                        <Heart className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Sorted by Total Donations</span>
                      </>
                    )}
                    {activeCardFilter === 'ACTIVE_DRIVES' && (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Metro Drive Participants</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveCardFilter('ALL')}
                      aria-label="Remove filter"
                      className="p-0.5 rounded-md hover:bg-white/10 transition-colors ml-1 cursor-pointer opacity-70 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Blood Group Pill */}
                {donorGroupFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold shadow-sm">
                    <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400/25 shrink-0" />
                    <span>
                      Blood Group: <strong className="font-mono text-red-200 font-bold">{donorGroupFilter}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDonorGroupFilter('ALL')}
                      aria-label="Remove blood group filter"
                      className="p-0.5 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-200 transition-colors ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Search Term Pill */}
                {donorSearch && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-neutral-200 text-xs font-semibold shadow-sm">
                    <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-[200px]">
                      "{donorSearch}"
                    </span>
                    <button
                      type="button"
                      onClick={() => setDonorSearch('')}
                      aria-label="Clear search term"
                      className="p-0.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Results Count Pellet */}
                <span className="text-[11px] font-mono text-neutral-400 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 shrink-0">
                  {processedDonors.length} {processedDonors.length === 1 ? 'record found' : 'records found'}
                </span>
              </div>

              {/* Reset All Button */}
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Fixed-Dimension, Neat & Clear Donors Data Table (Solid Dark Layering - Zero White Glitch, Zero Warping) */}
      <div className="w-full min-h-[420px] rounded-2xl bg-[#09090b] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto bg-[#09090b]">
          {/* Using table-fixed with explicit percentage colgroup so columns NEVER shift size */}
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-xs min-w-[940px] bg-[#09090b]">
            <colgroup>
              <col className="w-[23%]" />
              <col className="w-[11%]" />
              <col className="w-[15%]" />
              <col className="w-[14%]" />
              <col className="w-[17%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
            </colgroup>

            <thead className="bg-[#121215] text-neutral-400 uppercase font-mono tracking-wider text-[11px] select-none">
              <tr>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Donor ID / Name</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Blood Group</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Total Donations</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Last Donation</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Current Eligibility</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Contact Phone</th>
                <th className="py-4 px-4 font-semibold text-neutral-300 border-b border-white/10 bg-[#121215]">Location</th>
              </tr>
            </thead>

            <tbody className="text-neutral-300 font-sans bg-[#09090b]">
              {isLoading ? (
                // Loading Skeleton Rows with matching fixed widths
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="bg-[#09090b] animate-pulse">
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-4 w-32 bg-white/10 rounded mb-1.5" />
                      <div className="h-3 w-16 bg-white/5 rounded" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-6 w-12 bg-white/10 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-4 w-20 bg-white/10 rounded" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-6 w-24 bg-white/10 rounded-full" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                    </td>
                    <td className="py-4 px-4 border-b border-white/5 bg-[#09090b]">
                      <div className="h-4 w-20 bg-white/10 rounded" />
                    </td>
                  </tr>
                ))
              ) : processedDonors.length === 0 ? (
                // Clean Empty State Row
                <tr className="bg-[#09090b]">
                  <td colSpan={7} className="py-16 px-4 text-center bg-[#09090b] border-b border-white/5">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-3">
                        <Users className="w-6 h-6 text-neutral-500" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">No Donors Found</h4>
                      <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                        No registered donor records match your current filter criteria.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-semibold transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                processedDonors.map((d, index) => {
                  const isEligible = d.eligibility?.startsWith('ELIGIBLE');
                  const isTopDonor = (d.totalDonations || 0) >= 3;

                  return (
                    <tr
                      key={d.dbId || d.id || `dnr-row-${index}`}
                      className="bg-[#09090b] hover:bg-[#131317] group"
                    >
                      {/* Column 1: ID / Name */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <div className="font-semibold text-white truncate max-w-full group-hover:text-red-300 transition-colors">
                          {d.name}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-400 truncate">
                          {d.id}
                        </div>
                      </td>

                      {/* Column 2: Blood Group */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono text-xs inline-flex items-center gap-1 shadow-sm">
                          <Droplet className="w-3 h-3 text-red-400 fill-red-400/30 shrink-0" />
                          {d.bloodGroup}
                        </span>
                      </td>

                      {/* Column 3: Total Donations */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-white">
                            {d.totalDonations} {d.totalDonations === 1 ? 'Donation' : 'Donations'}
                          </span>
                          {isTopDonor && (
                            <Award
                              className="w-3.5 h-3.5 text-purple-400 shrink-0"
                              title="High-impact donor"
                            />
                          )}
                        </div>
                      </td>

                      {/* Column 4: Last Donation */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <span className="text-neutral-300 truncate block">
                          {d.lastDonation}
                        </span>
                      </td>

                      {/* Column 5: Current Eligibility */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1.5 truncate max-w-full ${
                            isEligible
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isEligible ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`}
                          />
                          <span className="truncate">{d.eligibility}</span>
                        </span>
                      </td>

                      {/* Column 6: Contact Phone */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <span className="font-mono text-neutral-400 text-xs truncate block">
                          {d.phone}
                        </span>
                      </td>

                      {/* Column 7: Location */}
                      <td className="py-3.5 px-4 overflow-hidden border-b border-white/5 bg-[#09090b] group-hover:bg-[#131317]">
                        <span className="text-neutral-300 text-xs truncate block" title={d.city}>
                          {d.city}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DonorsPage;
