import { Toaster } from "react-hot-toast";

import AuroraBackground from "./components/AuroraBackground";
import AppRoutes from "./routes/AppRoutes";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AuroraBackground />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "18px",
              background: "#18181B",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.08)",
              backdropFilter: "blur(20px)",
            },
          }}
        />

        <div className="relative min-h-screen overflow-x-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:70px_70px] dark:opacity-100 opacity-40" />

          <div className="relative z-10">
            <AppRoutes />
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
