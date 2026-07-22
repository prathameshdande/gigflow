import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  Trash2,
  IndianRupee,
  Edit3,
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
      const res = await fetch(`${API_URL}/bids/my`, { credentials: "include" });
      if (res.status === 401) {
        localStorage.removeItem("currentUser");
        navigate("/auth");
        return;
      }
      const data = await res.json();
      setBids(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const withdrawBid = async (id) => {
    if (!confirm("Withdraw this bid?")) return;
    await fetch(`${API_URL}/bids/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setBids((prev) => prev.filter((b) => b._id !== id));
  };

  const startEdit = (bid) => {
    setEditing(bid._id);
    setEditForm({ price: bid.price, message: bid.message });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async (bidId) => {
    const res = await fetch(`${API_URL}/bids/${bidId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          My Bids
        </h1>
        <div />
      </div>

      {bids.length === 0 ? (
        <div className="text-center text-slate-500 py-20">
          You haven’t placed any bids yet.
        </div>
      ) : (
        <div className="space-y-6">
          {bids.map((bid) => (
            <div
              key={bid._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              onClick={() =>
                !editing && bid.gigId?._id && navigate(`/gigs/${bid.gigId._id}`)
              }
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Briefcase size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition">
                        {bid.gigId?.title || "Gig deleted"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your proposal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-emerald-700 font-bold text-lg">
                    <IndianRupee size={16} /> {bid.price}
                  </div>
                </div>

                {editing === bid._id ? (
                  <div
                    className="mt-4 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      className="w-full border rounded px-3 py-1 text-sm"
                    />
                    <textarea
                      value={editForm.message}
                      onChange={(e) =>
                        setEditForm({ ...editForm, message: e.target.value })
                      }
                      rows={2}
                      className="w-full border rounded px-3 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(bid._id)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-slate-200 px-3 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm mt-4 line-clamp-2">
                    {bid.message}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      bid.status === "pending"
                        ? "bg-slate-100 text-slate-600"
                        : bid.status === "hired"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {bid.status.toUpperCase()}
                  </span>

                  {bid.status === "pending" && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editing !== bid._id && (
                        <button
                          onClick={() => startEdit(bid)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => withdrawBid(bid._id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} /> Withdraw
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
