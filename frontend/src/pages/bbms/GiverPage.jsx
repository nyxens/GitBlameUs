import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HandHeart,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  PackageCheck,
  Ban,
  ChevronDown,
  X,
  Eye,
  Building2,
  Droplet,
  Phone,
  Mail,
  User,
  FileText,
  MapPin,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { getAllGiverRequests, verifyDonationRequest, cancelDonationRequest } from '../../services/giverService.js';

/**
 * =========================================================================
 * STATUS CONFIGURATION
 * =========================================================================
 * Visual mapping for each GiverRequest status — color palette, icon, and label.
 */
const STATUS_CONFIG = {
  NOT_VERIFIED: {
    label: 'Awaiting Verification',
    color: 'amber',
    bgClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    cardBorder: 'border-amber-500',
    cardBg: 'bg-amber-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    Icon: Clock,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'emerald',
    bgClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    cardBorder: 'border-emerald-500',
    cardBg: 'bg-emerald-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    Icon: ShieldCheck,
  },
  PENDING: {
    label: 'Pending Review',
    color: 'blue',
    bgClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
    cardBorder: 'border-blue-500',
    cardBg: 'bg-blue-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(59,130,246,0.25)]',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    Icon: Clock,
  },
  ACCEPTED: {
    label: 'Scheduled',
    color: 'purple',
    bgClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-400',
    cardBorder: 'border-purple-500',
    cardBg: 'bg-purple-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(168,85,247,0.25)]',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    Icon: CalendarCheck,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'cyan',
    bgClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotClass: 'bg-cyan-400',
    cardBorder: 'border-cyan-500',
    cardBg: 'bg-cyan-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(6,182,212,0.25)]',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
    Icon: PackageCheck,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red',
    bgClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    dotClass: 'bg-red-400',
    cardBorder: 'border-red-500',
    cardBg: 'bg-red-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(239,68,68,0.25)]',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/20',
    Icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'neutral',
    bgClass: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
    dotClass: 'bg-neutral-400',
    cardBorder: 'border-neutral-500',
    cardBg: 'bg-neutral-950/30',
    cardShadow: 'shadow-[0_0_24px_rgba(115,115,115,0.15)]',
    iconColor: 'text-neutral-400',
    iconBg: 'bg-neutral-500/20',
    Icon: Ban,
  },
};

