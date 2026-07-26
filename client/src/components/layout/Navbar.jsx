import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sun, Moon, Bell, Briefcase, User } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const navItems = [
  if (!user) {
    Home
    Browse
    Login
    Register
}

if (user.role === "client") {
    Dashboard
    My Gigs
    Payments
    Profile
}

if (user.role === "freelancer") {
    Browse Jobs
    My Bids
    Messages
    Profile
}

if (user.role === "admin") {
    Admin Dashboard
    Users
    Gigs
    Reports
}
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 py-4">
        <div className="rounded-2xl border border-white/15 bg-white/70 backdrop-blur-2xl shadow-xl dark:border-white/10 dark:bg-black/30">
          <div className="flex items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg">
                <Briefcase size={20} />
              </div>

              <div>
                <h1 className="text-xl font-bold">GigFlow</h1>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Freelance Marketplace
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-3 lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg"
                        : "hover:bg-slate-100 dark:hover:bg-white/10"
                    }`
                  }>
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <button className="rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-white/10">
                <Bell size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className="rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-white/10">
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Link
                to="/profile"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg">
                <User size={18} />
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 lg:hidden">
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-5 rounded-2xl border border-white/10 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/90 lg:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                        : "hover:bg-slate-100 dark:hover:bg-white/10"
                    }`
                  }>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
