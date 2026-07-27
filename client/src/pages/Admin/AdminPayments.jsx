import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/payments`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load payments");
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDispute = async (paymentId, resolution) => {
    try {
      const res = await fetch(`${API_URL}/admin/dispute/${paymentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        fetchPayments();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to resolve dispute");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve dispute");
    }
  };

  const confirmPayment = async (paymentId) => {
    if (!window.confirm("Confirm this payment?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/payments/${paymentId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) {
        fetchPayments();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to confirm payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm payment");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Payments</h1>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Gig</th>
              <th className="p-3 text-left">Payer</th>
              <th className="p-3 text-left">Payee</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-3">{p.gigId?.title || "N/A"}</td>
                <td className="p-3">{p.payer?.name || "N/A"}</td>
                <td className="p-3">{p.payee?.name || "N/A"}</td>
                <td className="p-3">₹{p.amount}</td>
                <td className="p-3">₹{p.platformFee}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "refunded"
                          ? "bg-red-100 text-red-700"
                          : p.status === "disputed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  {p.status === "pending" && (
                    <button
                      onClick={() => confirmPayment(p._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Confirm
                    </button>
                  )}
                  {p.status === "disputed" && (
                    <>
                      <button
                        onClick={() => handleDispute(p._id, "complete")}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleDispute(p._id, "refund")}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Refund
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
