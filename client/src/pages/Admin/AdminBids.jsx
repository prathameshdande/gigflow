// src/pages/Admin/AdminBids.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";

const AdminBids = () => {
  const [bids, setBids] = useState([]);

  const fetchBids = async () => {
    const res = await fetch(`${API_URL}/admin/bids`, {
      credentials: "include",
    });
    const data = await res.json();
    setBids(data);
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const approveBid = async (bidId) => {
    await fetch(`${API_URL}/admin/bids/${bidId}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchBids();
  };

  const markSpam = async (bidId) => {
    await fetch(`${API_URL}/admin/bids/${bidId}/spam`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchBids();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Bids</h1>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div
            key={bid._id}
            className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center justify-between"
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
