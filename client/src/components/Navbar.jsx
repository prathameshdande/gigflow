import {
  Briefcase,
  LogOut,
  PlusCircle,
  List,
  User,
  CreditCard,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-16 flex justify-between items-center px-4">
        <Link to="/" className="flex items-center">
          <Briefcase className="text-emerald-400 mr-2" />
          <span className="font-bold text-xl">GigFlow</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="flex items-center gap-1 text-sm hover:text-emerald-400">
              <List size={16} /> Gigs
            </Link>
            <Link
              to="/create"
              className="flex items-center gap-1 text-sm hover:text-emerald-400">
              <PlusCircle size={16} /> Post Gig
            </Link>
            <Link to="/my-bids" className="text-sm hover:text-emerald-400">
              My Bids
            </Link>
            <Link
              to="/my-payments"
              className="flex items-center gap-1 text-sm hover:text-emerald-400">
              <CreditCard size={16} /> Payments
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-1 text-sm hover:text-emerald-400">
              <User size={16} /> Profile
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-sm hover:text-emerald-400">
                <Shield size={16} /> Admin
              </Link>
            )}
            <button onClick={handleLogout} className="hover:text-red-400">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="text-sm hover:text-emerald-400">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
