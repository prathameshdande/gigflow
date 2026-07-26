import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "./Footer";
import AuroraBackground from "../AuroraBackground";

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-900 dark:text-white">
      <AuroraBackground />

      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 pt-24">
        <Outlet />
      </motion.main>

      <Footer />
    </div>
  );
}
