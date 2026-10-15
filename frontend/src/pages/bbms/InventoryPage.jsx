import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Search,
  Droplet,
  PackageCheck,
  Hourglass,
  Gauge,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  Loader2,
  X,
  FileText,
  Check,
  ChevronDown,
  Clock,
  ShieldCheck,
  Calendar,
  HeartHandshake,
  Activity,
  Layers,
} from 'lucide-react';
import {
  getInventoryItems,
  getInventoryStock,
  getInventoryFacilities,
  fulfillInventoryItem,
  addBloodBag,
  discardBloodBag,
} from '../../services/inventoryService.js';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const STOCK_STATUS_BADGE = {
  OPTIMAL: { label: 'Optimal Stock', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  LOW: { label: 'Low Reserve', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  CRITICAL: { label: 'Critical Reserve', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

const ITEM_STATUS_CONFIG = {
  OPTIMAL: {
    label: 'Available',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  LOW: {
    label: 'Use Soon',
    cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  CRITICAL: {
    label: 'Expiring Soon',
    cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold',
  },
  EXPIRED: {
    label: 'Expired',
    cls: 'bg-neutral-900 text-neutral-400 border-neutral-700',
  },
  UNFULFILLED: {
    label: 'Awaiting Receipt',
    cls: 'bg-neutral-900 text-neutral-300 border-neutral-700',
  },
};

const EMPTY_BAG = {
  inventory_id: '',
  bloodgroup: 'O+',
  weight: '450',
  haemoglobin: '',
  pressure: '',
  expiry_days: '35',
  barcode: '',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

export const InventoryPage = () => {
  // Master data states
  const [items, setItems] = useState([]);
  const [stock, setStock] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Tab state: 'all' | 'available' | 'awaiting' | 'expiring'
  const [activeTab, setActiveTab] = useState('all');

  // Filter states
  const [facilityId, setFacilityId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  // Storage drawer state
  const [showStorageTelemetry, setShowStorageTelemetry] = useState(false);

  // Action states
  const [actionId, setActionId] = useState(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bagForm, setBagForm] = useState(EMPTY_BAG);
  const [savingBag, setSavingBag] = useState(false);

  // Unit provenance audit modal
  const [selectedReportUnit, setSelectedReportUnit] = useState(null);

  // Dropdown refs for click-outside
  const groupDropdownRef = useRef(null);
  const facilityDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)) {
        setIsGroupDropdownOpen(false);
      }
      if (facilityDropdownRef.current && !facilityDropdownRef.current.contains(e.target)) {
        setIsFacilityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data loader
  const loadData = useCallback(async (fid, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [itemList, stockRes, facilityList] = await Promise.all([
        getInventoryItems(fid),
        getInventoryStock(fid),
        getInventoryFacilities(),
      ]);
      setItems(itemList || []);
      setStock(stockRes || null);
      setFacilities(facilityList || []);
    } catch (e) {
      setNotification({
        type: 'error',
        message: `Failed to load inventory ledger: ${e.message}`,
      });
    } finally {
      setLoading(false);
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(facilityId);
  }, [loadData, facilityId]);

  // Fulfill intake
  const handleFulfill = async (item) => {
    setActionId(item.id);
    try {
      await fulfillInventoryItem(item.id);
      setNotification({
        type: 'success',
        message: `Unit ${item.barcode} received and verified into cold vault inventory.`,
      });
      await loadData(facilityId);
    } catch (e) {
      setNotification({
        type: 'error',
        message: `Failed to receive unit: ${e.message}`,
      });
    } finally {
      setActionId(null);
    }
  };

  // Discard unit
  const handleDiscard = async (item) => {
    setActionId(item.id);
    try {
      await discardBloodBag(item.id);
      setConfirmDiscardId(null);
      setNotification({
        type: 'success',
        message: `Unit ${item.barcode} logged as safely decommissioned and discarded.`,
      });
      await loadData(facilityId);
    } catch (e) {
      setNotification({
        type: 'error',
        message: `Failed to discard unit: ${e.message}`,
      });
      setConfirmDiscardId(null);
    } finally {
      setActionId(null);
    }
  };

  // Add blood bag modal
  const openAddModal = () => {
    setBagForm({
      ...EMPTY_BAG,
      inventory_id: facilities[0]?.inventoryId || '',
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSavingBag(true);
    try {
      await addBloodBag(Object.fromEntries(Object.entries(bagForm).filter(([, v]) => v !== '')));
      setShowAddModal(false);
      setNotification({
        type: 'success',
        message: 'New blood bag registered and entered into vault inventory ledger.',
      });
      await loadData(facilityId);
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to add blood bag: ${err.message}`,
      });
      setShowAddModal(false);
    } finally {
      setSavingBag(false);
    }
  };

  // Metrics computation
  const summary = stock?.summary;
  const usedPct = summary?.capacity
    ? Math.min(100, Math.round((summary.used / summary.capacity) * 100))
    : 0;
  const groupsInStock = stock ? stock.stock.filter((g) => g.units > 0).length : 0;
  const selectedInventory = facilities.find((f) => f.inventoryId === bagForm.inventory_id);

  // Tab filtering logic
  const matchesTab = (item) => {
    if (activeTab === 'available') return item.rawStatus === 'AVAILABLE';
    if (activeTab === 'awaiting') return item.status === 'UNFULFILLED';
    if (activeTab === 'expiring') {
      return item.rawStatus === 'AVAILABLE' && item.daysToExpiry !== null && item.daysToExpiry <= 7;
    }
    return true;
  };

  // Filtered and sorted items (First-Expiring First-Out)
  const processedItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((i) => selectedGroup === 'ALL' || i.type === selectedGroup)
      .filter(matchesTab)
      .filter(
        (i) =>
          !term ||
          [i.barcode, i.donorName, i.facilityName, i.cellno, i.shelfno].some((v) =>
            (v || '').toLowerCase().includes(term)
          )
      )
      .sort(
        (a, b) =>
          (a.status === 'UNFULFILLED') - (b.status === 'UNFULFILLED') ||
          (a.daysToExpiry ?? 9999) - (b.daysToExpiry ?? 9999)
      );
  }, [items, search, selectedGroup, activeTab]);

  // Tab counts
  const availableCount = items.filter((i) => i.rawStatus === 'AVAILABLE').length;
  const awaitingCount = items.filter((i) => i.status === 'UNFULFILLED').length;
  const expiringCount = items.filter(
    (i) => i.rawStatus === 'AVAILABLE' && item.daysToExpiry !== null && item.daysToExpiry <= 7
  ).length;

  const isAnyFilterActive = search.trim() !== '' || selectedGroup !== 'ALL' || facilityId !== 'ALL';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedGroup('ALL');
    setFacilityId('ALL');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans text-white space-y-6">
      {/* Toast Feedback Notification */}
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Blood Vault Inventory Ledger</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time biological unit telemetry, cold-chain shelf allocation, and FEFO inventory tracking.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadData(facilityId, true)}
            disabled={refreshing}
            aria-label="Refresh inventory data"
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={openAddModal}
            disabled={facilities.length === 0}
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-40 disabled:cursor-not-allowed"
            title="Register new blood unit"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
            <span>Add Blood Bag</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Stock */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Available Stock</span>
            <Droplet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {stock?.totalUnits ?? 0}{' '}
            <span className="text-xs font-normal text-purple-400 font-sans">Units</span>
          </div>
          <div className="text-xs text-neutral-500">{groupsInStock} of 8 blood groups in stock</div>
        </div>

        {/* Card 2: Awaiting Receipt */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Awaiting Receipt</span>
            <PackageCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {summary?.unfulfilled ?? 0}
          </div>
          <div className="text-xs text-neutral-500">
            {summary?.unfulfilled ? 'Accepted donations pending intake' : 'All donations verified'}
          </div>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Expiring ≤ 7 Days</span>
            <Hourglass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {summary?.expiringSoon ?? 0}{' '}
            <span className="text-xs font-normal text-purple-400 font-sans">Units</span>
          </div>
          <div className="text-xs text-neutral-500">
            {summary?.expired ? `${summary.expired} units expired` : 'FEFO alert window normal'}
          </div>
        </div>

        {/* Card 4: Vault Utilization */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Vault Capacity</span>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {usedPct}%{' '}
            <span className="text-xs font-normal text-neutral-500 font-sans">
              ({summary?.used ?? 0}/{summary?.capacity ?? 0})
            </span>
          </div>
          <div className="text-xs text-neutral-500">Total physical slots filled</div>
        </div>
      </div>

      {/* 3. Quick Blood Group Telemetry & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span className="font-medium flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-purple-400" /> Blood Group Stock Telemetry
          </span>
          <span className="text-[11px] text-neutral-500">Click to filter by group</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(stock?.stock || BLOOD_GROUPS.map((bg) => ({ type: bg, units: 0, status: 'CRITICAL' }))).map(
            (g) => {
              const isSelected = selectedGroup === g.type;
              const badgeCfg = STOCK_STATUS_BADGE[g.status] || STOCK_STATUS_BADGE.CRITICAL;
              return (
                <button
                  key={g.type}
                  type="button"
                  onClick={() => setSelectedGroup(isSelected ? 'ALL' : g.type)}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 text-purple-300 ring-1 ring-purple-500/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-xs text-purple-400">{g.type}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${badgeCfg.cls}`}>
                      {g.units}
                    </span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white my-1">{g.units}</div>
                  <div className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono">
                    {g.status}
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 4. Collapsible Storage Inventories Telemetry */}
      {facilities.length > 0 && (
        <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs font-semibold text-white">Cold-Chain Storage Units</h2>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                {facilities.length} {facilities.length === 1 ? 'Depot' : 'Depots'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowStorageTelemetry(!showStorageTelemetry)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showStorageTelemetry ? 'Hide Details' : 'View Storage Breakdown'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showStorageTelemetry ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {showStorageTelemetry && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-neutral-800/80">
              {facilities.map((f) => {
                const pct = f.capacity ? Math.min(100, Math.round((f.used / f.capacity) * 100)) : 0;
                const isActive = facilityId === f.facilityId;
                return (
                  <button
                    key={f.inventoryId}
                    type="button"
                    onClick={() => facilities.length > 1 && setFacilityId(isActive ? 'ALL' : f.facilityId)}
                    className={`text-left rounded-lg bg-neutral-900/60 border p-3.5 transition-all ${
                      isActive
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-neutral-800 hover:border-neutral-700'
                    } ${facilities.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{f.facilityName}</p>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-950 text-neutral-300 shrink-0">
                        {f.facilityType || 'Depot'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono mt-1">
                      <span>Cell: {f.cellno}</span>
                      <span>•</span>
                      <span>Shelf: {f.shelfno}</span>
                    </div>

                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1.5 font-mono">
                      <span>
                        {f.used} / {f.capacity} slots
                      </span>
                      <span className="text-white font-medium">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Rectilinear Segmented Tab Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'all'
              ? 'border-purple-500 text-purple-300 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-purple-400" />
          <span>All Units</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'available'
              ? 'border-purple-500 text-purple-300 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Droplet className="w-3.5 h-3.5 text-purple-400" />
          <span>Available Stock</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {availableCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('awaiting')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'awaiting'
              ? 'border-purple-500 text-purple-300 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Awaiting Receipt</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {awaitingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'expiring'
              ? 'border-purple-500 text-purple-300 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Hourglass className="w-3.5 h-3.5 text-purple-400" />
          <span>Expiring ≤ 7 Days</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {expiringCount}
          </span>
        </button>
      </div>

      {/* 6. Search Bar, Dropdowns & Active Filter Tray */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
          {/* Search Bar */}
          <div className="relative flex-1 w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder="Search by barcode, donor name, facility, cell, or shelf..."
              className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors caret-purple-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Blood Type Dropdown */}
          <div className="relative w-full md:w-52" ref={groupDropdownRef}>
            <button
              type="button"
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className={`w-full px-3.5 py-2 rounded-md border flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                isGroupDropdownOpen
                  ? 'bg-neutral-900 border-purple-500 text-white'
                  : selectedGroup !== 'ALL'
                  ? 'bg-neutral-900 border-purple-500/50 text-purple-300 hover:border-purple-500'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Droplet
                  className={`w-4 h-4 ${
                    selectedGroup !== 'ALL' ? 'text-purple-400 fill-purple-400/20' : 'text-neutral-500'
                  }`}
                />
                <span className="truncate">
                  {selectedGroup === 'ALL' ? 'All Blood Groups' : `Blood: ${selectedGroup}`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                  isGroupDropdownOpen ? 'rotate-180 text-purple-400' : ''
                }`}
              />
            </button>

            {isGroupDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-md shadow-xl p-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGroup('ALL');
                    setIsGroupDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    selectedGroup === 'ALL'
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <span>All Groups</span>
                  {selectedGroup === 'ALL' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
                <div className="grid grid-cols-2 gap-1 mt-1 pt-1 border-t border-neutral-800">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setSelectedGroup(bg);
                        setIsGroupDropdownOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        selectedGroup === bg
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span>{bg}</span>
                      {selectedGroup === bg && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Facility Filter Dropdown (When multiple facilities) */}
          {facilities.length > 1 && (
            <div className="relative w-full md:w-56" ref={facilityDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                className={`w-full px-3.5 py-2 rounded-md border flex items-center justify-between text-xs font-medium cursor-pointer transition-colors ${
                  isFacilityDropdownOpen
                    ? 'bg-neutral-900 border-purple-500 text-white'
                    : facilityId !== 'ALL'
                    ? 'bg-neutral-900 border-purple-500/50 text-purple-300 hover:border-purple-500'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2
                    className={`w-4 h-4 ${
                      facilityId !== 'ALL' ? 'text-purple-400' : 'text-neutral-500'
                    }`}
                  />
                  <span className="truncate">
                    {facilityId === 'ALL'
                      ? 'All Facilities'
                      : facilities.find((f) => f.facilityId === facilityId)?.facilityName || 'Facility'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isFacilityDropdownOpen ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {isFacilityDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-neutral-950 border border-neutral-800 rounded-md shadow-xl p-1.5 z-50 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityId('ALL');
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      facilityId === 'ALL'
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                        : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <span>All Facilities</span>
                    {facilityId === 'ALL' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                  {facilities.map((f) => (
                    <button
                      key={f.inventoryId}
                      type="button"
                      onClick={() => {
                        setFacilityId(f.facilityId);
                        setIsFacilityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer truncate ${
                        facilityId === f.facilityId
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{f.facilityName}</span>
                      {facilityId === f.facilityId && (
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters Pill Bar */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-400">
            <span className="text-[11px] text-neutral-500">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                <span>Keyword: &quot;{search}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="hover:text-purple-400 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedGroup !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                <span>Blood Group: {selectedGroup}</span>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('ALL')}
                  className="hover:text-purple-400 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {facilityId !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
                <span>
                  Facility:{' '}
                  {facilities.find((f) => f.facilityId === facilityId)?.facilityName || facilityId}
                </span>
                <button
                  type="button"
                  onClick={() => setFacilityId('ALL')}
                  className="hover:text-purple-400 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] text-purple-400 hover:text-purple-300 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 7. Inventory Data Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-xs font-mono">Synchronizing blood vault inventory...</span>
        </div>
      ) : (
        <div className="w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400 font-medium border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Barcode / Unit ID</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Blood Group</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Storage Node & Location</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Volume</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Donation Date</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Expiry (FEFO)</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Status</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {processedItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-neutral-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Boxes className="w-8 h-8 text-neutral-700 stroke-[1.5]" />
                        <span className="text-xs font-medium text-neutral-400">
                          {items.length === 0
                            ? 'No blood units in vault inventory yet.'
                            : 'No blood units match the current filter selection.'}
                        </span>
                        {isAnyFilterActive && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="mt-1 text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedItems.map((item) => {
                    const isUnfulfilled = item.status === 'UNFULFILLED';
                    const st = ITEM_STATUS_CONFIG[item.status] || {
                      label: item.status,
                      cls: 'bg-neutral-900 text-neutral-300 border-neutral-800',
                    };
                    const canDiscard =
                      !isUnfulfilled && !['ALLOCATED', 'TRANSFUSED'].includes(item.rawStatus);
                    const isExpiringSoon =
                      item.daysToExpiry !== null && item.daysToExpiry <= 7 && !isUnfulfilled;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-neutral-900/40 transition-colors border-b border-neutral-800/40"
                      >
                        {/* Barcode & Donor */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-semibold text-white tracking-wide">{item.barcode}</div>
                          {item.donorName ? (
                            <div className="text-[11px] text-neutral-400 font-sans flex items-center gap-1 mt-0.5">
                              <HeartHandshake className="w-3 h-3 text-purple-400/80" />
                              <span>{item.donorName}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-neutral-500 font-sans">Voluntary Donor</div>
                          )}
                        </td>

                        {/* Blood Group */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold font-mono text-xs">
                            {item.type}
                          </span>
                        </td>

                        {/* Facility / Location */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white flex items-center gap-1.5 max-w-[200px]">
                            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">{item.facilityName}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5">
                            <Layers className="w-3 h-3 text-neutral-600" />
                            <span>
                              {item.cellno} • {item.shelfno}
                            </span>
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          {item.volumeMl ? `${item.volumeMl} ml` : '450 ml'}
                        </td>

                        {/* Donated Date */}
                        <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                          {formatDate(item.dateOfDonation)}
                        </td>

                        {/* Expiry (FEFO) */}
                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={
                              isExpiringSoon
                                ? 'text-purple-400 font-bold flex items-center gap-1'
                                : 'text-neutral-300'
                            }
                          >
                            {isExpiringSoon && <Hourglass className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
                            {item.expiry}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-block ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Report Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReportUnit(item)}
                              title="Inspect Unit Provenance"
                              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Receive Awaiting Unit */}
                            {isUnfulfilled && (
                              <button
                                type="button"
                                onClick={() => handleFulfill(item)}
                                disabled={actionId === item.id}
                                className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 group"
                              >
                                {actionId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                                ) : (
                                  <PackageCheck className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span>Receive</span>
                              </button>
                            )}

                            {/* Discard with Confirmation */}
                            {canDiscard &&
                              (confirmDiscardId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDiscard(item)}
                                    disabled={actionId === item.id}
                                    className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-red-500/50 text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    {actionId === item.id ? '...' : 'Confirm'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDiscardId(null)}
                                    className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDiscardId(item.id)}
                                  title="Discard blood unit"
                                  className="p-1.5 rounded-md text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ))}
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
      )}

      {/* 8. Add Blood Bag Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !savingBag && setShowAddModal(false)}
        >
          <form
            onSubmit={handleAddSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Register Blood Unit</h3>
                  <p className="text-[11px] text-neutral-400">
                    Enter physical unit metrics into vault inventory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {facilities.length > 1 && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Storage Facility <span className="text-purple-400">*</span>
                  </label>
                  <select
                    required
                    value={bagForm.inventory_id}
                    onChange={(e) => setBagForm((f) => ({ ...f, inventory_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {facilities.map((f) => (
                      <option key={f.inventoryId} value={f.inventoryId} className="bg-neutral-900">
                        {f.facilityName} ({f.used}/{f.capacity} slots filled)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {facilities.length === 1 && selectedInventory && (
                <div className="col-span-2 p-2.5 rounded bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    Adding to <strong className="text-white">{selectedInventory.facilityName}</strong> (
                    {selectedInventory.used}/{selectedInventory.capacity} slots allocated)
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Blood Group <span className="text-purple-400">*</span>
                </label>
                <select
                  required
                  value={bagForm.bloodgroup}
                  onChange={(e) => setBagForm((f) => ({ ...f, bloodgroup: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono transition-colors"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg} className="bg-neutral-900">
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Volume (ml) <span className="text-purple-400">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="600"
                  required
                  placeholder="450"
                  value={bagForm.weight}
                  onChange={(e) => setBagForm((f) => ({ ...f, weight: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Haemoglobin (g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="13.5"
                  value={bagForm.haemoglobin}
                  onChange={(e) => setBagForm((f) => ({ ...f, haemoglobin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  placeholder="120/80 mmHg"
                  value={bagForm.pressure}
                  onChange={(e) => setBagForm((f) => ({ ...f, pressure: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Shelf Life (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  placeholder="35"
                  value={bagForm.expiry_days}
                  onChange={(e) => setBagForm((f) => ({ ...f, expiry_days: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank"
                  value={bagForm.barcode}
                  onChange={(e) => setBagForm((f) => ({ ...f, barcode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Modal Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingBag}
                className="w-full py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors group disabled:opacity-50"
              >
                {savingBag ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Registering into Vault...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    <span>Register Blood Unit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. Unit Inspection Provenance Audit Modal */}
      {selectedReportUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedReportUnit(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Unit Biological Provenance Audit
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Clinical cold-chain custody record & biological profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportUnit(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    Barcode Identifier
                  </div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedReportUnit.barcode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold font-mono text-sm">
                    {selectedReportUnit.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Building2 className="w-3 h-3 text-purple-400" /> Facility Depot
                  </div>
                  <div className="text-white font-medium truncate">
                    {selectedReportUnit.facilityName || 'Central LifeVault Depot'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Layers className="w-3 h-3 text-purple-400" /> Cold Storage Slot
                  </div>
                  <div className="text-white font-mono font-medium">
                    {selectedReportUnit.cellno} • {selectedReportUnit.shelfno}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Droplet className="w-3 h-3 text-purple-400" /> Volume Stored
                  </div>
                  <div className="text-white font-mono font-medium">
                    {selectedReportUnit.volumeMl ? `${selectedReportUnit.volumeMl} ml` : '450 ml'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Hourglass className="w-3 h-3 text-purple-400" /> Shelf Life (FEFO)
                  </div>
                  <div className="text-white font-mono font-medium">
                    {selectedReportUnit.expiry}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-purple-400" /> Intake Received
                  </div>
                  <div className="text-white font-mono text-[11px]">
                    {formatDate(selectedReportUnit.dateOfDonation)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Activity className="w-3 h-3 text-purple-400" /> Ledger State
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border inline-block ${
                        ITEM_STATUS_CONFIG[selectedReportUnit.status]?.cls ||
                        'bg-neutral-900 text-neutral-300'
                      }`}
                    >
                      {ITEM_STATUS_CONFIG[selectedReportUnit.status]?.label ||
                        selectedReportUnit.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReportUnit.donorName && (
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                        Voluntary Donor Provenance
                      </div>
                      <div className="text-white font-medium">{selectedReportUnit.donorName}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Verified Donor
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportUnit(null)}
                className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