const ALL_STATUSES = ['NOT_VERIFIED', 'VERIFIED', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED'];

/**
 * Helper: Format ISO date string
 */
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

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getInstitutionName(req) {
  if (req.target_type === 'HOSPITAL') {
    return req.hospital_id?.hos_name || 'Hospital';
  }
  return req.bloodbank_id?.bank_name || 'Blood Bank';
}

/**
 * =========================================================================
 * DETAIL DRAWER — Slide-in panel with full request details
 * =========================================================================
 */
const RequestDetailDrawer = ({ request, onClose }) => {
  if (!request) return null;

  const config = STATUS_CONFIG[request.status] || STATUS_CONFIG.NOT_VERIFIED;
  const StatusIcon = config.Icon;
  const donorName = request.u_id?.name || request.u_id?.username || 'Unknown Donor';
  const donorBlood = request.u_id?.bloodgroup || '—';
  const donorPhone = request.u_id?.phone || '—';
  const donorEmail = request.u_id?.email || '—';
  const donorGender = request.u_id?.gender || '—';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md h-full bg-[#0a0a0f] border-l border-white/10 overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                <StatusIcon className={`w-4.5 h-4.5 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Request Details</h3>
                <p className="text-[10px] font-mono text-neutral-500 mt-0.5">{request._id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="px-6 py-5 space-y-6">

            {/* Status Banner */}
            <div className={`p-4 rounded-2xl border ${config.bgClass} flex items-center gap-3`}>
              <StatusIcon className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">{config.label}</p>
                <p className="text-[11px] opacity-70 mt-0.5">
                  {request.status === 'COMPLETED'
                    ? `Completed on ${formatDate(request.completed_at)}`
                    : request.status === 'ACCEPTED'
                      ? `Appointment: ${formatDate(request.appointment_date)} at ${request.appointment_time || '—'}`
                      : request.status === 'REJECTED'
                        ? request.rejection_reason || 'Rejected by admin'
                        : request.status === 'CANCELLED'
                          ? request.rejection_reason || 'Cancelled by donor'
                          : `Submitted ${formatDateTime(request.createdAt)}`
                  }
                </p>
              </div>
            </div>

            {/* Donor Information */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Donor Information
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 font-bold text-sm shrink-0">
                    {donorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{donorName}</p>
                    <p className="text-[11px] text-neutral-400">{donorGender}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono text-xs shrink-0">
                    {donorBlood}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                      <Phone className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-mono tracking-wider">Phone</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium truncate">{donorPhone}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                      <Mail className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-mono tracking-wider">Email</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium truncate">{donorEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Institution */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Target Institution
              </h4>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${request.target_type === 'HOSPITAL' ? 'bg-purple-500/15 border-purple-500/25' : 'bg-rose-500/15 border-rose-500/25'} border flex items-center justify-center shrink-0`}>
                  <Building2 className={`w-4 h-4 ${request.target_type === 'HOSPITAL' ? 'text-purple-400' : 'text-rose-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{getInstitutionName(request)}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {request.target_type === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Details (if accepted) */}
            {(request.status === 'ACCEPTED' || request.status === 'COMPLETED') && request.appointment_date && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                  <CalendarCheck className="w-3 h-3" /> Appointment
                </h4>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">Date</span>
                    <span className="text-xs text-white font-semibold">{formatDate(request.appointment_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">Time</span>
                    <span className="text-xs text-white font-semibold">{request.appointment_time || '—'}</span>
                  </div>
                  {request.appointment_venue && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-500">Venue</span>
                      <span className="text-xs text-white font-semibold">{request.appointment_venue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Donor Notes */}
            {request.donor_notes && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Donor Notes
                </h4>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-neutral-300 leading-relaxed italic">"{request.donor_notes}"</p>
                </div>
              </div>
            )}

            {/* Verification Notes */}
            {request.verification_notes && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Verification Notes
                </h4>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <p className="text-xs text-emerald-300 leading-relaxed">{request.verification_notes}</p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {request.rejection_reason && (request.status === 'REJECTED' || request.status === 'CANCELLED') && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                  <XCircle className="w-3 h-3" /> Reason
                </h4>
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <p className="text-xs text-red-300 leading-relaxed">{request.rejection_reason}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-3 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Timeline
              </h4>
              <div className="space-y-0">
                {/* Submitted */}
                <TimelineStep
                  label="Request Submitted"
                  date={formatDateTime(request.createdAt)}
                  active={true}
                  isLast={!request.verified_at && !request.accepted_at && !request.completed_at}
                />
                {/* Verified */}
                {request.verified_at && (
                  <TimelineStep
                    label={request.status === 'REJECTED' ? 'Rejected by Admin' : 'Verified by Admin'}
                    date={formatDateTime(request.verified_at)}
                    active={true}
                    color={request.status === 'REJECTED' ? 'red' : 'emerald'}
                    isLast={!request.accepted_at && !request.completed_at}
                  />
                )}
                {/* Accepted */}
                {request.accepted_at && (
                  <TimelineStep
                    label="Accepted & Scheduled"
                    date={formatDateTime(request.accepted_at)}
                    active={true}
                    color="purple"
                    isLast={!request.completed_at}
                  />
                )}
                {/* Completed */}
                {request.completed_at && (
                  <TimelineStep
                    label="Donation Completed"
                    date={formatDateTime(request.completed_at)}
                    active={true}
                    color="cyan"
                    isLast={true}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Timeline step component
 */
const TimelineStep = ({ label, date, active, color = 'rose', isLast = false }) => {
  const dotColors = {
    rose: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    purple: 'bg-purple-400',
    cyan: 'bg-cyan-400',
    red: 'bg-red-400',
  };
  return (
    <div className="flex items-start gap-3 relative">
      <div className="flex flex-col items-center pt-0.5">
        <div className={`w-2.5 h-2.5 rounded-full ${active ? dotColors[color] || dotColors.rose : 'bg-neutral-600'} ring-2 ring-black z-10 shrink-0`} />
        {!isLast && <div className="w-px h-8 bg-white/10 -mt-px" />}
      </div>
      <div className={`pb-4 ${isLast ? '' : ''}`}>
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[10px] text-neutral-500 mt-0.5">{date}</p>
      </div>
    </div>
  );
};


/**
 * =========================================================================
 * GIVER PAGE — Main Component
 * =========================================================================
 */
export const GiverPage = () => {
  // ── State ──
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeMetricCard, setActiveMetricCard] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Fetch data ──
  const loadRequests = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const data = await getAllGiverRequests();
      if (data && data.requests) {
        setRequests(data.requests);
      } else if (data && data.data) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to load giver requests:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ── Compute metrics ──
  const metrics = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'NOT_VERIFIED' || r.status === 'PENDING').length,
    verified: requests.filter((r) => r.status === 'VERIFIED').length,
    scheduled: requests.filter((r) => r.status === 'ACCEPTED').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED' || r.status === 'CANCELLED').length,
  };

  // ── Filter pipeline ──
  let processedRequests = [...requests];

  // Metric card filter
  if (activeMetricCard === 'PENDING') {
    processedRequests = processedRequests.filter((r) => r.status === 'NOT_VERIFIED' || r.status === 'PENDING');
  } else if (activeMetricCard === 'VERIFIED') {
    processedRequests = processedRequests.filter((r) => r.status === 'VERIFIED');
  } else if (activeMetricCard === 'SCHEDULED') {
    processedRequests = processedRequests.filter((r) => r.status === 'ACCEPTED');
  } else if (activeMetricCard === 'COMPLETED') {
    processedRequests = processedRequests.filter((r) => r.status === 'COMPLETED');
  } else if (activeMetricCard === 'DECLINED') {
    processedRequests = processedRequests.filter((r) => r.status === 'REJECTED' || r.status === 'CANCELLED');
  }

  // Status dropdown filter (stacks with card filter)
  if (statusFilter !== 'ALL') {
    processedRequests = processedRequests.filter((r) => r.status === statusFilter);
  }

  // Search filter
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase().trim();
    processedRequests = processedRequests.filter((r) =>
      r.u_id?.name?.toLowerCase().includes(q) ||
      r.u_id?.email?.toLowerCase().includes(q) ||
      r.u_id?.bloodgroup?.toLowerCase().includes(q) ||
      r._id?.toLowerCase().includes(q) ||
      getInstitutionName(r).toLowerCase().includes(q)
    );
  }

  const clearAllFilters = () => {
    setActiveMetricCard('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  const isAnyFilterActive = activeMetricCard !== 'ALL' || statusFilter !== 'ALL' || searchTerm.trim() !== '';

  // ── Metric Card Config ──
  const metricCards = [
    {
      key: 'ALL',
      label: 'Total Requests',
      value: metrics.total,
      sub: 'All donation requests',
      color: 'rose',
      Icon: HandHeart,
    },
    {
      key: 'PENDING',
      label: 'Awaiting Verification',
      value: metrics.pending,
      sub: 'Needs admin review',
      color: 'amber',
      Icon: Clock,
    },
    {
      key: 'SCHEDULED',
      label: 'Scheduled',
      value: metrics.scheduled,
      sub: 'Appointment confirmed',
      color: 'purple',
      Icon: CalendarCheck,
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      value: metrics.completed,
      sub: 'Donation successful',
      color: 'cyan',
      Icon: PackageCheck,
    },
  ];

  const colorMap = {
    rose: {
      activeBg: 'bg-rose-950/30',
      activeBorder: 'border-rose-500',
      activeShadow: 'shadow-[0_0_24px_rgba(244,63,94,0.25)]',
      iconActive: 'bg-rose-500/20 text-rose-400',
      hoverBorder: 'hover:border-rose-500/40',
      hoverLabel: 'group-hover:text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    amber: {
      activeBg: 'bg-amber-950/30',
      activeBorder: 'border-amber-500',
      activeShadow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
      iconActive: 'bg-amber-500/20 text-amber-400',
      hoverBorder: 'hover:border-amber-500/40',
      hoverLabel: 'group-hover:text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    purple: {
      activeBg: 'bg-purple-950/30',
      activeBorder: 'border-purple-500',
      activeShadow: 'shadow-[0_0_24px_rgba(168,85,247,0.25)]',
      iconActive: 'bg-purple-500/20 text-purple-400',
      hoverBorder: 'hover:border-purple-500/40',
      hoverLabel: 'group-hover:text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    cyan: {
      activeBg: 'bg-cyan-950/30',
      activeBorder: 'border-cyan-500',
      activeShadow: 'shadow-[0_0_24px_rgba(6,182,212,0.25)]',
      iconActive: 'bg-cyan-500/20 text-cyan-400',
      hoverBorder: 'hover:border-cyan-500/40',
      hoverLabel: 'group-hover:text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
  };

  // ── Status dropdown label mapping ──
  const statusDropdownItems = [
    { value: 'ALL', label: 'All Statuses' },
    ...ALL_STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s]?.label || s })),
  ];

  return (
    <section className="w-full flex flex-col gap-5 animate-fadeIn">
      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(244,63,94,0.2)]">
            <HandHeart className="w-6 h-6 text-rose-400" />
          </div>
          <div className="flex items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
              Blood <span className="font-serif italic font-normal text-rose-400">Giver</span>
            </h1>
          </div>
        </div>

        {/* Refresh */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => loadRequests(true)}
            disabled={isRefreshing}
            aria-label="Refresh giver data"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold group disabled:opacity-50"
            title="Refresh from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 group-hover:rotate-180 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ── 2. Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const CardIcon = card.Icon;
          const isActive = activeMetricCard === card.key;
          const cm = colorMap[card.color];
          return (
            <div
              key={card.key}
              onClick={() => setActiveMetricCard(isActive && card.key !== 'ALL' ? 'ALL' : card.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveMetricCard(isActive && card.key !== 'ALL' ? 'ALL' : card.key)}
              className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-colors duration-200 border group outline-none focus:outline-none focus:ring-0 ${
                isActive
                  ? `${cm.activeBg} ${cm.activeBorder} ${cm.activeShadow}`
                  : `bg-[#0b0b0e] border-white/10 ${cm.hoverBorder} hover:bg-[#141418]`
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${cm.hoverLabel} transition-colors`}>
                    {card.label}
                  </span>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? cm.iconActive : `bg-white/5 text-neutral-400 ${cm.hoverLabel}`}`}>
                    <CardIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {isLoading ? '...' : card.value}
                </div>
              </div>
              <div className="flex items-center justify-between h-5">
                <span className="text-[11px] text-neutral-400 truncate">{card.sub}</span>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${cm.badge} border transition-opacity duration-200 shrink-0 ml-2 ${
                    isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  ACTIVE
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Search & Filters ── */}
      <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by donor name, blood group, institution, or request ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full md:w-48" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 hover:border-rose-500/40 transition-colors cursor-pointer flex items-center justify-between gap-2"
          >
            <span className="truncate">
              {statusFilter === 'ALL' ? 'All Statuses' : STATUS_CONFIG[statusFilter]?.label || statusFilter}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e0e14] border border-white/15 rounded-xl shadow-2xl z-40 overflow-hidden py-1"
              >
                {statusDropdownItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setStatusFilter(item.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                      statusFilter === item.value
                        ? 'text-rose-400 bg-rose-500/10 font-semibold'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.value !== 'ALL' && (
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.value]?.dotClass || 'bg-neutral-400'}`} />
                    )}
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters */}
        {isAnyFilterActive && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── 4. Request Table ── */}
      <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden shadow-2xl">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin mb-4" />
            <p className="text-xs text-neutral-400">Loading giver requests...</p>
          </div>
        ) : processedRequests.length === 0 ? (
          /* Empty State */
          <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
              <HandHeart className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">No Requests Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {isAnyFilterActive
                ? 'No giver requests match your current filters. Try adjusting or clearing them.'
                : 'No blood donation requests have been submitted yet. New requests will appear here once donors apply.'}
            </p>
            {isAnyFilterActive && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3" /> Clear All Filters
              </button>
            )}
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Donor</th>
                  <th className="py-3.5 px-4 font-semibold">Blood Group</th>
                  <th className="py-3.5 px-4 font-semibold">Institution</th>
                  <th className="py-3.5 px-4 font-semibold">Preferred Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300 font-sans">
                {processedRequests.map((req) => {
                  const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.NOT_VERIFIED;
                  const donorName = req.u_id?.name || req.u_id?.username || 'Unknown';
                  const donorBlood = req.u_id?.bloodgroup || '—';
                  const institution = getInstitutionName(req);

                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-white/[0.03] transition-colors group/row cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      {/* Donor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-[11px] shrink-0">
                            {donorName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate">{donorName}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{req.u_id?.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono text-[11px]">
                          {donorBlood}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-3.5 h-3.5 shrink-0 ${req.target_type === 'HOSPITAL' ? 'text-purple-400' : 'text-rose-400'}`} />
                          <span className="truncate text-neutral-300 max-w-[150px]">{institution}</span>
                        </div>
                      </td>

                      {/* Preferred Date */}
                      <td className="py-3.5 px-4 text-neutral-300">
                        {formatDate(req.preferred_date)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.bgClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
                          {config.label}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                        {formatDate(req.createdAt)}
                      </td>

                      {/* View Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/40 text-neutral-400 hover:text-white transition-all cursor-pointer group/btn"
                          title="View full details"
                        >
                          <Eye className="w-3.5 h-3.5 group-hover/btn:text-rose-400 transition-colors" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Result Count Footer */}
        {!isLoading && processedRequests.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
            <span className="text-[11px] text-neutral-500 font-mono">
              Showing {processedRequests.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
            {isAnyFilterActive && (
              <span className="text-[10px] font-mono text-rose-400/70">
                Filtered
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 5. Workflow Phase Guide ── */}
      <div className="p-5 rounded-2xl bg-neutral-950/60 border border-white/5">
        <h3 className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-4 flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Donation Workflow Phases
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { phase: 1, title: 'Submit', desc: 'Donor applies', icon: HandHeart, color: 'rose' },
            { phase: 2, title: 'Verify', desc: 'Admin reviews', icon: ShieldCheck, color: 'amber' },
            { phase: 3, title: 'Schedule', desc: 'Appointment set', icon: CalendarCheck, color: 'purple' },
            { phase: 4, title: 'Complete', desc: 'Blood collected', icon: PackageCheck, color: 'cyan' },
          ].map((step, i) => {
            const StepIcon = step.icon;
            const phaseColors = {
              rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
              amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
              purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
              cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
            };
            return (
              <div key={step.phase} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className={`w-8 h-8 rounded-lg ${phaseColors[step.color]} border flex items-center justify-center shrink-0`}>
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">{step.title}</p>
                  <p className="text-[10px] text-neutral-500">{step.desc}</p>
                </div>
                {i < 3 && <ArrowRight className="w-3 h-3 text-neutral-600 ml-auto shrink-0 hidden sm:block" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. Detail Drawer ── */}
      {selectedRequest && (
        <RequestDetailDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </section>
  );
};

export default GiverPage;
