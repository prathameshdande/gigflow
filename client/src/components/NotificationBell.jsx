import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unread = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);

    if (diff < 60) return "Just now";

    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;

    const hrs = Math.floor(diff / 3600);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);
    setOpen(false);

    if (notification.gig?._id) {
      navigate(`/gigs/${notification.gig._id}`);
    } else if (notification.gig) {
      navigate(`/gigs/${notification.gig}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
      >
        <Bell size={20} />

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>

              {unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <CheckCheck size={16} />
                  Mark all
                </button>
              )}
            </div>

            <div className="max-h-[450px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    className="mx-auto mb-3 text-slate-400"
                    size={40}
                  />
                  <p className="text-slate-500 dark:text-slate-400">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full border-b border-slate-200 p-4 text-left transition-all hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 ${
                      !item.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}

                      <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {item.type}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </div>

                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {item.message}
                    </div>

                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {formatTime(item.createdAt)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}