import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Droplet,
  Plus,
  Trash2,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Boxes,
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Activity,
  Layers,
  Gauge,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { getHospitals, createHospital, deleteHospital } from '../../services/hospitalService.js';
import { getBloodBanks, createBloodBank, deleteBloodBank } from '../../services/bloodBankService.js';

const FACILITY_CONFIG = {
  hospital: {
    title: 'Healthcare Facilities Roster',
    shortTitle: 'Hospitals',
    singular: 'Hospital',
    ownTitle: 'My Hospital Facility',
    subtitle: 'Accredited clinical hospitals, surgical trauma centers, and medical partner requisition nodes.',
    Icon: Building2,
    nameKey: 'hos_name',
    phoneKey: 'phone',
    theme: {
      accentText: 'text-blue-400',
      accentTextHover: 'hover:text-blue-300',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      borderHover: 'hover:border-blue-500/40',
      borderFocus: 'focus:border-blue-500',
      caret: 'caret-blue-400',
      iconBox: 'bg-blue-500/10 border-blue-500/20',
      primaryBtn: 'bg-blue-600 hover:bg-blue-500 border border-blue-500/30 text-white shadow-sm hover:shadow-blue-600/20',
      activeTab: 'border-blue-500 text-blue-400 bg-neutral-950',
      linkText: 'text-blue-400 hover:text-blue-300',
      progressFill: 'bg-blue-500',
      loaderText: 'text-blue-400',
    },
    list: async () => (await getHospitals()).hospitals,
    create: createHospital,
    remove: deleteHospital,
  },
  bloodbank: {
    title: 'Blood Bank Network Centers',
    shortTitle: 'Blood Banks',
    singular: 'Blood Bank',
    ownTitle: 'My Blood Bank Facility',
    subtitle: 'Regional blood banks, centralized storage depots, and transfusion distribution nodes.',
    Icon: Droplet,
    nameKey: 'bank_name',
    phoneKey: 'contact_no',
    theme: {
      accentText: 'text-red-400',
      accentTextHover: 'hover:text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      borderHover: 'hover:border-red-500/40',
      borderFocus: 'focus:border-red-500',
      caret: 'caret-red-400',
      iconBox: 'bg-red-500/10 border-red-500/20',
      primaryBtn: 'bg-red-600 hover:bg-red-500 border border-red-500/30 text-white shadow-sm hover:shadow-red-600/20',
      activeTab: 'border-red-500 text-red-400 bg-neutral-950',
      linkText: 'text-red-400 hover:text-red-300',
      progressFill: 'bg-red-500',
      loaderText: 'text-red-400',
    },
    list: async () => (await getBloodBanks()).bloodBanks,
    create: createBloodBank,
    remove: deleteBloodBank,
  },
};

const buildFields = (cfg) => [
  { key: cfg.nameKey, label: `${cfg.singular} Name`, required: true, span: 2, placeholder: `e.g. Metro Memorial ${cfg.singular}` },
  { key: 'pincode', label: 'Pincode / Postal Area', required: true, placeholder: 'e.g. 10001' },
  { key: cfg.phoneKey, label: 'Emergency Contact Phone', placeholder: '+1 (555) 019-2831' },
  { key: 'email', label: 'Dispatch Email Address', type: 'email', placeholder: 'dispatch@healthnetwork.org' },
  { key: 'capacity', label: 'Vault Inventory Capacity (Slots)', type: 'number', placeholder: '150' },
  { key: 'address', label: 'Street Address & City', span: 2, placeholder: 'e.g. 450 Health Sciences Parkway, Suite 100' },
  { key: 'latitude', label: 'Latitude Coordinate', type: 'number', placeholder: 'e.g. 40.7128' },
  { key: 'longitude', label: 'Longitude Coordinate', type: 'number', placeholder: 'e.g. -74.0060' },
];

/**
 * Healthcare Facilities & Blood Banks Management Page
 * Color-coded by facility category:
 * - Hospitals: Blue accent
 * - Blood Banks: Red / Crimson accent
 */
