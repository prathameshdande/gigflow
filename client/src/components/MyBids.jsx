import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import {
  Briefcase,
  ArrowLeft,
  Loader2,
  Trash2,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        const res = await fetch(`${API_URL}/bids/my`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, []);

  const withdrawBid = async (id) => {
    if (!confirm("Withdraw this bid?")) return;

    await fetch(`${API_URL}/bids/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setBids((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          My Bids
        </h1>

        <div />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center text-slate-500 py-20">
          You haven’t placed any bids yet.
        </div>
      ) : (
        <div className="space-y-6">
          {bids.map((bid) => (
            <div
              key={bid._id}
              onClick={() =>
                bid.gigId?._id && navigate(`/gigs/${bid.gigId._id}`)
              }
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
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
                    <IndianRupee size={16} />
                    {bid.price}
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-4 line-clamp-2">
                  {bid.message}
                </p>

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
                    <button
                      onClick={() => {
                        withdrawBid(bid._id);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={14} />
                      Withdraw
                    </button>
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
