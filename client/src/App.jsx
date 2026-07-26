import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";

import AuroraBackground from "./components/AuroraBackground";
import AppRoutes from "./routes/AppRoutes";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  const location = useLocation();

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
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -40,
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}>
                <AppRoutes />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
