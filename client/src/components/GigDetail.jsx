import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const GigDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loadingGig, setLoadingGig] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [bidForm, setBidForm] = useState({ price: "", message: "" });

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await fetch(`${API_URL}/gigs/${id}`);
        if (!res.ok) throw new Error("Gig not found");
        const data = await res.json();
        setGig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGig(false);
      }
    };

    fetchGig();
  }, [id]);

  const isOwner =
    user && gig && gig.userId?.toString() === user._id;

  useEffect(() => {
    if (!isOwner || !gig) return;

    const fetchBids = async () => {
      setLoadingBids(true);
      try {
        const res = await fetch(`${API_URL}/bids/${gig._id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setBids(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBids(false);
      }
    };

    fetchBids();
  }, [gig, isOwner]);

  const submitBid = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        gigId: gig._id,
        price: Number(bidForm.price),
        message: bidForm.message,
      }),
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    alert("Bid placed successfully");
    setBidForm({ price: "", message: "" });
  };

  const hireFreelancer = async (bidId) => {
    if (!confirm("Hire this freelancer?")) return;

    const res = await fetch(`${API_URL}/bids/hire/${bidId}`, {
      method: "PATCH",
      credentials: "include",
    });

    if (res.ok) {
      setBids((prev) =>
        prev.map((b) =>
          b._id === bidId
            ? { ...b, status: "hired" }
            : { ...b, status: "rejected" }
        )
      );
    }
  };

  if (loadingGig) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        Loading gig…
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-20 text-slate-500">
        Gig not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow border">
            <h1 className="text-2xl font-bold mb-2">{gig.title}</h1>

            <div className="flex items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <DollarSign size={14} /> ${gig.budget}
              </span>
              <span>Status: <b>{gig.status}</b></span>
            </div>

            <p className="text-slate-700 whitespace-pre-wrap">{gig.desc}</p>
          </div>

          {/* OWNER: BIDS */}
          {isOwner && (
            <div className="bg-white rounded-xl shadow border">
              <div className="px-6 py-4 border-b font-semibold">
                Incoming Bids
              </div>

              {loadingBids ? (
                <div className="p-6 text-slate-500">Loading bids…</div>
              ) : bids.length === 0 ? (
                <div className="p-6 text-slate-500">No bids yet.</div>
              ) : (
                <div className="divide-y">
                  {bids.map((bid) => (
                    <div key={bid._id} className="p-6">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">
                          Freelancer: {bid.freelancerId.slice(0, 6)}…
                        </span>
                        <span className="font-bold text-emerald-700">
                          ${bid.price}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-2">
                        {bid.message}
                      </p>

                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100">
                          {bid.status}
                        </span>

                        {gig.status === "open" &&
                          bid.status === "pending" && (
                            <button
                              onClick={() => hireFreelancer(bid._id)}
                              className="px-3 py-1 text-xs bg-slate-900 text-white rounded"
                            >
                              Hire
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <div className="bg-white rounded-xl shadow border p-6 sticky top-24">
            <h3 className="font-semibold mb-4">Take Action</h3>

            {!user ? (
              <p className="text-sm text-slate-500">
                Login to place a bid.
              </p>
            ) : isOwner ? (
              <p className="text-sm text-slate-500">
                You are the owner.
              </p>
            ) : gig.status !== "open" ? (
              <p className="text-sm text-slate-500">Gig is closed.</p>
            ) : (
              <form onSubmit={submitBid} className="space-y-4">
                <input
                  type="number"
                  required
                  placeholder="Your price"
                  value={bidForm.price}
                  onChange={(e) =>
                    setBidForm({ ...bidForm, price: e.target.value })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Proposal"
                  value={bidForm.message}
                  onChange={(e) =>
                    setBidForm({ ...bidForm, message: e.target.value })
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <button className="w-full py-2 rounded bg-emerald-600 text-white text-sm font-semibold">
                  Submit Bid
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
