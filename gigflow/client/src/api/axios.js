import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Centralized handling for expired/invalid sessions: clear local auth
// state and send the user back to sign in.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");

      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
