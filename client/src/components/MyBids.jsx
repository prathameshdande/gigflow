import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  Trash2,
  IndianRupee,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";

const MyBids = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ price: "", message: "" });

  useEffect(() => {
    if (!user) return navigate("/auth");
    fetchBids();
  }, [user, navigate]);

  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_URL}/bids/my`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        navigate("/auth");
        return;
      }
      const data = await res.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const withdrawBid = async (id) => {
    if (!confirm("Withdraw this bid?")) return;
    try {
      const res = await fetch(`${API_URL}/bids/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setBids((prev) => prev.filter((b) => b._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to withdraw bid");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to withdraw bid");
    }
  };

  const startEdit = (bid) => {
    setEditing(bid._id);
    setEditForm({ price: bid.price, message: bid.message });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async (bidId) => {
    const res = await fetch(`${API_URL}/bids/${bidId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify({
        price: Number(editForm.price),
        message: editForm.message,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBids((prev) => prev.map((b) => (b._id === bidId ? updated : b)));
      setEditing(null);
    } else {
      alert(await res.text());
    }
  };

  // Statistics
  const stats = {
    total: bids.length,
    pending: bids.filter((b) => b.status === "pending").length,
    hired: bids.filter((b) => b.status === "hired").length,
    rejected: bids.filter((b) => b.status === "rejected").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} className="text-amber-500" />;
      case "hired":
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "rejected":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <AlertCircle size={14} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "hired":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#09090B] dark:to-[#0a0a0f]">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Loading your bids...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#09090B] dark:to-[#0a0a0f] px-4 py-10">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 22, repeat: Infinity }}
          className="absolute -right-20 top-40 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2">
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              My Bids
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Track and manage all your proposals in one place
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20 dark:border-zinc-700/50 shadow-lg">
            <Briefcase size={18} className="text-emerald-600" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {bids.length} {bids.length === 1 ? "Bid" : "Bids"}
            </span>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Bids",
              value: stats.total,
              icon: TrendingUp,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
            {
              label: "Hired",
              value: stats.hired,
              icon: Award,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: Users,
              color: "text-red-600",
              bg: "bg-red-50 dark:bg-red-900/20",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl p-5 border border-white/20 dark:border-zinc-700/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bids List */}
        {bids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-zinc-700/50 shadow-xl">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
              <Briefcase size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No Bids Placed Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Start exploring gigs and place your first bid to begin your
              freelance journey.
            </p>
            <button
              onClick={() => navigate("/gigs")}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-105">
              Browse Gigs
              <ArrowLeft size={18} className="rotate-180" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid, index) => (
              <motion.div
                key={bid._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-zinc-700/50 shadow-lg hover:shadow-xl transition-all"
                onClick={() =>
                  !editing &&
                  bid.gigId?._id &&
                  navigate(`/gigs/${bid.gigId._id}`)
                }>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                          <Briefcase size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            {bid.gigId?.title || "Gig deleted"}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Proposal •{" "}
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold text-xl">
                        <IndianRupee size={18} /> {bid.price}
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(bid.status)} flex items-center gap-1.5`}>
                        {getStatusIcon(bid.status)}
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {editing === bid._id ? (
                    <div
                      className="mt-4 space-y-3 border-t border-slate-200 dark:border-zinc-700 pt-4"
                      onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Message
                        </label>
                        <textarea
                          value={editForm.message}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              message: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full rounded-xl border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(bid._id)}
                          className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-105">
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-zinc-600 transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    bid.message && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm mt-4 line-clamp-2 border-t border-slate-200 dark:border-zinc-700 pt-4">
                        {bid.message}
                      </p>
                    )
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Bid ID: #{bid._id.slice(-8)}</span>
                    </div>

                    {bid.status === "pending" && (
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}>
                        {editing !== bid._id && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startEdit(bid)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                            <Edit3 size={14} /> Edit
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => withdrawBid(bid._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                          <Trash2 size={14} /> Withdraw
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
