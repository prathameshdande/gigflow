import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../api/notificationApi";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { API_URL } from "../api/config";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// socket.io connects to the server origin, not the /api-prefixed REST base.
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Stable identity via useCallback: these are consumed as effect
  // dependencies elsewhere (e.g. NotificationBell). Without memoizing them,
  // every render creates a new function reference, which retriggers any
  // effect that depends on them, which updates state, which re-renders,
  // which creates a new reference again - an infinite request loop.
  const loadNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error("Notification error:", err);
      toast.error("Failed to load notifications");
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    loadNotifications();
    if (!token) return;

    let active = true;
    let socket;

    import("socket.io-client").then(({ io }) => {
      if (!active) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("newNotification", (notification) => {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) {
            return prev;
          }
          return [notification, ...prev];
        });

        toast.custom(() => (
          <div className="w-80 rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
            <div className="font-semibold">{notification.title}</div>
            <div className="mt-1 text-sm text-zinc-400">{notification.message}</div>
          </div>
        ));
      });
    }).catch((error) => {
      console.error("Unable to connect to notifications:", error);
    });

    return () => {
      active = false;
      if (socket) {
        socket.off("newNotification");
        socket.disconnect();
      }
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [token, user?._id, loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loadNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
