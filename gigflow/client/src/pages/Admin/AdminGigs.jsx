// src/pages/Admin/AdminGigs.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/gigs`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load gigs");
      setGigs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/admin/gigs/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchGigs();
      else toast.error("Failed to update gig status");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update gig status");
    }
  };

  const deleteGig = async (id) => {
    if (!confirm("Delete this gig?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/gigs/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) fetchGigs();
      else toast.error("Failed to delete gig");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete gig");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Gigs</h1>
      <div className="grid gap-4">
        {gigs.map((gig) => (
          <div
            key={gig._id}
            className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 flex flex-wrap items-center justify-between"
          >
            <div>
              <h3 className="font-semibold">{gig.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Budget: ₹{gig.budget} | Status: {gig.status}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={gig.status}
                onChange={(e) => updateStatus(gig._id, e.target.value)}
                className="border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 text-sm"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
              <button
                onClick={() => deleteGig(gig._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGigs;
