import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ShoppingBag, CheckCircle, XCircle, Info, Check,
  CheckCheck, Package, Truck, RotateCcw, X
} from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  new_order:       { icon: ShoppingBag, bg: 'bg-blue-50',   ring: 'ring-blue-100',   color: 'text-blue-600',   label: 'New Order'     },
  order_confirmed: { icon: CheckCircle, bg: 'bg-green-50',  ring: 'ring-green-100',  color: 'text-green-600',  label: 'Confirmed'     },
  order_rejected:  { icon: XCircle,     bg: 'bg-red-50',    ring: 'ring-red-100',    color: 'text-red-600',    label: 'Cancelled'     },
  order_shipped:   { icon: Truck,       bg: 'bg-purple-50', ring: 'ring-purple-100', color: 'text-purple-600', label: 'Shipped'       },
  order_delivered: { icon: Package,     bg: 'bg-teal-50',   ring: 'ring-teal-100',   color: 'text-teal-600',   label: 'Delivered'     },
  order_returned:  { icon: RotateCcw,   bg: 'bg-yellow-50', ring: 'ring-yellow-100', color: 'text-yellow-600', label: 'Return'        },
  default:         { icon: Info,        bg: 'bg-gray-50',   ring: 'ring-gray-100',   color: 'text-gray-500',   label: 'Notification'  },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDateTime(dateStr);
};

/* ─── main component ───────────────────────────────────────────────── */
const NotificationCenter = ({ isDarkMode = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen]               = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const bellRef    = useRef(null);
  const dropdownRef = useRef(null);
  const navigate   = useNavigate();

  /* fetch */
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data?.success) setNotifications(data.data || []);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 10000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  /* position the dropdown via portal so it is never clipped */
  const positionDropdown = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    const PANEL_W = vw < 640 ? Math.min(vw - 16, 400) : 400;
    const top     = rect.bottom + 8;
    let   left    = rect.right - PANEL_W;

    /* keep inside viewport horizontally */
    if (left < 8) left = 8;
    if (left + PANEL_W > vw - 8) left = vw - PANEL_W - 8;

    const maxHeight = vh - top - 16;

    setDropdownStyle({ top, left, width: PANEL_W, maxHeight });
  }, []);

  useEffect(() => {
    if (isOpen) {
      positionDropdown();
      window.addEventListener('resize',  positionDropdown);
      window.addEventListener('scroll',  positionDropdown, true);
    }
    return () => {
      window.removeEventListener('resize',  positionDropdown);
      window.removeEventListener('scroll',  positionDropdown, true);
    };
  }, [isOpen, positionDropdown]);

  /* close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current     && !bellRef.current.contains(e.target)
      ) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  /* close on Escape */
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* actions */
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      if (data?.success)
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (_) {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await api.put('/notifications/read-all');
      if (data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All marked as read');
      }
    } catch (_) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (n) => {
    setIsOpen(false);
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`);
        setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
      } catch (_) {}
    }
    if (n.order) {
      navigate(n.recipientRole === 'admin' ? `/admin/orders/${n.order}` : `/orders/${n.order}`);
    }
  };

  /* ── JSX ──────────────────────────────────────────────────────────── */
  const dropdown = isOpen && createPortal(
    <>
      {/* backdrop for mobile tap-away */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />

      {/* panel */}
      <div
        ref={dropdownRef}
        style={{ ...dropdownStyle, position: 'fixed', zIndex: 9999 }}
        className="notification-panel bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-orange-600 font-medium mt-0.5">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-full transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                All read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-50">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const cfg = getConfig(n.type);
              const Icon = cfg.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors group relative
                    ${n.isRead ? 'hover:bg-gray-50' : 'bg-orange-50/40 hover:bg-orange-50/70'}`}
                >
                  {/* unread pulse dot */}
                  {!n.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}

                  {/* icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ring-2 ${cfg.bg} ${cfg.ring} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[11px] font-bold leading-snug text-gray-900 ${n.isRead ? '' : 'text-gray-950'}`}>
                        {n.title}
                      </span>
                      <span className={`text-[9px] flex-shrink-0 px-1.5 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 font-medium">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* mark read button */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                      className="flex-shrink-0 self-center w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">You're all caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications at the moment.</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 text-center">
            <span className="text-[10px] text-gray-400 font-medium">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ' · all read'}
            </span>
          </div>
        )}
      </div>
    </>,
    document.body
  );

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen((v) => !v)}
        className={`relative p-2.5 rounded-xl transition-colors focus:outline-none
          ${isOpen ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100 text-gray-600 hover:text-orange-600'}`}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {dropdown}
    </div>
  );
};

export default NotificationCenter;
