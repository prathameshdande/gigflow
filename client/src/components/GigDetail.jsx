import { useEffect, useState } from "react";
import { API_URL } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, IndianRupee, Loader2 } from "lucide-react";
import ChatBox from "./ChatBox";

const GigDetail = () => {
  const { user, token } = useAuth(); // ← now destructure token
  const { id } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ price: "", message: "" });
  const [submissionMsg, setSubmissionMsg] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });

  // Direct ID comparison (userId and assignedTo are strings)
  const isOwner = user && gig && gig.userId === user._id;
  const isFreelancer = user && gig && gig.assignedTo === user._id;
  const canChat = isOwner || isFreelancer;
  const chatReceiver = isOwner ? gig?.assignedTo : gig?.userId;

  useEffect(() => {
    fetch(`${API_URL}/gigs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setGig(data);
        setLoading(false);
      })
      .catch(() => {
        setGig(null);
        setLoading(false);
      });
  }, [id]);

  // Fetch bids if owner
  useEffect(() => {
    if (!isOwner || !gig) return;
    fetch(`${API_URL}/bids/${gig._id}`, { credentials: "include" })
      .then((res) => res.json())
      .then(setBids)
      .catch(console.error);
  }, [gig, isOwner]);

  const placeBid = async (e) => {
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
    if (res.ok) {
      alert("Bid placed!");
      setBidForm({ price: "", message: "" });
    } else alert(await res.text());
  };

  const hire = async (bidId) => {
    if (!confirm("Hire this freelancer?")) return;
    await fetch(`${API_URL}/bids/hire/${bidId}`, {
      method: "PATCH",
      credentials: "include",
    });
    const updatedGig = await fetch(`${API_URL}/gigs/${id}`).then((r) =>
      r.json(),
    );
    setGig(updatedGig);
  };

  const submitWork = async () => {
    const res = await fetch(`${API_URL}/gigs/${gig._id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message: submissionMsg }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGig(updated);
      alert("Work submitted for approval.");
    } else alert(await res.text());
  };

  const approveWork = async () => {
    const res = await fetch(`${API_URL}/gigs/${gig._id}/approve`, {
      method: "PATCH",
      credentials: "include",
    });
    if (res.ok) {
      // Automatically create payment
      await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ gigId: gig._id, amount: gig.budget }),
      });
      const updatedGig = await fetch(`${API_URL}/gigs/${id}`).then((r) =>
        r.json(),
      );
      setGig(updatedGig);
      alert("Work approved and payment created!");
    } else alert(await res.text());
  };

  const createPayment = async () => {
    if (!confirm("Create payment for this gig?")) return;
    const res = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ gigId: gig._id, amount: gig.budget }),
    });
    if (res.ok) alert("Payment created.");
    else alert(await res.text());
  };

  const submitReview = async () => {
    const targetId = isOwner ? gig.assignedTo : gig.userId;
    if (!targetId) return alert("No user to review.");
    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        gigId: gig._id,
        targetUser: targetId,
        rating: review.rating,
        comment: review.comment,
      }),
    });
    if (res.ok) alert("Review submitted!");
    else alert(await res.text());
  };

  const deleteGig = async () => {
    if (!confirm("Delete this gig?")) return;
    await fetch(`${API_URL}/gigs/${gig._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    navigate("/");
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );
  if (!gig) return <div className="text-center py-20">Gig not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} className="mr-1" /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow border">
            <h1 className="text-2xl font-bold mb-2">{gig.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <IndianRupee size={14} />
                {gig.budget}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  gig.status === "open"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {gig.status}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-slate-700">{gig.desc}</p>

            {isOwner && gig.status === "open" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/edit-gig/${gig._id}`)}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={deleteGig}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Owner sees bids */}
          {isOwner && (
            <div className="bg-white rounded-xl p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">
                Bids ({bids.length})
              </h2>
              {bids.length === 0 ? (
                <p className="text-slate-500">No bids yet.</p>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid._id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {bid.freelancerId?.name || "Freelancer"}
                        </span>
                        <span className="font-bold text-emerald-700">
                          <IndianRupee size={14} />
                          {bid.price}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {bid.message}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            bid.status === "hired"
                              ? "bg-green-100 text-green-700"
                              : bid.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {bid.status}
                        </span>
                        {gig.status === "open" && bid.status === "pending" && (
                          <button
                            onClick={() => hire(bid._id)}
                            className="text-xs bg-slate-900 text-white px-3 py-1 rounded hover:bg-slate-700"
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

          {/* Work submission (freelancer) */}
          {isFreelancer && gig.status === "assigned" && (
            <div className="bg-white rounded-xl p-6 shadow border">
              <h2 className="text-lg font-semibold mb-3">Submit Your Work</h2>
              <textarea
                rows={3}
                placeholder="Describe what you delivered..."
                value={submissionMsg}
                onChange={(e) => setSubmissionMsg(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={submitWork}
                className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Submit Work
              </button>
            </div>
          )}

          {/* Client approval */}
          {isOwner && gig.status === "assigned" && gig.submission && (
            <div className="bg-white rounded-xl p-6 shadow border">
              <h2 className="text-lg font-semibold mb-2">Submitted Work</h2>
              <p className="text-sm text-slate-600">{gig.submission.message}</p>
              <button
                onClick={approveWork}
                className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Approve & Pay
              </button>
            </div>
          )}

          {/* Chat (after assignment) */}
          {canChat && gig.status !== "open" && (
            <ChatBox
              gigId={gig._id}
              receiverId={chatReceiver}
              token={token} // ← pass the token!
            />
          )}
        </div>

        {/* Right column – actions */}
        <div className="space-y-4">
          {/* Place bid (freelancer) */}
          {user &&
            !isOwner &&
            gig.status === "open" &&
            user.role === "freelancer" && (
              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="font-semibold mb-3">Place a Bid</h3>
                <form onSubmit={placeBid} className="space-y-3">
                  <input
                    type="number"
                    required
                    placeholder="Your price"
                    value={bidForm.price}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, price: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Proposal"
                    value={bidForm.message}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, message: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 resize-none"
                  />
                  <button className="w-full bg-emerald-600 text-white py-2 rounded font-semibold">
                    Submit Bid
                  </button>
                </form>
              </div>
            )}

          {/* Manual payment trigger (client) */}
          {isOwner && gig.status === "completed" && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h3 className="font-semibold mb-3">Payment</h3>
              <button
                onClick={createPayment}
                className="w-full bg-emerald-600 text-white py-2 rounded font-semibold"
              >
                Create Payment
              </button>
            </div>
          )}

          {/* Review (after completion) */}
          {(isOwner || isFreelancer) && gig.status === "completed" && (
            <div className="bg-white rounded-xl shadow border p-6">
              <h3 className="font-semibold mb-3">Leave a Review</h3>
              <div className="space-y-3">
                <select
                  value={review.rating}
                  onChange={(e) =>
                    setReview({ ...review, rating: Number(e.target.value) })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Your feedback..."
                  rows={2}
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 resize-none"
                />
                <button
                  onClick={submitReview}
                  className="w-full bg-yellow-500 text-white py-2 rounded font-semibold"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
