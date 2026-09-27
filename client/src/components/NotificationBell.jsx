import { useEffect, useRef, useState, useMemo } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { notifications, markAsRead, markAllAsRead } =
    useNotifications();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const unread = useMemo(
      () => notifications.filter((n) => !n.isRead).length,
      [notifications]
  );

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);

    if (diff < 60) return "Just now";

    const mins = Math.floor(diff / 60);
    if (mins < 60)
        return `${mins} min${mins > 1 ? "s" : ""} ago`;

    const hrs = Math.floor(diff / 3600);
    if (hrs < 24)
        return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;

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

  const handleReadAll = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((p) => !p)}
        className="relative rounded-full p-2 transition hover:bg-white/10">
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="font-semibold">Notifications</h3>

            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                <CheckCheck size={16} />
                Mark all
              </button>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <Bell className="mx-auto mb-3 opacity-40" size={40} />

                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group w-full border-b border-white/5 p-4 text-left transition-all duration-200 hover:translate-x-1 hover:bg-white/5 ${
                    !item.isRead ? "bg-blue-500/10" : ""
                  }`}>
                  {/* Unread Dot + Type Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}

                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.type === "bid"
                          ? "bg-blue-500/20 text-blue-400"
                          : item.type === "hire"
                            ? "bg-green-500/20 text-green-400"
                            : item.type === "submission"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : item.type === "approval"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-zinc-700 text-zinc-300"
                      }`}>
                      {item.type}
                    </span>
                  </div>

                  <div className="font-medium">{item.title}</div>

                  <div className="mt-1 text-sm text-zinc-400">
                    {item.message}
                  </div>

                  <div className="mt-2 text-xs text-zinc-500">
                    {formatTime(item.createdAt)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
