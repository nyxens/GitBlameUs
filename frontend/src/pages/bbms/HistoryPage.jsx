import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  ShieldCheck,
  Boxes,
  CheckCircle2,
  Layers,
  Loader2,
  Droplets,
} from 'lucide-react';
import { getHistory } from '../../services/historyService.js';

const EVENT_TYPES = {
  BLOOD_ALLOTMENT: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  DONATION_INTAKE: 'bg-red-500/15 text-red-300 border border-red-500/30',
};

const CARD_COLORS = {
  amber: ['hover:border-amber-500/40', 'text-amber-400'],
  emerald: ['hover:border-emerald-500/40', 'text-emerald-400'],
  purple: ['hover:border-purple-500/40', 'text-purple-400'],
  cyan: ['hover:border-cyan-500/40', 'text-cyan-400'],
};

const BAD_STATUSES = ['EXPIRED', 'DISCARDED', 'REJECTED', 'CANCELLED'];

const formatTimestamp = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const relativeTime = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [historyRecords, setHistoryRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory()
      .then((res) => {
        setHistoryRecords(res.data || []);
        setSummary(res.summary || null);
      })
      .catch((e) => setError(e.message || 'Failed to load audit history.'))
      .finally(() => setLoading(false));
  }, []);

  const statusOptions = useMemo(
    () => [...new Set(historyRecords.map((r) => r.status))].sort(),
    [historyRecords]
  );

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
    const headers = ['Event ID', 'Timestamp', 'Type', 'Bag ID', 'Blood Group', 'Component', 'Entity', 'Authorized Staff', 'Ledger Hash', 'Status', 'Detail'];
    const rows = filteredHistory.map((r) => [
      r.id, new Date(r.timestamp).toISOString(), r.type, r.bagId, r.bloodGroup, r.component,
      r.entity, r.authorizedStaff, r.hash, r.status, r.detail,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
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
          disabled={filteredHistory.length === 0}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-neutral-200 hover:text-white font-semibold text-xs transition-all duration-200 flex items-center gap-2 self-start md:self-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Audit Ledger (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Logged Transactions', Icon: Layers, color: 'amber', value: summary?.totalEvents, note: 'Intakes + allotments on record' },
          {
            label: 'Expiry Compliance', Icon: ShieldCheck, color: 'emerald',
            value: summary ? (summary.allotments ? `${Math.round(((summary.allotments - summary.expiredAllotted) / summary.allotments) * 100)}%` : '—') : undefined,
            note: summary ? `${summary.expiredAllotted} expired unit(s) allotted` : '',
          },
          { label: 'Allotted Units', Icon: Boxes, color: 'purple', value: summary?.allotments, note: 'Units allocated to requisitions' },
          { label: 'Available Units', Icon: Droplets, color: 'cyan', value: summary?.availableUnits, note: `Of ${summary?.intakes ?? 0} units taken in` },
        ].map(({ label, Icon, color, value, note }) => (
          <div key={label} className={`p-5 rounded-2xl bg-neutral-950/80 border border-white/10 ${CARD_COLORS[color][0]} transition-colors`}>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
              <Icon className={`w-4 h-4 ${CARD_COLORS[color][1]}`} />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{value ?? '—'}</div>
            <div className="text-[11px] text-neutral-400 mt-1">{note}</div>
          </div>
        ))}
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
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st} className="bg-neutral-900 text-white">{st}</option>
            ))}
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
              {loading || error || filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`py-12 text-center ${error ? 'text-red-400' : 'text-neutral-500'}`}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : error || 'No audit records match the specified filters.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-white font-medium">{item.id}</div>
                      <div className="text-[10px] text-neutral-400">{formatTimestamp(item.timestamp)} • {relativeTime(item.timestamp)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide ${EVENT_TYPES[item.type]}`}
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1 ${
                        BAD_STATUSES.includes(item.status)
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}>
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
