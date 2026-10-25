// src/pages/Admin/AdminDashboard.jsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  MessageCircle,
  Star,
  LayoutDashboard,
  ArrowLeft,
  IndianRupee,
  Menu,
  X,
} from "lucide-react";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/gigs", icon: Briefcase, label: "Gigs" },
  { to: "/admin/bids", icon: FileText, label: "Bids" },
  { to: "/admin/messages", icon: MessageCircle, label: "Messages" },
  { to: "/admin/payments", icon: IndianRupee, label: "Payments" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
];

const AdminDashboard = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 text-xl font-bold">
        <LayoutDashboard /> Admin Panel
      </div>
      <nav className="space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 ${
              location.pathname === link.to ? "bg-slate-700" : ""
            }`}
          >
            <link.icon size={18} /> {link.label}
          </Link>
        ))}
        {/* Exit admin link */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 text-slate-400 mt-8"
        >
          <ArrowLeft size={18} /> Exit Admin
        </Link>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-slate-900 p-4 text-white lg:hidden">
        <div className="flex items-center gap-2 text-lg font-bold">
          <LayoutDashboard size={20} /> Admin Panel
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin menu"
          className="rounded-lg p-2 hover:bg-slate-700"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[80vw] space-y-6 overflow-y-auto bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-bold">
                <LayoutDashboard /> Admin Panel
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin menu"
                className="rounded-lg p-2 hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 ${
                    location.pathname === link.to ? "bg-slate-700" : ""
                  }`}
                >
                  <link.icon size={18} /> {link.label}
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="mt-8 flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-700"
              >
                <ArrowLeft size={18} /> Exit Admin
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 space-y-6 bg-slate-900 p-4 text-white lg:block">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
