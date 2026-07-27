// src/pages/Admin/AdminBids.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBids = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/bids`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load bids");
      setBids(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const approveBid = async (bidId) => {
    try {
      const res = await fetch(`${API_URL}/admin/bids/${bidId}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) fetchBids();
      else toast.error("Failed to approve bid");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve bid");
    }
  };

  const markSpam = async (bidId) => {
    try {
      const res = await fetch(`${API_URL}/admin/bids/${bidId}/spam`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) fetchBids();
      else toast.error("Failed to mark bid as spam");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark bid as spam");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Bids</h1>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div
            key={bid._id}
            className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 flex flex-wrap items-center justify-between"
          >
            <div>
              <p className="font-medium">
                Gig: {bid.gigId?.title || "Unknown"}
              </p>
              <p className="text-sm">
                Freelancer: {bid.freelancerId?.name || "N/A"}
              </p>
              <p className="text-sm">
                Price: ₹{bid.price} | Status: {bid.status}
              </p>
              <p className="text-sm">
                Admin Approved: {bid.adminApproved ? "✅" : "❌"}
              </p>
            </div>
            <div className="flex gap-2">
              {!bid.adminApproved && (
                <button
                  onClick={() => approveBid(bid._id)}
                  className="bg-emerald-500 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => markSpam(bid._id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Mark Spam
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBids;
