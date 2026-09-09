import React, { useState } from 'react';
import { BBMSHeader } from '@layout/BBMSHeader';
import { RecipientsPage } from './RecipientsPage';
import { DonorsPage } from './DonorsPage';
import { HistoryPage } from './HistoryPage';
import { GiverPage } from './GiverPage';
import { SeekerPage } from './SeekerPage';
import {
  Boxes,
  Search,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Droplet,
} from 'lucide-react';

export const BBMSWorkspace = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('inventory');

  // Inventory Search & Filter State
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryGroupFilter, setInventoryGroupFilter] = useState('ALL');

  // Working Live Inventory Data
  const [inventory] = useState([
    { barcode: 'LV-UNIT-8091', type: 'O-', component: 'PRBC (Packed Red Cells)', units: 12, expiry: '4 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL' },
    { barcode: 'LV-UNIT-8092', type: 'O+', component: 'Whole Blood', units: 180, expiry: '28 Days', temp: '2.5°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8093', type: 'A+', component: 'FFP (Plasma)', units: 65, expiry: '120 Days', temp: '-18.2°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8094', type: 'A-', component: 'Whole Blood', units: 48, expiry: '14 Days', temp: '2.4°C', status: 'LOW' },
    { barcode: 'LV-UNIT-8095', type: 'B+', component: 'Platelets', units: 140, expiry: '3 Days (FEFO #2)', temp: '22.1°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8096', type: 'B-', component: 'PRBC', units: 8, expiry: '2 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL' },
    { barcode: 'LV-UNIT-8097', type: 'AB+', component: 'Whole Blood', units: 92, expiry: '24 Days', temp: '2.3°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8098', type: 'AB-', component: 'FFP (Plasma)', units: 28, expiry: '7 Days', temp: '-18.0°C', status: 'CRITICAL' },
  ]);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.component.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesGroup = inventoryGroupFilter === 'ALL' || item.type === inventoryGroupFilter;
    return matchesSearch && matchesGroup;
  });

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
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Stored Units</span>
                  <Droplet className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">573 Units</div>
                <div className="text-[11px] text-neutral-400 mt-1">Across 8 blood groups</div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-red-500/40 transition-colors">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Critical Reserves</span>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-3xl font-extrabold text-red-400 tracking-tight">3 Types</div>
                <div className="text-[11px] text-neutral-400 mt-1">O-, B-, AB- below threshold</div>
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
                  placeholder="Search unit barcode or component type..."
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300 font-sans">
                    {filteredInventory.map((item) => (
                      <tr key={item.barcode} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-white">{item.barcode}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-300">{item.component}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{item.units} Units</td>
                        <td className="py-3.5 px-4 text-neutral-300">{item.expiry}</td>
                        <td className="py-3.5 px-4 font-mono text-cyan-400">{item.temp}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === 'CRITICAL'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : item.status === 'LOW'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
        {activeSection === 'giver' && <GiverPage />}

        {/* 6. SEEKER SECTION */}
        {activeSection === 'seeker' && <SeekerPage />}
      </main>
    </div>
  );
};

export default BBMSWorkspace;
