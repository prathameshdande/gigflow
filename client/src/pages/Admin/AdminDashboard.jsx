// src/pages/Admin/AdminDashboard.jsx
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
} from "lucide-react";

const sidebarLinks = [
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/gigs", icon: Briefcase, label: "Gigs" },
  { to: "/admin/bids", icon: FileText, label: "Bids" },
  { to: "/admin/messages", icon: MessageCircle, label: "Messages" },
  { to: "/admin/payments", icon: IndianRupee, label: "Payments" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
];

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-4 space-y-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <LayoutDashboard /> Admin Panel
        </div>
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
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
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 text-slate-400 mt-8"
          >
            <ArrowLeft size={18} /> Exit Admin
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
