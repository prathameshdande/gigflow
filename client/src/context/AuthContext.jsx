import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { fetchWithRetry } from "../utils/fetchWithRetry";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  // NOTE: the key here ("token") must match what api/axios.js,
  // NotificationContext.jsx and the chat socket read - keep them in sync.
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Validate the session against the server on load instead of blindly
  // trusting whatever is in localStorage (it could be stale/expired/
  // the account could have been deactivated since the last visit).
  useEffect(() => {
    const restoreSession = async () => {
      if (!token && !user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetchWithRetry(
          `${API_URL}/auth/me`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
          3,
          1000,
        );

        if (!res.ok) {
          // Only clear credentials if the server explicitly rejected the token (401/403).
          // If the server returns 502/503 during a cold start or transient glitch,
          // do NOT wipe the user's stored session.
          if (res.status === 401 || res.status === 403) {
            setUser(null);
            setToken(null);
          }

          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        // Network / cold-start error - keep the cached user so the app still works
        console.error("Session restore notice:", err);

      } finally {
        setLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data);
      setToken(data.token);

      return { success: true, role: data.role };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password, role = "client") => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Backend auto-logs the user in on register and returns the same
      // shape as /auth/login, so treat it the same way here.
      setUser(data);
      setToken(data.token);

      return { success: true, role: data.role };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
