import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { Loader2, IndianRupee, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = () => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/payments/my`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load payments");
        }

        // Guard against a non-array response so a bad response can never
        // crash the page - show an error state instead.
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setPayments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const confirmPayment = async (paymentId) => {
    if (!confirm("Confirm this payment?")) return;

    try {
      const res = await fetch(`${API_URL}/payments/${paymentId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Payment confirmed");
        fetchPayments();
      } else {
        toast.error(data.message || "Failed to confirm payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm payment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchPayments}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-slate-900"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      {payments.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No payments yet.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow border border-slate-200 dark:border-white/10 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {p.gigId?.title || "Unknown Gig"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {p.payer?.name || "Client"} → {p.payee?.name || "Freelancer"}
                </p>
                {p.methodDetail && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Paid via {p.methodDetail}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold flex items-center text-emerald-700 dark:text-emerald-400">
                    <IndianRupee size={16} /> {p.amount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fee: ₹{p.platformFee}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : p.status === "refunded"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                {/* Confirm button for client's pending payments */}
                {p.status === "pending" && user?._id === p.payer?._id && (
                  <button
                    onClick={() => confirmPayment(p._id)}
                    className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                  >
                    <CheckCircle size={14} /> Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPayments;
