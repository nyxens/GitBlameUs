import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  UserSearch,
  HandHeart,
  RefreshCw,
  X,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  getActiveRequest as getActiveSeekerRequest,
  getMySeekerRequests,
} from '../../services/seekerService.js';
import {
  getActiveRequest as getActiveGiverRequest,
  getMyGiverRequests,
} from '../../services/giverService.js';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getStatusTitle(type, status) {
  if (type === 'seeker') {
    switch (status) {
      case 'ACCEPTED':
        return 'Requisition Accepted';
      case 'VERIFIED':
        return 'Requisition Verified';
      case 'FULFILLED':
        return 'Requisition Fulfilled';
      case 'REJECTED':
        return 'Requisition Denied';
      case 'CANCELLED':
        return 'Requisition Cancelled';
      default:
        return 'Requisition Under Review';
    }
  } else {
    switch (status) {
      case 'ACCEPTED':
        return 'Donation Accepted';
      case 'VERIFIED':
        return 'Donation Verified';
      case 'COMPLETED':
        return 'Donation Completed';
      case 'REJECTED':
        return 'Donation Denied';
      case 'CANCELLED':
        return 'Donation Cancelled';
      default:
        return 'Donation Under Review';
    }
  }
}

export const UnifiedNotificationBell = ({ user, onSelectSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`lifevault_read_notifs_${user?.id || user?._id || 'guest'}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`lifevault_deleted_notifs_${user?.id || user?._id || 'guest'}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Persist read notification IDs
  const persistReadIds = (newSet) => {
    try {
      localStorage.setItem(
        `lifevault_read_notifs_${user?.id || user?._id || 'guest'}`,
        JSON.stringify(Array.from(newSet))
      );
    } catch (err) {
      console.warn('Failed to save read notifications:', err);
    }
  };

  // Persist deleted notification IDs
  const persistDeletedIds = (newSet) => {
    try {
      localStorage.setItem(
        `lifevault_deleted_notifs_${user?.id || user?._id || 'guest'}`,
        JSON.stringify(Array.from(newSet))
      );
    } catch (err) {
      console.warn('Failed to save deleted notifications:', err);
    }
  };

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistReadIds(next);
      return next;
    });
  }, [notifications, user]);

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDeletedIds(next);
      return next;
    });
  };

  const handleDeleteAll = (e) => {
    if (e) e.stopPropagation();
    setDeletedIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistDeletedIds(next);
      return next;
    });
  };

  // Fetch unified notifications from Seeker and Giver APIs
  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.id || user?._id || user?.sub;
      const [seekerActive, seekerMy, giverActive, giverMy] = await Promise.allSettled([
        getActiveSeekerRequest(),
        getMySeekerRequests(userId),
        getActiveGiverRequest(),
        getMyGiverRequests(userId),
      ]);

      const items = [];
      const seenIds = new Set();

      // ── Process Seeker requests ──
      const seekerList = [];
      if (seekerActive.status === 'fulfilled' && seekerActive.value?.success && seekerActive.value?.data) {
        seekerList.push(seekerActive.value.data);
      }
      if (seekerMy.status === 'fulfilled' && seekerMy.value?.success && Array.isArray(seekerMy.value?.data)) {
        seekerList.push(...seekerMy.value.data);
      }

      for (const req of seekerList) {
        if (!req || !req._id || seenIds.has(`seeker_${req._id}`)) continue;
        seenIds.add(`seeker_${req._id}`);

        const facilityName = req.hospital_id?.hos_name || req.bloodbank_id?.bank_name || 'Certified Health Center';
        const isAccepted = req.status === 'ACCEPTED';

        items.push({
          id: `seeker_${req._id}`,
          rawId: req._id,
          type: 'seeker',
          status: req.status || 'PENDING',
          isAccepted,
          title: isAccepted ? 'Requisition Accepted' : getStatusTitle('seeker', req.status),
          facility: facilityName,
          date: req.schedule_date || req.required_date,
          time: req.schedule_time,
          venue: req.pickup_venue,
          details: `${req.bloodgroup || ''} • ${req.units || 1} ${req.units === 1 ? 'Unit' : 'Units'}`,
          timestamp: req.updatedAt || req.createdAt || new Date().toISOString(),
        });
      }

      // ── Process Giver requests ──
      const giverList = [];
      if (giverActive.status === 'fulfilled' && giverActive.value?.success && giverActive.value?.data) {
        giverList.push(giverActive.value.data);
      }
      if (giverMy.status === 'fulfilled' && giverMy.value?.success && Array.isArray(giverMy.value?.data)) {
        giverList.push(...giverMy.value.data);
      }

      for (const req of giverList) {
        if (!req || !req._id || seenIds.has(`giver_${req._id}`)) continue;
        seenIds.add(`giver_${req._id}`);

        const facilityName = req.hospital_id?.hos_name || req.bloodbank_id?.bank_name || 'Blood Collection Facility';
        const isAccepted = req.status === 'ACCEPTED';

        items.push({
          id: `giver_${req._id}`,
          rawId: req._id,
          type: 'giver',
          status: req.status || 'PENDING',
          isAccepted,
          title: isAccepted ? 'Donation Accepted' : getStatusTitle('giver', req.status),
          facility: facilityName,
          date: req.appointment_date || req.preferred_date,
          time: req.appointment_time,
          venue: req.appointment_venue,
          details: req.bloodgroup ? `Blood Group: ${req.bloodgroup}` : '',
          timestamp: req.updatedAt || req.createdAt || new Date().toISOString(),
        });
      }

      // Sort: ACCEPTED first, then by timestamp descending
      items.sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setNotifications(items);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and polling every 20 seconds
  useEffect(() => {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 20000);

    const handleCustomUpdate = () => fetchAllNotifications();
    window.addEventListener('lifevault:requests-updated', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('lifevault:requests-updated', handleCustomUpdate);
    };
  }, [fetchAllNotifications]);

  // When notifications are opened, directly mark all as read
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      markAllAsRead();
    }
  }, [isOpen, notifications, markAllAsRead]);

  // Close on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeNotifications = notifications.filter((n) => !deletedIds.has(n.id));
  const unreadCount = activeNotifications.filter((n) => !readIds.has(n.id)).length;

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      markAllAsRead();
      fetchAllNotifications();
    }
  };

  const handleItemClick = (item) => {
    if (onSelectSection) {
      onSelectSection(item.type);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* ── Bell Icon Button (Only Bell Icon beside Sign Out Button) ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="View notifications"
        title="Notifications"
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer bg-black ${
          isOpen
            ? 'border-white/30 text-white'
            : 'border-white/10 hover:border-white/20 text-neutral-400 hover:text-white hover:bg-neutral-900'
        }`}
      >
        <Bell className="w-4 h-4 transition-transform group-hover:scale-105" />

        {/* Unread dot / count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full bg-red-600 text-white text-[8px] font-bold font-mono">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Small Notification Window (Pure Black Background) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-black border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 text-left overflow-hidden flex flex-col max-h-[80vh]"
            style={{ backgroundColor: '#000000' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-xs font-bold text-white tracking-tight">Notifications</span>
                {activeNotifications.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 text-neutral-400 font-mono border border-white/10">
                    {activeNotifications.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {activeNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    title="Delete all notifications"
                    className="p-1 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-mono text-[10px]">Clear all</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchAllNotifications}
                  disabled={loading}
                  title="Refresh"
                  className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List: Simple One Line per Notification */}
            <div className="overflow-y-auto max-h-80 divide-y divide-white/5 bg-black">
              {activeNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-2 bg-black">
                  <Bell className="w-5 h-5 text-neutral-600" />
                  <p className="text-xs font-medium text-neutral-400">No notifications</p>
                </div>
              ) : (
                activeNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left bg-black hover:bg-neutral-900 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Icon */}
                      {item.type === 'seeker' ? (
                        <UserSearch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <HandHeart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}

                      {/* Simple One-Line Text: Title • Facility */}
                      <div className="truncate text-xs flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-neutral-400 font-normal truncate">
                          • {item.facility}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Time, Delete button, and Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formatTimeAgo(item.timestamp)}
                      </span>

                      {/* Delete notification button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(e, item.id)}
                        title="Delete notification"
                        className="p-1 rounded-md text-neutral-600 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedNotificationBell;
