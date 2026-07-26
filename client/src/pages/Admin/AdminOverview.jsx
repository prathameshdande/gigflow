// src/pages/Admin/AdminOverview.jsx
import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, IndianRupee, Star, TrendingUp } from "lucide-react";
import { API_URL } from "../../api/config";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${accent}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/stats`, {
          credentials: "include",
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-slate-500 dark:text-slate-400">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load dashboard stats.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} accent="bg-blue-600" />
        <StatCard icon={Briefcase} label="Total Gigs" value={stats.gigs} accent="bg-violet-600" />
        <StatCard icon={TrendingUp} label="Open Gigs" value={stats.openGigs} accent="bg-emerald-600" />
        <StatCard icon={FileText} label="Total Bids" value={stats.bids} accent="bg-orange-500" />
        <StatCard
          icon={IndianRupee}
          label="Platform Revenue (fees)"
          value={`₹${stats.revenue.toFixed(2)}`}
          accent="bg-cyan-600"
        />
        <StatCard icon={Star} label="Total Reviews" value={stats.reviews} accent="bg-pink-600" />
      </div>
    </div>
  );
};

export default AdminOverview;
