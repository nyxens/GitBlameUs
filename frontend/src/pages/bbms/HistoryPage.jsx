import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Search,
  Download,
  ShieldCheck,
  Thermometer,
  Boxes,
  Truck,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Audit and Allocation Timeline Records
  const [historyRecords] = useState([
    {
      id: 'AUD-9041',
      type: 'BLOOD_ALLOTMENT',
      categoryLabel: 'Blood Allotment',
      bagId: 'LV-UNIT-8091',
      bloodGroup: 'O-',
      component: 'PRBC',
      entity: 'St. Jude Emergency Trauma - Room 102',
      authorizedStaff: 'Dr. Marcus Vance (#STF-104)',
      timestamp: 'Today, 10:18 AM',
      relativeTime: '8 mins ago',
      hash: '0x7f4a...9b12',
      status: 'VERIFIED',
      detail: 'FEFO priority queue #1 matched to critical trauma requisition #RCP-8091.',
    },
    {
      id: 'AUD-9040',
      type: 'DONATION_INTAKE',
      categoryLabel: 'Donation Intake',
      bagId: 'LV-UNIT-8092',
      bloodGroup: 'O+',
      component: 'Whole Blood',
      entity: 'Central Regional Blood Drive Station #2',
      authorizedStaff: 'Nurse Brooklyn Simmons (#STF-202)',
      timestamp: 'Today, 09:45 AM',
      relativeTime: '41 mins ago',
      hash: '0x3c2e...88ad',
      status: 'VERIFIED',
      detail: 'Intake testing passed: Hb 14.2 g/dL, BP 118/76, vaulted into cold vault #4.',
    },
    {
      id: 'AUD-9039',
      type: 'COLD_CHAIN_SYNC',
      categoryLabel: 'Cold-Chain Audit',
      bagId: 'VAULT-EAST-01',
      bloodGroup: 'ALL RESERVES',
      component: 'Sub-Zero Plasma Unit',
      entity: 'LifeVault Autonomous Telemetry Node',
      authorizedStaff: 'Automated Sensor Watchdog',
      timestamp: 'Today, 09:00 AM',
      relativeTime: '1 hr ago',
      hash: '0x99a1...cc04',
      status: 'OPTIMAL',
      detail: 'Main vault: 2.4°C, Cryo Unit: -18.2°C. Power health 100%, zero delta drift.',
    },
    {
      id: 'AUD-9038',
      type: 'DISPATCH',
      categoryLabel: 'Emergency Dispatch',
      bagId: 'LV-UNIT-8088',
      bloodGroup: 'A+',
      component: 'Whole Blood (2 Units)',
      entity: 'Metro General ICU Courier Unit #4',
      authorizedStaff: 'Dr. Sarah Jenkins (#STF-108)',
      timestamp: 'Today, 07:30 AM',
      relativeTime: '3 hrs ago',
      hash: '0x5b33...e421',
      status: 'COMPLETED',
      detail: 'Courier verified cold-box lock: GPS tracker active, delivery verified at ICU.',
    },
    {
      id: 'AUD-9037',
      type: 'BLOOD_ALLOTMENT',
      categoryLabel: 'Blood Allotment',
      bagId: 'LV-UNIT-8084',
      bloodGroup: 'B-',
      component: 'Platelets',
      entity: 'Bellevue Acute Care Center',
      authorizedStaff: 'Dr. Elena Rostova (#STF-112)',
      timestamp: 'Yesterday, 11:15 PM',
      relativeTime: '11 hrs ago',
      hash: '0x88f2...aa90',
      status: 'VERIFIED',
      detail: 'Crossmatch verified against Patient ID #PT-4029. Delivered and transfused.',
    },
    {
      id: 'AUD-9036',
      type: 'DONATION_INTAKE',
      categoryLabel: 'Donation Intake',
      bagId: 'LV-UNIT-8083',
      bloodGroup: 'AB+',
      component: 'PRBC',
      entity: 'Community Donor Drive Node #4',
      authorizedStaff: 'Nurse Brooklyn Simmons (#STF-202)',
      timestamp: 'Yesterday, 04:30 PM',
      relativeTime: '18 hrs ago',
      hash: '0x14d0...ff78',
      status: 'VERIFIED',
      detail: 'Pathology clearance complete, barcoded and added to regional inventory queue.',
    },
    {
      id: 'AUD-9035',
      type: 'TRANSFUSION',
      categoryLabel: 'Transfusion Verified',
      bagId: 'LV-UNIT-8080',
      bloodGroup: 'O-',
      component: 'PRBC',
      entity: 'St. Jude Emergency Center Room 101',
      authorizedStaff: 'Dr. Marcus Vance (#STF-104)',
      timestamp: 'Yesterday, 02:10 PM',
      relativeTime: '20 hrs ago',
      hash: '0x6e9b...7721',
      status: 'SUCCESS',
      detail: 'Transfusion report logged successfully. Zero adverse reaction reported.',
    },
  ]);

  // Filtering
  const filteredHistory = historyRecords.filter((rec) => {
    const matchesSearch =
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.bagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.authorizedStaff.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.detail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = eventTypeFilter === 'ALL' || rec.type === eventTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = 'Event ID,Timestamp,Type,Bag ID,Blood Group,Entity,Authorized Staff,Status,Detail\n';
    const rows = historyRecords
      .map(
        (r) =>
          `"${r.id}","${r.timestamp}","${r.type}","${r.bagId}","${r.bloodGroup}","${r.entity}","${r.authorizedStaff}","${r.status}","${r.detail}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifevault-bbms-audit-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <History className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Audit & Allocation <span className="font-serif italic font-normal text-amber-400">History</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Cryptographically verified chain-of-custody, allocation logs, and real-time cold-chain compliance ledger.
            </p>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-neutral-200 hover:text-white font-semibold text-xs transition-all duration-200 flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Audit Ledger (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Logged Transactions</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">2,840</div>
          <div className="text-[11px] text-neutral-400 mt-1">100% immutable ledger entries</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FEFO Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">100%</div>
          <div className="text-[11px] text-neutral-400 mt-1">Zero expired units allocated</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Transfused Units</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">412</div>
          <div className="text-[11px] text-neutral-400 mt-1">Delivered across 14 hospitals</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cold-Chain Checks</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">1,290</div>
          <div className="text-[11px] text-neutral-400 mt-1">Autonomous 2.4°C verifications</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event ID, unit barcode, staff, or facility name..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Event Type */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Event Types</option>
            <option value="BLOOD_ALLOTMENT" className="bg-neutral-900 text-purple-400">Allotment</option>
            <option value="DONATION_INTAKE" className="bg-neutral-900 text-red-400">Donation Intake</option>
            <option value="COLD_CHAIN_SYNC" className="bg-neutral-900 text-cyan-400">Cold Chain Audit</option>
            <option value="DISPATCH" className="bg-neutral-900 text-amber-400">Emergency Dispatch</option>
            <option value="TRANSFUSION" className="bg-neutral-900 text-emerald-400">Transfusion</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Statuses</option>
            <option value="VERIFIED" className="bg-neutral-900 text-emerald-400">Verified</option>
            <option value="OPTIMAL" className="bg-neutral-900 text-cyan-400">Optimal</option>
            <option value="COMPLETED" className="bg-neutral-900 text-purple-400">Completed</option>
            <option value="SUCCESS" className="bg-neutral-900 text-emerald-400">Success</option>
          </select>
        </div>
      </div>

      {/* History Audit Table */}
      <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Event ID / Time</th>
                <th className="py-3.5 px-4 font-semibold">Event Type</th>
                <th className="py-3.5 px-4 font-semibold">Target Unit / Bag</th>
                <th className="py-3.5 px-4 font-semibold">Facility / Entity</th>
                <th className="py-3.5 px-4 font-semibold">Authorized By</th>
                <th className="py-3.5 px-4 font-semibold">Ledger Hash</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Operational Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300 font-sans">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-neutral-500">
                    No audit records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-white font-medium">{item.id}</div>
                      <div className="text-[10px] text-neutral-400">{item.relativeTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide ${
                          item.type === 'BLOOD_ALLOTMENT'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : item.type === 'DONATION_INTAKE'
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : item.type === 'COLD_CHAIN_SYNC'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : item.type === 'DISPATCH'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.categoryLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-white font-medium">{item.bagId}</div>
                      <div className="text-[10px] text-neutral-400">
                        {item.bloodGroup} • {item.component}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">{item.entity}</td>
                    <td className="py-3.5 px-4 text-neutral-300">{item.authorizedStaff}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-neutral-400">{item.hash}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 max-w-xs truncate" title={item.detail}>
                      {item.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