export const FacilitiesPage = ({ type = 'hospital', isAdmin = false }) => {
  const cfg = FACILITY_CONFIG[type] || FACILITY_CONFIG.hospital;
  const theme = cfg.theme;
  const fields = useMemo(() => buildFields(cfg), [cfg]);
  const emptyForm = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, ''])), [fields]);

  // Master Data & View States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Tab View Mode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filters
  const [search, setSearch] = useState('');

  // Form & Action States
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Inspection / Provenance Audit Modal
  const [selectedFacilityReport, setSelectedFacilityReport] = useState(null);

  // Load facilities from backend
  const loadData = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) setRefreshing(true);
      try {
        const data = await cfg.list();
        setItems(data || []);
      } catch (e) {
        setNotification({
          type: 'error',
          message: `Failed to load ${cfg.shortTitle.toLowerCase()}: ${e.message}`,
        });
      } finally {
        setLoading(false);
        if (showRefreshIndicator) setRefreshing(false);
      }
    },
    [cfg]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create facility
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cfg.create(Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '')));
      setForm(emptyForm);
      setShowForm(false);
      setNotification({
        type: 'success',
        message: `${cfg.singular} successfully registered into active network directory.`,
      });
      await loadData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to create ${cfg.singular.toLowerCase()}: ${err.message}`,
      });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  // Delete facility
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await cfg.remove(id);
      setConfirmId(null);
      setNotification({
        type: 'success',
        message: `${cfg.singular} record removed from network roster.`,
      });
      await loadData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to delete ${cfg.singular.toLowerCase()}: ${err.message}`,
      });
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered facilities
  const term = search.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    return items.filter((f) =>
      [f[cfg.nameKey], f.pincode, f.address, f.email, f[cfg.phoneKey]].some((v) =>
        (v || '').toLowerCase().includes(term)
      )
    );
  }, [items, term, cfg]);

  // Telemetry metrics
  const totalUnits = items.reduce((sum, f) => sum + (Number(f.units) || 0), 0);
  const totalCapacity = items.reduce((sum, f) => {
    const invCap = f.inventories?.reduce((s, inv) => s + (Number(inv.capacity) || 0), 0) || 0;
    return sum + (Number(f.capacity) || invCap || 0);
  }, 0);
  const activeNodesCount = items.filter((f) => (Number(f.units) || 0) > 0).length;

  const isAnyFilterActive = search.trim() !== '';

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
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? cfg.title : cfg.ownTitle}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">{cfg.subtitle}</p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            aria-label={`Refresh ${cfg.shortTitle.toLowerCase()} data`}
            className={`px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 ${theme.borderHover} text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-50`}
            title="Refresh from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${theme.accentText} group-hover:rotate-180 transition-transform duration-500 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh Data</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setForm(emptyForm);
                setShowForm(true);
              }}
              className={`px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 ${theme.borderHover} text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group`}
              title={`Register new ${cfg.singular.toLowerCase()}`}
            >
              <Plus className={`w-3.5 h-3.5 ${theme.accentText} group-hover:scale-110 transition-transform duration-200`} />
              <span>Add {cfg.singular}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Statistical Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Facilities */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Total {cfg.shortTitle}</span>
            <cfg.Icon className={`w-4 h-4 ${theme.accentText}`} />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {items.length.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">Registered network facilities</div>
        </div>

        {/* Card 2: Blood Reserves */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Vault Blood Reserves</span>
            <Boxes className={`w-4 h-4 ${theme.accentText}`} />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {totalUnits.toLocaleString()}{' '}
            <span className={`text-xs font-normal ${theme.accentText} font-sans`}>Units</span>
          </div>
          <div className="text-xs text-neutral-500">Live stored inventory units</div>
        </div>

        {/* Card 3: Storage Capacity */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Storage Capacity</span>
            <Gauge className={`w-4 h-4 ${theme.accentText}`} />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {totalCapacity ? totalCapacity.toLocaleString() : '—'}{' '}
            <span className="text-xs font-normal text-neutral-500 font-sans">Slots</span>
          </div>
          <div className="text-xs text-neutral-500">Refrigerated shelf capacity</div>
        </div>

        {/* Card 4: Active Nodes */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">Active Stock Nodes</span>
            <Activity className={`w-4 h-4 ${theme.accentText}`} />
          </div>
          <div className={`text-xl font-bold font-mono ${theme.accentText}`}>
            {activeNodesCount}{' '}
            <span className="text-xs font-normal text-neutral-500 font-sans">/ {items.length}</span>
          </div>
          <div className="text-xs text-neutral-500">Facilities currently holding units</div>
        </div>
      </div>

      {/* 3. Rectilinear Segmented Tab Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-px">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              viewMode === 'grid'
                ? theme.activeTab
                : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${theme.accentText}`} />
            <span>Facility Cards</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
              {visibleItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              viewMode === 'table'
                ? theme.activeTab
                : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${theme.accentText}`} />
            <span>Directory Table</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
              {visibleItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Search Bar & Active Filter Tray */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
          <div className="relative flex-1 w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search
                className={`w-4 h-4 text-neutral-500 group-focus-within:${theme.accentText} transition-colors`}
              />
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              placeholder={`Search ${cfg.shortTitle.toLowerCase()} by facility name, pincode, address, phone, or email...`}
              className={`w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none ${theme.borderFocus} transition-colors ${theme.caret}`}
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
        </div>

        {/* Active Filter Chips */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-400">
            <span className="text-[11px] text-neutral-500">Active search:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-200">
              <span>Keyword: &quot;{search}&quot;</span>
              <button
                type="button"
                onClick={() => setSearch('')}
                className={`hover:${theme.accentText} cursor-pointer ml-0.5`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setSearch('')}
              className={`text-[11px] ${theme.linkText} underline underline-offset-2 ml-1 cursor-pointer`}
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Content: Grid Mode vs Table Mode */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className={`w-6 h-6 animate-spin ${theme.loaderText}`} />
          <span className="text-xs font-mono">Synchronizing network facilities...</span>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-500 rounded-lg bg-neutral-950 border border-neutral-800">
          <div className="flex flex-col items-center justify-center gap-2">
            <cfg.Icon className="w-8 h-8 text-neutral-700 stroke-[1.5]" />
            <span className="font-medium text-neutral-400">
              {items.length === 0 && !isAdmin
                ? `Your operator account is not currently linked to a registered ${cfg.singular.toLowerCase()}.`
                : `No ${cfg.shortTitle.toLowerCase()} match your search query.`}
            </span>
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className={`mt-1 text-xs ${theme.linkText} underline cursor-pointer`}
              >
                Reset search filter
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode: Rectilinear Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((f) => {
            const facilityCapacity =
              f.capacity ||
              f.inventories?.reduce((s, inv) => s + (Number(inv.capacity) || 0), 0) ||
              100;
            const pct = facilityCapacity
              ? Math.min(100, Math.round(((f.units || 0) / facilityCapacity) * 100))
              : 0;

            return (
              <div
                key={f._id}
                className={`rounded-lg bg-neutral-950 border border-neutral-800 ${theme.borderHover} transition-colors p-5 space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Name, Badge & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                        {f[cfg.nameKey]}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded ${theme.badge} text-[10px] font-mono font-bold uppercase tracking-wider`}>
                          {cfg.singular} Node
                        </span>
                        {f.pincode && (
                          <span className="text-[11px] font-mono text-neutral-500">
                            PIN: {f.pincode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Admin Delete Action */}
                    {isAdmin &&
                      (confirmId === f._id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDelete(f._id)}
                            disabled={deletingId === f._id}
                            className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-red-500/50 text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === f._id ? '...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(f._id)}
                          title={`Delete ${cfg.singular.toLowerCase()}`}
                          className="p-1.5 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ))}
                  </div>

                  {/* Storage Telemetry Mini Box */}
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                        <Boxes className={`w-3.5 h-3.5 ${theme.accentText}`} /> Stored Blood Units
                      </span>
                      <span className="font-mono font-bold text-white">
                        {f.units || 0}{' '}
                        <span className={`text-[10px] font-normal ${theme.accentText} font-sans`}>Units</span>
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : theme.progressFill
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                      <span>
                        {f.units || 0} / {facilityCapacity} capacity
                      </span>
                      <span className="text-neutral-400">{pct}% filled</span>
                    </div>

                    {f.inventories?.[0] && (
                      <div className="pt-1 border-t border-neutral-800/60 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                        <span>Shelf: {f.inventories[0].shelfno}</span>
                        <span>Cell: {f.inventories[0].cellno}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact & Geo Details */}
                  <div className="space-y-1.5 text-xs text-neutral-400">
                    <div className="flex items-start gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${theme.accentText} shrink-0 mt-0.5`} />
                      <span className="truncate">{f.address || 'Standard Network Address'}</span>
                    </div>

                    {f[cfg.phoneKey] && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="font-mono text-neutral-300">{f[cfg.phoneKey]}</span>
                      </div>
                    )}

                    {f.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate text-neutral-300">{f.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Inspect Action */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    ID: {String(f._id).slice(-6).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFacilityReport(f)}
                    className={`text-xs ${theme.linkText} font-medium flex items-center gap-1 cursor-pointer transition-colors`}
                  >
                    <span>Inspect Facility</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode: Full directory table */
        <div className="w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400 font-medium border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">{cfg.singular} Name</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Location & Pincode</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Contact Dispatch</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Stored Units</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px]">Vault Capacity</th>
                  <th className="py-3 px-4 font-mono font-medium text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {visibleItems.map((f) => {
                  const facilityCapacity =
                    f.capacity ||
                    f.inventories?.reduce((s, inv) => s + (Number(inv.capacity) || 0), 0) ||
                    100;
                  const pct = facilityCapacity
                    ? Math.min(100, Math.round(((f.units || 0) / facilityCapacity) * 100))
                    : 0;

                  return (
                    <tr
                      key={f._id}
                      className="hover:bg-neutral-900/40 transition-colors border-b border-neutral-800/40"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white tracking-wide flex items-center gap-2">
                          <cfg.Icon className={`w-3.5 h-3.5 ${theme.accentText} shrink-0`} />
                          <span>{f[cfg.nameKey]}</span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          ID: {String(f._id).slice(-8).toUpperCase()}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-300 truncate max-w-[220px]">
                          {f.address || 'Standard Network Address'}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                          PIN: {f.pincode || '—'}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        <div>{f[cfg.phoneKey] || '—'}</div>
                        {f.email && <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">{f.email}</div>}
                      </td>

                      {/* Stored Units */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded ${theme.badge} font-bold font-mono text-xs`}>
                          {f.units || 0} Units
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        <div>{facilityCapacity} slots</div>
                        <div className="text-[10px] text-neutral-500">{pct}% utilized</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedFacilityReport(f)}
                            title="Inspect Facility"
                            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin &&
                            (confirmId === f._id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(f._id)}
                                  disabled={deletingId === f._id}
                                  className="px-2 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-red-500/50 text-red-400 hover:text-red-300 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                                >
                                  {deletingId === f._id ? '...' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmId(null)}
                                  className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmId(f._id)}
                                title={`Delete ${cfg.singular.toLowerCase()}`}
                                className="p-1.5 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Add Facility Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !saving && setShowForm(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${theme.iconBox} flex items-center justify-center`}>
                  <cfg.Icon className={`w-4 h-4 ${theme.accentText}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Add New {cfg.singular}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Register accredited healthcare facility into BBMS network.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {fields.map(({ key, label, required, type: inputType = 'text', span, placeholder }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    {label}
                    {required && <span className={theme.accentText}> *</span>}
                  </label>
                  <input
                    type={inputType}
                    step={inputType === 'number' ? 'any' : undefined}
                    required={required}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none ${theme.borderFocus} transition-colors`}
                  />
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 ${theme.borderHover} text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors group disabled:opacity-50`}
              >
                {saving ? (
                  <>
                    <Loader2 className={`w-3.5 h-3.5 animate-spin ${theme.loaderText}`} />
                    <span>Registering {cfg.singular}...</span>
                  </>
                ) : (
                  <>
                    <Plus className={`w-3.5 h-3.5 ${theme.accentText} group-hover:scale-110 transition-transform duration-200`} />
                    <span>Register {cfg.singular} Node</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Facility Inspection & Audit Specification Modal */}
      {selectedFacilityReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedFacilityReport(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${theme.iconBox} flex items-center justify-center`}>
                  <ShieldCheck className={`w-4 h-4 ${theme.accentText}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Facility Node Telemetry Audit
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Accredited biological station & storage specification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacilityReport(null)}
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    Facility Station
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedFacilityReport[cfg.nameKey]}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded ${theme.badge} font-bold font-mono text-xs`}>
                    {cfg.singular}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <MapPin className={`w-3 h-3 ${theme.accentText}`} /> Postal Area
                  </div>
                  <div className="text-white font-mono font-medium">
                    {selectedFacilityReport.pincode || '—'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Boxes className={`w-3 h-3 ${theme.accentText}`} /> Stored Inventory
                  </div>
                  <div className="text-white font-mono font-medium">
                    {selectedFacilityReport.units || 0} Units
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Phone className={`w-3 h-3 ${theme.accentText}`} /> Contact Phone
                  </div>
                  <div className="text-white font-mono text-[11px]">
                    {selectedFacilityReport[cfg.phoneKey] || '—'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Mail className={`w-3 h-3 ${theme.accentText}`} /> Dispatch Email
                  </div>
                  <div className="text-white truncate text-[11px]">
                    {selectedFacilityReport.email || '—'}
                  </div>
                </div>

                {selectedFacilityReport.latitude && (
                  <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Compass className={`w-3 h-3 ${theme.accentText}`} /> Geo Coordinates
                    </div>
                    <div className="text-white font-mono text-[11px]">
                      {selectedFacilityReport.latitude}, {selectedFacilityReport.longitude}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Activity className={`w-3 h-3 ${theme.accentText}`} /> Network Status
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      ACTIVE OPERATIONAL
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                  Registered Physical Address
                </div>
                <div className="text-white font-medium">
                  {selectedFacilityReport.address || 'Standard Registered Network Address'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedFacilityReport(null)}
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

export const HospitalsPage = (props) => <FacilitiesPage {...props} type="hospital" />;
export const BloodBanksPage = (props) => <FacilitiesPage {...props} type="bloodbank" />;

export default FacilitiesPage;
