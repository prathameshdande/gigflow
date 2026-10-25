// Vite only exposes env vars prefixed with VITE_ to client code.
// Falls back to localhost for local dev if not set.
const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:8800/api").trim();
const normalized = rawUrl.replace(/\/+$/, "");

export const API_URL = normalized.endsWith("/api")
  ? normalized
  : `${normalized}/api`;

export const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");
