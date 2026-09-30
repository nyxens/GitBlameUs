import React, { useState, useEffect } from 'react';
import { BBMSHeader } from '@layout/BBMSHeader';
import { RecipientsPage } from './RecipientsPage';
import { DonorsPage } from './DonorsPage';
import { HistoryPage } from './HistoryPage';
import { GiverPage } from './GiverPage';
import { SeekerPage } from './SeekerPage';
import { ProfilePage } from './ProfilePage';
import {
  Boxes,
  Search,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Droplet,
  PackageCheck,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';
import { getInventoryItems, fulfillInventoryItem } from '../../services/inventoryService.js';

export const BBMSWorkspace = ({ user, onLogout, onUpdateUser }) => {
  const [activeSection, setActiveSection] = useState('inventory');

  // Inventory Search & Filter State
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryGroupFilter, setInventoryGroupFilter] = useState('ALL');
  const [inventory, setInventory] = useState([]);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [actionLoadingBarcode, setActionLoadingBarcode] = useState(null);
  const [invNotification, setInvNotification] = useState(null);

  // Load Inventory Items (including unfulfilled inbound donations)
  const loadInventory = async (showIndicator = false) => {
    if (showIndicator) setIsRefreshingInv(true);
    try {
      const items = await getInventoryItems();
      if (items && items.length > 0) {
        setInventory(items);
      }
    } catch (err) {
      console.warn('Failed to fetch inventory:', err);
    } finally {
      if (showIndicator) setIsRefreshingInv(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [activeSection]);

  // Handle fulfill inventory entry
  const handleFulfillItem = async (item) => {
    setActionLoadingBarcode(item.barcode);
    try {
      const res = await fulfillInventoryItem(item.id || item.barcode);
      if (res && res.success) {
        setInvNotification(
          `Blood donation receipt confirmed for unit ${item.barcode}! Inventory entry marked FULFILLED.`
        );
        setTimeout(() => setInvNotification(null), 5000);
        setInventory((prev) =>
          prev.map((i) =>
            i.barcode === item.barcode
              ? {
                  ...i,
                  status: 'OPTIMAL',
                  rawStatus: 'AVAILABLE',
                  component: 'Whole Blood',
                  expiry: '35 Days',
                  temp: '2.4°C',
                  units: 1,
                }
              : i
          )
        );
      }
    } catch (err) {
      console.error('Failed to fulfill inventory item:', err);
    } finally {
      setActionLoadingBarcode(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const barcode = item.barcode || '';
    const component = item.component || '';
    const donorName = item.donorName || '';
    const matchesSearch =
      barcode.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      component.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      donorName.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesGroup = inventoryGroupFilter === 'ALL' || item.type === inventoryGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const unfulfilledCount = inventory.filter((i) => i.status === 'UNFULFILLED').length;
  const totalUnits = inventory.reduce((sum, i) => sum + (i.units || 1), 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative selection:bg-purple-500 selection:text-white">
      {/* Clean BBMS Header */}
      <BBMSHeader
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
        user={user}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 pt-24 px-6 md:px-16 pb-16">
        {/* 1. INVENTORY SECTION */}
        {activeSection === 'inventory' && (
          <section className="w-full space-y-8 animate-fadeIn">
            {/* Notification Banner */}
            {invNotification && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium">{invNotification}</span>
                </div>
                <button
                  onClick={() => setInvNotification(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Boxes className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    Blood Vault <span className="font-serif italic font-normal text-purple-400">Inventory</span>
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Autonomous cryogenic vault telemetry, FEFO queue management, and real-time blood reserve monitoring.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadInventory(true)}
                  disabled={isRefreshingInv}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold group disabled:opacity-50"
                  title="Refresh Inventory"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500 ${
                      isRefreshingInv ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Refresh Inventory</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Vault Stock</span>
                  <Droplet className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {totalUnits} Units
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Across 8 blood groups</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-orange-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Unfulfilled Inbound</span>
                  <PackageCheck className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-3xl font-extrabold text-orange-400 tracking-tight">
                  {unfulfilledCount} Entries
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {unfulfilledCount > 0 ? 'Awaiting blood receipt intake' : 'All donations fulfilled'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Vault Core Temp</span>
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">2.4°C</div>
                <div className="text-[11px] text-neutral-400 mt-1">Cryo Unit: -18.2°C (Optimal)</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">FEFO Prioritized</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">100%</div>
                <div className="text-[11px] text-neutral-400 mt-1">Expiration risk defense active</div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search unit barcode, component, or donor..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <select
                value={inventoryGroupFilter}
                onChange={(e) => setInventoryGroupFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-purple-500/50 cursor-pointer w-full md:w-auto"
              >
                <option value="ALL" className="bg-neutral-900 text-white">All Blood Groups</option>
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                  <option key={bg} value={bg} className="bg-neutral-900 text-white">{bg}</option>
                ))}
              </select>
            </div>

            {/* Inventory Table */}
            <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Barcode / Vault Tag</th>
                      <th className="py-3.5 px-4 font-semibold">Blood Group</th>
                      <th className="py-3.5 px-4 font-semibold">Component</th>
                      <th className="py-3.5 px-4 font-semibold">In Stock</th>
                      <th className="py-3.5 px-4 font-semibold">Expiration / FEFO</th>
                      <th className="py-3.5 px-4 font-semibold">Telemetry Temp</th>
                      <th className="py-3.5 px-4 font-semibold">Reserve Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Intake Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300 font-sans">
                    {filteredInventory.map((item) => {
                      const isUnfulfilled = item.status === 'UNFULFILLED';

                      return (
                        <tr key={item.barcode || item.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-white">
                            <div>{item.barcode}</div>
                            {item.donorName && (
                              <div className="text-[10px] text-neutral-500 font-sans">
                                {item.donorName}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">{item.component}</td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {isUnfulfilled ? '0 Units (Awaiting)' : `${item.units} Units`}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">{item.expiry}</td>
                          <td className="py-3.5 px-4 font-mono text-cyan-400">{item.temp}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isUnfulfilled
                                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 inline-flex items-center gap-1.5'
                                  : item.status === 'CRITICAL'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : item.status === 'LOW'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isUnfulfilled && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                              )}
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isUnfulfilled ? (
                              <button
                                onClick={() => handleFulfillItem(item)}
                                disabled={actionLoadingBarcode === item.barcode}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all cursor-pointer disabled:opacity-50 ml-auto"
                                title="Confirm BBMS received blood & fulfill inventory entry"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Fulfill</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-neutral-500 font-mono">In Stock ✓</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 2. DONORS SECTION */}
        {activeSection === 'donors' && <DonorsPage />}

        {/* 3. RECIPIENTS SECTION */}
        {activeSection === 'recipients' && <RecipientsPage />}

        {/* 4. HISTORY SECTION */}
        {activeSection === 'history' && <HistoryPage />}

        {/* 5. GIVER SECTION */}
        {activeSection === 'giver' && <GiverPage user={user} />}

        {/* 6. SEEKER SECTION */}
        {activeSection === 'seeker' && <SeekerPage user={user} />}

        {/* 7. PROFILE SECTION */}
        {activeSection === 'profile' && (
          <ProfilePage user={user} onUpdateUser={onUpdateUser} />
        )}
      </main>
    </div>
  );
};

export default BBMSWorkspace;
