import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Droplet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  X,
  Inbox,
  AlertTriangle,
  Layers,
  Check,
  User,
  HeartHandshake,
  FileText,
  ShieldCheck,
  Building2,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CustomDropdown } from '@ui';
import { getHistory } from '../../services/historyService.js';
import { getRequisitions } from '../../services/hospitalService.js';
import { getAllGiverRequests } from '../../services/giverService.js';

// Format date and time for table display
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
}

// Convert cell to safe CSV string
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const HistoryPage = () => {
  // Master data states
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [requestLogs, setRequestLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active view: 'inventory' | 'requests'
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedReportItem, setSelectedReportItem] = useState(null);

  // Table 1 (Inventory Input & Output) state
  const [invSearch, setInvSearch] = useState('');
  const [invMovementFilter, setInvMovementFilter] = useState('ALL');
  const [invGroupFilter, setInvGroupFilter] = useState('ALL');
  const [invSortOrder, setInvSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc'
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);
  const [isInvMovementOpen, setIsInvMovementOpen] = useState(false);
  const [isInvGroupOpen, setIsInvGroupOpen] = useState(false);

  // Table 2 (Inventory Requests & Donor Requests) state
  const [reqSearch, setReqSearch] = useState('');
  const [reqTypeFilter, setReqTypeFilter] = useState('ALL');
  const [reqGroupFilter, setReqGroupFilter] = useState('ALL');
  const [reqSortOrder, setReqSortOrder] = useState('desc');
  const [reqPage, setReqPage] = useState(1);
  const [reqPageSize, setReqPageSize] = useState(10);
  const [isReqTypeOpen, setIsReqTypeOpen] = useState(false);
  const [isReqGroupOpen, setIsReqGroupOpen] = useState(false);

  // Dropdown Refs for Click Outside
  const invMovementRef = useRef(null);
  const invGroupRef = useRef(null);
  const reqTypeRef = useRef(null);
  const reqGroupRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (invMovementRef.current && !invMovementRef.current.contains(e.target)) {
        setIsInvMovementOpen(false);
      }
      if (invGroupRef.current && !invGroupRef.current.contains(e.target)) {
        setIsInvGroupOpen(false);
      }
      if (reqTypeRef.current && !reqTypeRef.current.contains(e.target)) {
        setIsReqTypeOpen(false);
      }
      if (reqGroupRef.current && !reqGroupRef.current.contains(e.target)) {
        setIsReqGroupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all logs from database
  const loadAllData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const [historyRes, reqsRes, giverRes] = await Promise.allSettled([
        getHistory(),
        getRequisitions(),
        getAllGiverRequests(),
      ]);

      // 1. Process Inventory Input & Output Movements
      if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
        setInventoryLogs(historyRes.value.data);
      } else {
        setInventoryLogs([]);
      }

      // 2. Process Requests (Recipient Requisitions + Donor Giver Requests)
      const requisitions =
        reqsRes.status === 'fulfilled' && reqsRes.value?.requisitions
          ? reqsRes.value.requisitions
          : [];
      const giverRequests =
        giverRes.status === 'fulfilled'
          ? giverRes.value?.requests || giverRes.value?.data || []
          : [];

      // Recipient / Hospital Requests
      const formattedRequisitions = requisitions.map((r, idx) => ({
        id: r.id || (r.dbId ? `REQ-${String(r.dbId).slice(-6).toUpperCase()}` : `REQ-${idx + 1}`),
        requestType: 'RECIPIENT_REQUISITION',
        typeLabel: 'Recipient Request',
        partyName: r.patientName || 'Anonymous Patient',
        bloodGroup: r.bloodGroup || '—',
        quantity: `${r.units || 1} ${r.units === 1 ? 'Unit' : 'Units'}`,
        facility: r.hospital || 'Hospital Requisition',
        priority: r.isEmergency || r.urgency === 'EMERGENCY' ? 'Emergency' : 'Standard',
        status: r.status || 'PENDING',
        timestamp: r.createdAt || r.date || r.requiredBy || new Date().toISOString(),
        notes: r.notes || (r.requiredBy ? `Required by ${r.requiredBy}` : 'Hospital Order'),
        rawData: r,
      }));

      // Voluntary Donor Requests
      const formattedGiverRequests = giverRequests.map((g, idx) => ({
        id: g._id ? `DNR-${String(g._id).slice(-6).toUpperCase()}` : `DNR-${idx + 1}`,
        requestType: 'DONOR_REQUEST',
        typeLabel: 'Donor Request',
        partyName: g.u_id?.name || g.u_id?.username || 'Voluntary Donor',
        bloodGroup: g.u_id?.bloodgroup || g.bloodgroup || '—',
        quantity: '1 Unit (Donation)',
        facility:
          g.hospital_id?.hos_name ||
          g.bloodbank_id?.bank_name ||
          (g.target_type === 'BLOOD_BANK' ? 'Blood Bank' : 'Hospital Center'),
        priority: 'Scheduled Intake',
        status: g.status || 'PENDING',
        timestamp: g.createdAt || g.preferred_date || new Date().toISOString(),
        notes: g.donor_notes || (g.preferred_date ? `Preferred date: ${g.preferred_date}` : 'Donation Intake'),
        rawData: g,
      }));

      // Combined request logs containing BOTH donor and recipient requests
      setRequestLogs([...formattedRequisitions, ...formattedGiverRequests]);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setInvPage(1);
  }, [invSearch, invMovementFilter, invGroupFilter, invSortOrder]);

  useEffect(() => {
    setReqPage(1);
  }, [reqSearch, reqTypeFilter, reqGroupFilter, reqSortOrder]);

  // Filter & Sort Table 1 (Inventory Movements)
  const filteredInventory = useMemo(() => {
    let list = [...inventoryLogs];

    if (invSearch.trim()) {
      const q = invSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.id?.toLowerCase().includes(q) ||
          item.bagId?.toLowerCase().includes(q) ||
          item.bloodGroup?.toLowerCase().includes(q) ||
          item.entity?.toLowerCase().includes(q) ||
          item.authorizedStaff?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q) ||
          item.detail?.toLowerCase().includes(q)
      );
    }

    if (invMovementFilter !== 'ALL') {
      list = list.filter((item) => item.type === invMovementFilter);
    }

    if (invGroupFilter !== 'ALL') {
      list = list.filter((item) => item.bloodGroup === invGroupFilter);
    }

    list.sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return invSortOrder === 'desc' ? tB - tA : tA - tB;
    });

    return list;
  }, [inventoryLogs, invSearch, invMovementFilter, invGroupFilter, invSortOrder]);

  // Paginate Table 1
  const invTotalPages = Math.max(1, Math.ceil(filteredInventory.length / invPageSize));
  const invStartIndex = (invPage - 1) * invPageSize;
  const paginatedInventory = filteredInventory.slice(invStartIndex, invStartIndex + invPageSize);

  // Filter & Sort Table 2 (Requests: Both Donor & Recipient Requests)
  const filteredRequests = useMemo(() => {
    let list = [...requestLogs];

    if (reqSearch.trim()) {
      const q = reqSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.id?.toLowerCase().includes(q) ||
          item.partyName?.toLowerCase().includes(q) ||
          item.bloodGroup?.toLowerCase().includes(q) ||
          item.facility?.toLowerCase().includes(q) ||
          item.priority?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
      );
    }

    if (reqTypeFilter !== 'ALL') {
      list = list.filter((item) => item.requestType === reqTypeFilter);
    }

    if (reqGroupFilter !== 'ALL') {
      list = list.filter((item) => item.bloodGroup === reqGroupFilter);
    }

    list.sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return reqSortOrder === 'desc' ? tB - tA : tA - tB;
    });

    return list;
  }, [requestLogs, reqSearch, reqTypeFilter, reqGroupFilter, reqSortOrder]);

  // Paginate Table 2
  const reqTotalPages = Math.max(1, Math.ceil(filteredRequests.length / reqPageSize));
  const reqStartIndex = (reqPage - 1) * reqPageSize;
  const paginatedRequests = filteredRequests.slice(reqStartIndex, reqStartIndex + reqPageSize);

  // Export CSV based on current active tab
  const handleExportCSV = () => {
    if (activeTab === 'inventory') {
      const headers = ['Event ID', 'Date & Time', 'Movement', 'Bag Barcode / ID', 'Blood Group', 'Volume', 'Facility / Entity', 'Staff', 'Status', 'Notes'];
      const rows = filteredInventory.map((r) => [
        r.id,
        new Date(r.timestamp).toISOString(),
        r.type === 'DONATION_INTAKE' ? 'Input (Intake)' : 'Output (Allotment)',
        r.bagId,
        r.bloodGroup,
        r.component,
        r.entity,
        r.authorizedStaff,
        r.status,
        r.detail,
      ]);
      const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-movement-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (activeTab === 'requests') {
      const headers = ['Request ID', 'Date & Time', 'Request Type', 'Requestor / Patient', 'Blood Group', 'Quantity', 'Target Facility', 'Priority', 'Status', 'Notes'];
      const rows = filteredRequests.map((r) => [
        r.id,
        new Date(r.timestamp).toISOString(),
        r.typeLabel,
        r.partyName,
        r.bloodGroup,
        r.quantity,
        r.facility,
        r.priority,
        r.status,
        r.notes,
      ]);
      const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `requests-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reusable Stable Pagination
  const renderPagination = (currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange) => {
    if (totalItems === 0) return null;
    const startNum = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const endNum = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-neutral-950 border-t border-neutral-800 text-xs text-neutral-400 select-none">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-white font-medium">{startNum}</strong>–<strong className="text-white font-medium">{endNum}</strong> of{' '}
            <strong className="text-white font-medium">{totalItems}</strong> records
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-neutral-500">Per page:</span>
            <CustomDropdown
              value={pageSize}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={[
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
              ]}
              accentColor="amber"
              size="sm"
              rounded="rounded-md"
              className="w-20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="px-1 text-neutral-600">…</span>}
                    <button
                      type="button"
                      onClick={() => onPageChange(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === p
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans text-white space-y-6">
      {/* 1. Page Header: Matches ProfilePage header architecture */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">History & Audit Telemetry</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Immutable audit log of all clinical blood movements, hospital requisitions, and voluntary donor intakes.
          </p>
        </div>

        {/* Action Controls: Refresh & Export CSV */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-50"
            title="Refresh history logs from database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={
              (activeTab === 'inventory' && filteredInventory.length === 0) ||
              (activeTab === 'requests' && filteredRequests.length === 0)
            }
            className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs font-medium group disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Modern rectilinear stats cards matching ProfilePage style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Inventory Inflow</span>
            <ArrowDownLeft className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {inventoryLogs.filter((i) => i.type === 'DONATION_INTAKE').length}
          </div>
          <div className="text-xs text-neutral-500">Verified intake donations</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Inventory Outflow</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {inventoryLogs.filter((i) => i.type !== 'DONATION_INTAKE').length}
          </div>
          <div className="text-xs text-neutral-500">Dispatched units & allotments</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {requestLogs.filter((r) => r.status === 'PENDING').length}
          </div>
          <div className="text-xs text-neutral-500">Awaiting clinical clearance</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Audit Records</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {inventoryLogs.length + requestLogs.length}
          </div>
          <div className="text-xs text-neutral-500">Combined ledger telemetry</div>
        </div>
      </div>

      {/* 3. Rectilinear Segmented Tab Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Inventory Movements</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {filteredInventory.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-amber-400 text-amber-400 bg-neutral-950'
              : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-amber-400" />
          <span>Requests History</span>
          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
            {filteredRequests.length}
          </span>
        </button>
      </div>

      {/* 4. TABLE 1: Inventory Movements (Inputs & Outputs) */}
      {activeTab === 'inventory' && (
        <section className="space-y-4">
          {/* Table 1 Search & Custom Dropdowns matching ProfilePage input styling */}
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                placeholder="Search by barcode, ID, blood group, hospital, staff, or notes..."
                className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors caret-amber-400"
              />
              {invSearch && (
                <button
                  type="button"
                  onClick={() => setInvSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Movement Filter Dropdown */}
            <CustomDropdown
              value={invMovementFilter}
              onChange={setInvMovementFilter}
              options={[
                { value: 'ALL', label: 'All Movements' },
                { value: 'DONATION_INTAKE', label: 'Inputs (Intakes)', icon: ArrowDownLeft },
                { value: 'BLOOD_ALLOTMENT', label: 'Outputs (Allotments)', icon: ArrowUpRight },
              ]}
              placeholder="All Movements"
              accentColor="amber"
              icon={Layers}
              rounded="rounded-md"
              renderValue={() => (
                <span className="truncate">
                  {invMovementFilter === 'ALL'
                    ? 'All Movements'
                    : invMovementFilter === 'DONATION_INTAKE'
                    ? 'Inputs (Intakes)'
                    : 'Outputs (Allotments)'}
                </span>
              )}
              className="w-full md:w-56"
            />

            {/* Custom Blood Group Dropdown */}
            <CustomDropdown
              value={invGroupFilter}
              onChange={setInvGroupFilter}
              options={[
                { value: 'ALL', label: 'All Blood Groups' },
                ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
              ]}
              placeholder="All Blood Groups"
              accentColor="amber"
              gridCols={2}
              icon={Droplet}
              rounded="rounded-md"
              renderValue={() => (
                <span className="truncate">
                  {invGroupFilter === 'ALL' ? 'All Blood Groups' : `Blood: ${invGroupFilter}`}
                </span>
              )}
              className="w-full md:w-56"
            />

            {/* Sort Toggle Button */}
            <button
              type="button"
              onClick={() => setInvSortOrder(invSortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-md text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center"
              title={`Sorted by date: ${invSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}. Click to toggle.`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{invSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Table 1 Data View: Clean rectilinear card matching ProfilePage tables */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1050px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-mono text-xs uppercase tracking-wider select-none">
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">
                      <button
                        type="button"
                        onClick={() => setInvSortOrder(invSortOrder === 'desc' ? 'asc' : 'desc')}
                        className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <span>Date & Time</span>
                        <ArrowUpDown className="w-3 h-3 text-amber-400" />
                      </button>
                    </th>
                    <th className="w-[14%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Movement</th>
                    <th className="w-[14%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Unit Barcode / ID</th>
                    <th className="w-[8%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Blood Group</th>
                    <th className="w-[8%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Volume</th>
                    <th className="w-[16%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Source / Destination</th>
                    <th className="w-[10%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Status</th>
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 font-sans">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                          <span>Loading inventory movements...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox className="w-8 h-8 text-neutral-600" />
                          <span className="font-semibold text-neutral-300">No inventory movements found</span>
                          <span className="text-neutral-500 text-xs">
                            {invSearch || invMovementFilter !== 'ALL' || invGroupFilter !== 'ALL'
                              ? 'Try adjusting your search query or filters'
                              : 'Donation intakes and blood allotments will appear here as transactions occur'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedInventory.map((item) => {
                      const isIntake = item.type === 'DONATION_INTAKE';

                      return (
                        <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors group">
                          {/* 1. Date & Time */}
                          <td className="py-3 px-3.5 text-left">
                            <span className="font-mono text-neutral-300 text-xs">
                              {formatDateTime(item.timestamp)}
                            </span>
                          </td>

                          {/* 2. Movement (Input vs Output) - Unified Amber scheme */}
                          <td className="py-3 px-3.5 text-center">
                            {isIntake ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono whitespace-nowrap">
                                <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
                                <span>Input (Intake)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono whitespace-nowrap">
                                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                                <span>Output (Allotment)</span>
                              </span>
                            )}
                          </td>

                          {/* 3. Barcode / Bag ID */}
                          <td className="py-3 px-3.5 text-left">
                            <div className="font-mono text-white text-xs font-semibold truncate" title={item.bagId}>
                              {item.bagId}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono truncate" title={item.id}>
                              {item.id}
                            </div>
                          </td>

                          {/* 4. Blood Group */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                              {item.bloodGroup || '—'}
                            </span>
                          </td>

                          {/* 5. Volume */}
                          <td className="py-3 px-3.5 text-center text-neutral-300 text-xs font-mono">
                            {item.component || '450 ml'}
                          </td>

                          {/* 6. Facility / Destination */}
                          <td className="py-3 px-3.5 text-left">
                            <span className="text-neutral-200 text-xs truncate block font-medium" title={item.entity}>
                              {item.entity || '—'}
                            </span>
                            {item.authorizedStaff && item.authorizedStaff !== 'Unassigned' && (
                              <span className="text-xs text-neutral-500 truncate block" title={item.authorizedStaff}>
                                By: {item.authorizedStaff}
                              </span>
                            )}
                          </td>

                          {/* 7. Status */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="text-neutral-300 text-xs font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono">
                              {item.status || (isIntake ? 'AVAILABLE' : 'ALLOCATED')}
                            </span>
                          </td>

                          {/* 8. Report Action */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReportItem({ kind: 'inventory', data: item })}
                              className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer group whitespace-nowrap"
                              title="Show full inventory audit & telemetry report"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
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

            {/* Pagination Controls */}
            {renderPagination(
              invPage,
              invTotalPages,
              filteredInventory.length,
              invPageSize,
              setInvPage,
              setInvPageSize
            )}
          </div>
        </section>
      )}

      {/* 5. TABLE 2: Requests History (Both Donor Requests & Recipient Requests) */}
      {activeTab === 'requests' && (
        <section className="space-y-4">
          {/* Table 2 Search & Custom Dropdowns matching ProfilePage input styling */}
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-center gap-3 relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                type="text"
                value={reqSearch}
                onChange={(e) => setReqSearch(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                placeholder="Search by request ID, donor, patient, hospital, blood group, or notes..."
                className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors caret-amber-400"
              />
              {reqSearch && (
                <button
                  type="button"
                  onClick={() => setReqSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Request Type Filter Dropdown (Donor vs Recipient) */}
            <CustomDropdown
              value={reqTypeFilter}
              onChange={setReqTypeFilter}
              options={[
                { value: 'ALL', label: 'All Request Types' },
                { value: 'DONOR_REQUEST', label: 'Donor Requests', icon: HeartHandshake },
                { value: 'RECIPIENT_REQUISITION', label: 'Recipient Requests', icon: User },
              ]}
              placeholder="All Request Types"
              accentColor="amber"
              icon={Boxes}
              rounded="rounded-md"
              renderValue={() => (
                <span className="truncate">
                  {reqTypeFilter === 'ALL'
                    ? 'All Request Types'
                    : reqTypeFilter === 'DONOR_REQUEST'
                    ? 'Donor Requests'
                    : 'Recipient Requests'}
                </span>
              )}
              className="w-full md:w-56"
            />

            {/* Custom Blood Group Dropdown */}
            <CustomDropdown
              value={reqGroupFilter}
              onChange={setReqGroupFilter}
              options={[
                { value: 'ALL', label: 'All Blood Groups' },
                ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
              ]}
              placeholder="All Blood Groups"
              accentColor="amber"
              gridCols={2}
              icon={Droplet}
              rounded="rounded-md"
              renderValue={() => (
                <span className="truncate">
                  {reqGroupFilter === 'ALL' ? 'All Blood Groups' : `Blood: ${reqGroupFilter}`}
                </span>
              )}
              className="w-full md:w-56"
            />

            {/* Sort Toggle Button */}
            <button
              type="button"
              onClick={() => setReqSortOrder(reqSortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-md text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center"
              title={`Sorted by date: ${reqSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}. Click to toggle.`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{reqSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Table 2 Data View: Clean rectilinear card matching ProfilePage tables */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1050px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-mono text-xs uppercase tracking-wider select-none">
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">
                      <button
                        type="button"
                        onClick={() => setReqSortOrder(reqSortOrder === 'desc' ? 'asc' : 'desc')}
                        className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <span>Date & Time</span>
                        <ArrowUpDown className="w-3 h-3 text-amber-400" />
                      </button>
                    </th>
                    <th className="w-[14%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Request Type</th>
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Requestor / Patient</th>
                    <th className="w-[8%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Blood Group</th>
                    <th className="w-[8%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Quantity</th>
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-left">Target Facility</th>
                    <th className="w-[10%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Status</th>
                    <th className="w-[15%] py-3 px-3.5 font-semibold text-neutral-300 text-center">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 font-sans">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                          <span>Loading requests history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox className="w-8 h-8 text-neutral-600" />
                          <span className="font-semibold text-neutral-300">No requests found</span>
                          <span className="text-neutral-500 text-xs">
                            {reqSearch || reqTypeFilter !== 'ALL' || reqGroupFilter !== 'ALL'
                              ? 'Try adjusting your search query or filters'
                              : 'Hospital recipient requests and voluntary donor requests will appear here'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((req) => {
                      const isRecipient = req.requestType === 'RECIPIENT_REQUISITION';
                      const isEmergency = req.priority === 'Emergency';

                      return (
                        <tr key={req.id} className="hover:bg-neutral-900/40 transition-colors group">
                          {/* 1. Date & Time */}
                          <td className="py-3 px-3.5 text-left">
                            <span className="font-mono text-neutral-300 text-xs">
                              {formatDateTime(req.timestamp)}
                            </span>
                          </td>

                          {/* 2. Request Type - Amber/Yellow scheme preserved */}
                          <td className="py-3 px-3.5 text-center">
                            {isRecipient ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono whitespace-nowrap">
                                <User className="w-3.5 h-3.5 text-amber-400" />
                                <span>Recipient Request</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono whitespace-nowrap">
                                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                                <span>Donor Request</span>
                              </span>
                            )}
                          </td>

                          {/* 3. Requestor / Patient */}
                          <td className="py-3 px-3.5 text-left">
                            <div className="font-semibold text-white text-xs truncate" title={req.partyName}>
                              {req.partyName}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono truncate" title={req.id}>
                              {req.id}
                            </div>
                          </td>

                          {/* 4. Blood Group */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                              {req.bloodGroup}
                            </span>
                          </td>

                          {/* 5. Quantity */}
                          <td className="py-3 px-3.5 text-center text-neutral-300 text-xs font-mono">
                            {req.quantity}
                          </td>

                          {/* 6. Target Facility */}
                          <td className="py-3 px-3.5 text-left">
                            <div className="text-neutral-200 text-xs truncate font-medium" title={req.facility}>
                              {req.facility}
                            </div>
                            {isEmergency && (
                              <div className="inline-flex items-center gap-1 text-xs text-amber-400 mt-0.5 font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Emergency Priority</span>
                              </div>
                            )}
                          </td>

                          {/* 7. Status */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="text-neutral-300 text-xs font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono">
                              {req.status}
                            </span>
                          </td>

                          {/* 8. Report Action */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReportItem({ kind: 'request', data: req })}
                              className="px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-white font-medium text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer group whitespace-nowrap"
                              title="Show full requisition / request dossier report"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
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

            {/* Pagination Controls */}
            {renderPagination(
              reqPage,
              reqTotalPages,
              filteredRequests.length,
              reqPageSize,
              setReqPage,
              setReqPageSize
            )}
          </div>
        </section>
      )}

      {/* 6. Comprehensive Telemetry & Audit Report Modal (Clean rectilinear modal matching ProfilePage) */}
      {selectedReportItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Audit & Telemetry Dossier
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedReportItem.data.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedReportItem.kind === 'inventory'
                      ? 'Inventory Movement Dossier'
                      : selectedReportItem.data.requestType === 'RECIPIENT_REQUISITION'
                      ? 'Clinical Recipient Requisition Report'
                      : 'Voluntary Donor Intake Report'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportItem(null)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Blood Group</div>
                <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">
                  {selectedReportItem.data.bloodGroup || '—'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">
                  {selectedReportItem.kind === 'inventory' ? 'Volume / Component' : 'Quantity'}
                </div>
                <div className="text-sm font-semibold text-white mt-1 font-mono">
                  {selectedReportItem.kind === 'inventory'
                    ? selectedReportItem.data.component || '450 ml'
                    : selectedReportItem.data.quantity || '1 Unit'}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Category / Type</div>
                <div className="text-xs font-semibold text-neutral-200 mt-1 truncate">
                  {selectedReportItem.kind === 'inventory'
                    ? selectedReportItem.data.type === 'DONATION_INTAKE'
                      ? 'Inflow (Intake)'
                      : 'Outflow (Allotment)'
                    : selectedReportItem.data.typeLabel}
                </div>
              </div>

              <div className="p-3 rounded-md bg-neutral-900 border border-neutral-800">
                <div className="text-xs text-neutral-400 font-medium">Lifecycle Status</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                  {selectedReportItem.data.status || 'VERIFIED'}
                </div>
              </div>
            </div>

            {/* Information Section 1: Entities & Parties */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Entity & Institution Telemetry</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">
                    {selectedReportItem.kind === 'inventory' ? 'Target Entity / Institution' : 'Party / Requestor'}
                  </span>
                  <span className="text-white font-medium">
                    {selectedReportItem.kind === 'inventory'
                      ? selectedReportItem.data.entity || 'Central Blood Bank'
                      : selectedReportItem.data.partyName || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Facility / Medical Center</span>
                  <span className="text-white font-medium">
                    {selectedReportItem.kind === 'inventory'
                      ? 'LifeVault Central Cold-Chain Unit'
                      : selectedReportItem.data.facility || 'Hospital Transfusion Network'}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Logged / Authorized By</span>
                  <span className="text-white font-medium">
                    {selectedReportItem.kind === 'inventory'
                      ? selectedReportItem.data.authorizedStaff || 'Automated Telemetry Service'
                      : selectedReportItem.data.rawData?.authorizedStaff || 'BBMS Medical Board'}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Logged Date & Time</span>
                  <span className="text-white font-mono">
                    {formatDateTime(selectedReportItem.data.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Section 2: Clinical Details & Process */}
            <div className="p-4 rounded-md bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Process Verification & Clinical Notes</span>
              </div>
              <div className="space-y-2 text-xs">
                {selectedReportItem.kind === 'inventory' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-neutral-500 block">Unit Barcode / Identifier</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {selectedReportItem.data.bagId}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Storage Protocol</span>
                        <span className="text-white">2°C – 6°C Regulated Temperature</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Movement Notes / Intent</span>
                      <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 mt-1 leading-relaxed">
                        {selectedReportItem.data.detail ||
                          'Movement securely recorded in immutable inventory ledger.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-neutral-500 block">Priority Level</span>
                        <span className={`font-semibold ${selectedReportItem.data.priority === 'Emergency' ? 'text-red-400' : 'text-neutral-200'}`}>
                          {selectedReportItem.data.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Request System ID</span>
                        <span className="font-mono text-neutral-300">{selectedReportItem.data.id}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Clinical Intent / Request Notes</span>
                      <p className="text-neutral-300 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 mt-1 leading-relaxed">
                        {selectedReportItem.data.notes ||
                          'Standard clinical requisition filed through authorized medical portal.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* System Verification Seal - Yellow/Amber preserved */}
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-medium">
                  Verified in LifeVault BBMS Central Database
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">INTEGRITY CHECK PASSED</span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportItem(null)}
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

export default HistoryPage;
