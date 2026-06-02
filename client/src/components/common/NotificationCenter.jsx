import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, CheckCircle, XCircle, Info, Check } from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NotificationCenter = ({ isDarkMode = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data?.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 10 seconds for real-time notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      if (data?.success) {
        setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      }
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await api.put('/notifications/read-all');
      if (data?.success) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    if (!notification.isRead) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications(notifications.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
      } catch (err) {
        console.error(err);
      }
    }

    if (notification.order) {
      if (notification.recipientRole === 'admin') {
        navigate(`/admin/orders/${notification.order}`);
      } else {
        navigate(`/orders/${notification.order}`);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'order_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'order_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none group`}
        title="Notifications"
      >
        <Bell className={`w-5 h-5 transition-colors ${
          isOpen ? 'text-primary-600' : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-primary-600'
        }`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse min-w-[18px] min-h-[18px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-slide-down max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 max-h-[350px] custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3.5 relative group/item ${
                    !notification.isRead ? 'bg-orange-50/30' : ''
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notification.isRead && (
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  )}

                  {/* Icon Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 ${
                    notification.type === 'new_order' ? 'bg-blue-50' :
                    notification.type === 'order_confirmed' ? 'bg-green-50' :
                    notification.type === 'order_rejected' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold text-gray-900 leading-snug ${!notification.isRead ? 'font-extrabold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1.5">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Single Mark Read Icon on Hover */}
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                      className="p-1 hover:bg-gray-200 rounded-md text-gray-400 hover:text-gray-700 h-fit self-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
