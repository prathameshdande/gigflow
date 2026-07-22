import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { Loader2, IndianRupee, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    setLoading(true);
    fetch(`${API_URL}/payments/my`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const confirmPayment = async (paymentId) => {
    if (!confirm("Confirm this payment?")) return;
    const res = await fetch(`${API_URL}/payments/${paymentId}/confirm`, {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      fetchPayments(); // refresh list
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      {payments.length === 0 ? (
        <p className="text-slate-500">No payments yet.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p._id}
              className="bg-white p-5 rounded-xl shadow border flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {p.gigId?.title || "Unknown Gig"}
                </h3>
                <p className="text-sm text-slate-500">
                  {p.payer?.name || "Client"} → {p.payee?.name || "Freelancer"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold flex items-center text-emerald-700">
                    <IndianRupee size={16} /> {p.amount}
                  </p>
                  <p className="text-xs text-slate-500">
                    Fee: ₹{p.platformFee}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "refunded"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
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
