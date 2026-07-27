import {
  Briefcase,
  LogOut,
  PlusCircle,
  List,
  User,
  CreditCard,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

const NavItems = ({ user, location, closeMenu }) => {
  if (!user) return null;

  const linkStyle = (path) => {
    const active =
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path);

    return `relative rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg"
        : "text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white"
    }`;
  };

  if (user.role === "admin") {
    return (
      <>
        <Link to="/admin" onClick={closeMenu} className={linkStyle("/admin")}>
          Dashboard
        </Link>

        <Link
          to="/admin/users"
          onClick={closeMenu}
          className={linkStyle("/admin/users")}
        >
          Users
        </Link>

        <Link
          to="/admin/gigs"
          onClick={closeMenu}
          className={linkStyle("/admin/gigs")}
        >
          Gigs
        </Link>

        <Link
          to="/profile"
          onClick={closeMenu}
          className={linkStyle("/profile")}
        >
          <span className="flex items-center gap-2">
            <User size={17} />
            Profile
          </span>
        </Link>
      </>
    );
  }

  if (user.role === "client") {
    return (
      <>
        <Link to="/" onClick={closeMenu} className={linkStyle("/")}>
          Explore
        </Link>

        <Link to="/create" onClick={closeMenu} className={linkStyle("/create")}>
          Create Gig
        </Link>

        <Link
          to="/my-payments"
          onClick={closeMenu}
          className={linkStyle("/my-payments")}
        >
          Payments
        </Link>

        <NotificationBell />

        <Link
          to="/profile"
          onClick={closeMenu}
          className={linkStyle("/profile")}
        >
          <span className="flex items-center gap-2">
            <User size={17} />
            Profile
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/" onClick={closeMenu} className={linkStyle("/")}>
        Explore
      </Link>

      <Link to="/my-bids" onClick={closeMenu} className={linkStyle("/my-bids")}>
        My Bids
      </Link>

      <Link
        to="/my-payments"
        onClick={closeMenu}
        className={linkStyle("/my-payments")}
      >
        Payments
      </Link>

      <NotificationBell />

      <Link to="/profile" onClick={closeMenu} className={linkStyle("/profile")}>
        <span className="flex items-center gap-2">
          <User size={17} />
          Profile
        </span>
      </Link>
    </>
  );
};

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  const logoutUser = async () => {
    setOpen(false);
    await logout();
    navigate("/auth", { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-4 z-50 mx-auto w-[96%] max-w-7xl">
      <div className="rounded-3xl border border-white/20 bg-white/90 dark:bg-slate-950/85 backdrop-blur-sm shadow-2xl">
        <div className="flex h-20 items-center justify-between px-7">
          <Link to="/" className="flex items-center gap-4">
            <motion.div
              whileHover={{
                rotate: 12,
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white shadow-xl">
              <Briefcase size={26} />
            </motion.div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                GigFlow
              </h1>

              <p className="text-xs tracking-widest uppercase text-blue-600 dark:text-cyan-400">
                Freelance Platform
              </p>
            </div>
          </Link>

          {!loading && user && (
            <div className="hidden items-center gap-2 lg:flex">
              <NavItems user={user} location={location} closeMenu={closeMenu} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10 transition hover:scale-110">
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {user ? (
              <>
                <button
                  onClick={logoutUser}
                  className="hidden rounded-2xl bg-red-500 px-5 py-2 font-medium text-white transition hover:bg-red-600 lg:block">
                  Logout
                </button>

                <button
                  onClick={() => setOpen(!open)}
                  className="rounded-2xl p-2 lg:hidden">
                  {open ? <X /> : <Menu />}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-xl transition hover:scale-105">
                Sign In
              </Link>
            )}
          </div>
        </div>

        <AnimatePresence>
          {open && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="border-t border-white/10 lg:hidden">
              <div className="flex flex-col gap-3 p-5">
                <NavItems user={user} location={location} closeMenu={closeMenu} />

                <button
                  onClick={logoutUser}
                  className="rounded-2xl bg-red-500 py-3 text-white">
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
