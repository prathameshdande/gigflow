import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../api/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null,
  );
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("currentUserToken")) || null,
  );

  // Keep localStorage in sync
  useEffect(() => {
    if (user) localStorage.setItem("currentUser", JSON.stringify(user));
    else localStorage.removeItem("currentUser");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("currentUserToken", JSON.stringify(token));
    else localStorage.removeItem("currentUserToken");
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Login failed");
      }

      const userData = await res.json();
      setUser(userData);
      setToken(userData.token); // save token for chat, etc.
      return { success: true, role: userData.role };
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

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Registration failed");
      }

      return { success: true };
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
    } catch (e) {
      // proceed even if request fails
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
