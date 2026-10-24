// Vite only exposes env vars prefixed with VITE_ to client code.
// Falls back to localhost for local dev if not set.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8800/api";
