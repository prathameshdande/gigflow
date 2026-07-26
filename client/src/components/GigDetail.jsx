import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IndianRupee,
  Calendar,
  User,
  Briefcase,
  Clock3,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  MessageCircle,
  Star,
  ArrowRight,
  CheckCircle2,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { API_URL } from "../api/config";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Input from "./ui/Input";
import TextArea from "./ui/TextArea";
import ChatBox from "./ChatBox";
import EmptyState from "./ui/EmptyState";

const GigDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bids, setBids] = useState([]);
  const [hasBid, setHasBid] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  const [submission, setSubmission] = useState({
    file: "",
    message: "",
  });

  const [review, setReview] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchGig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchGig = async () => {
    try {
      const res = await fetch(`${API_URL}/gigs/${id}`, {
        credentials: "include",
      });

      const data = await res.json();
      setGig(data);
      await fetchBids(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bids aren't embedded on the gig document - fetch them from the
  // dedicated endpoint. Owners can see all proposals; freelancers can
  // only see whether *they* already bid (via /bids/my).
  const fetchBids = async (gigData) => {
    if (!user) {
      setBids([]);
      setHasBid(false);
      return;
    }

    const isOwner = user._id === gigData?.userId?._id;

    try {
      if (isOwner) {
        const res = await fetch(`${API_URL}/bids/${id}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBids(data);
        }
      } else if (user.role === "freelancer") {
        const res = await fetch(`${API_URL}/bids/my`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHasBid(data.some((b) => b.gigId?._id === id));
        }
      } else {
        // e.g. an admin, or a client viewing someone else's gig - neither
        // the owner-only bid list nor the freelancer-only "my bids" check
        // applies to them.
        setBids([]);
        setHasBid(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitBid = async () => {
    if (!bidAmount || !bidMessage) {
      toast.error("Please enter a bid amount and proposal message.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          gigId: id,
          price: Number(bidAmount),
          message: bidMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Proposal submitted!");
        setBidAmount("");
        setBidMessage("");
        fetchGig();
      } else {
        toast.error(data.message || "Failed to submit proposal");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit proposal");
    }
  };

  const submitWork = async () => {
    if (!submission.message) {
      toast.error("Please describe what you're submitting.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/gigs/${id}/submit-work`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(submission),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Work submitted for review!");
        fetchGig();
        setSubmission({ file: "", message: "" });
      } else {
        toast.error(data.message || "Failed to submit work");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit work");
    }
  };

  const approveWork = async () => {
    try {
      const res = await fetch(`${API_URL}/gigs/${id}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Work approved!");
        fetchGig();
      } else {
        toast.error(data.message || "Failed to approve work");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve work");
    }
  };

  const submitReview = async () => {
    try {
      const res = await fetch(`${API_URL}/gigs/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(review),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Review submitted!");
        fetchGig();
        setReview({ rating: 5, comment: "" });
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    }
  };

  const [paying, setPaying] = useState(false);

  // Real Razorpay checkout: create an order server-side (amount is derived
  // from the gig's budget there, never from the client), open Razorpay's
  // hosted widget (handles card/UPI/netbanking/wallet UI itself - we never
  // collect card numbers or CVVs ourselves), then verify the signature
  // server-side before marking the payment complete.
  const payWithRazorpay = async () => {
    setPaying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway. Check your connection.");
        return;
      }

      const orderRes = await fetch(`${API_URL}/payments/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ gigId: id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.message || "Could not start payment");
        return;
      }

      if (orderData.alreadyPaid) {
        toast.success("This project has already been paid.");
        fetchGig();
        return;
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "GigFlow",
        description: orderData.gigTitle,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              credentials: "include",
              body: JSON.stringify({
                gigId: id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success("Payment successful! Freelancer has been paid.");
              fetchGig();
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled", { icon: "ℹ️" });
          },
        },
      });

      rzp.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Could not start payment");
    } finally {
      setPaying(false);
    }
  };

  const isOwner = user?._id === gig?.userId?._id;

  const isFreelancer = user?._id === gig?.assignedTo?._id;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-20 w-20 rounded-full border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-5xl py-16">
        <EmptyState
          icon={Briefcase}
          title="Gig not found"
          description="This project no longer exists."
        />
      </div>
    );
  }

  const canChat =
    !!user &&
    (user._id === gig.userId?._id || user._id === gig.assignedTo?._id);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[160px]" />

        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card padding="p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <Badge
                      variant={
                        gig.status === "open"
                          ? "success"
                          : gig.status === "in-progress"
                            ? "warning"
                            : "secondary"
                      }>
                      {gig.status}
                    </Badge>

                    <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-cyan-400">
                      <Sparkles size={15} />
                      Premium Project
                    </div>
                  </div>

                  <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                    {gig.title}
                  </h1>

                  <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                    {gig.description || gig.desc}
                  </p>
                </div>

                <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-7 text-white shadow-2xl">
                  <p className="text-xs uppercase tracking-[0.3em]">Budget</p>

                  <div className="mt-4 flex items-center text-4xl font-black">
                    <IndianRupee size={30} />
                    {gig.budget?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-4">
                <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                  <User className="mb-3 text-blue-500" />

                  <p className="text-xs uppercase text-slate-500">Client</p>

                  <h3 className="mt-2 font-bold dark:text-white">
                    {gig.userId?.name || "Anonymous"}
                  </h3>
                </div>

                <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                  <Calendar className="mb-3 text-violet-500" />

                  <p className="text-xs uppercase text-slate-500">Posted</p>

                  <h3 className="mt-2 font-bold dark:text-white">
                    {new Date(gig.createdAt).toLocaleDateString()}
                  </h3>
                </div>

                <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                  <Clock3 className="mb-3 text-emerald-500" />

                  <p className="text-xs uppercase text-slate-500">Status</p>

                  <h3 className="mt-2 font-bold capitalize dark:text-white">
                    {gig.status}
                  </h3>
                </div>

                <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                  <Briefcase className="mb-3 text-orange-500" />

                  <p className="text-xs uppercase text-slate-500">Bids</p>

                  <h3 className="mt-2 font-bold dark:text-white">
                    {bids.length || 0}
                  </h3>
                </div>
              </div>
            </Card>
            {gig.status === "open" && (
              <Card padding="p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Badge variant="info">Bidding Open</Badge>

                    <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                      Project Proposals
                    </h2>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Submit your proposal or review incoming freelancer bids.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-center text-white">
                    <p className="text-xs uppercase tracking-[0.25em]">
                      Total Bids
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      {bids.length || 0}
                    </h3>
                  </div>
                </div>

                {!isOwner && !hasBid ? (
                  <div className="space-y-6">
                    <Input
                      label="Your Bid Amount"
                      icon={IndianRupee}
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your quotation"
                    />

                    <TextArea
                      label="Proposal"
                      rows={6}
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Explain your experience, timeline, and why you're the best freelancer for this project..."
                    />

                    <Button onClick={submitBid}>Submit Proposal</Button>
                  </div>
                ) : isOwner ? (
                  <div className="space-y-5">
                    {bids.length === 0 ? (
                      <EmptyState
                        icon={Briefcase}
                        title="No Proposals Yet"
                        description="Freelancer proposals will appear here."
                      />
                    ) : (
                      bids.map((bid) => (
                        <motion.div
                          key={bid._id}
                          whileHover={{
                            y: -4,
                          }}
                          className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                          <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex gap-5">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-2xl font-black text-white">
                                {bid.freelancerId?.name?.charAt(0)}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold dark:text-white">
                                    {bid.freelancerId?.name}
                                  </h3>

                                  <BadgeCheck
                                    size={18}
                                    className="text-blue-500"
                                  />
                                </div>

                                <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
                                  {bid.message}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                                Quotation
                              </div>

                              <div className="mt-2 flex items-center justify-end text-3xl font-black text-emerald-600">
                                <IndianRupee size={24} />
                                {bid.price}
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-end">
                            <Button
                              variant="success"
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `${API_URL}/gigs/${id}/accept-bid`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                      },
                                      credentials: "include",
                                      body: JSON.stringify({
                                        bidId: bid._id,
                                      }),
                                    },
                                  );

                                  const data = await res.json();

                                  if (res.ok) {
                                    toast.success("Freelancer hired!");
                                    fetchGig();
                                  } else {
                                    toast.error(data.message || "Failed to hire freelancer");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  toast.error("Failed to hire freelancer");
                                }
                              }}>
                              Accept Proposal
                              <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" />

                      <div>
                        <h3 className="font-bold dark:text-white">
                          Proposal Submitted
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          You have already submitted your proposal for this
                          project.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
            {/* ===========================
      SUBMIT WORK
=========================== */}

            {isFreelancer && gig.status === "in-progress" && (
              <Card padding="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <Badge variant="warning">In Progress</Badge>

                    <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                      Submit Completed Work
                    </h2>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Share your completed project with the client for final
                      review.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4 text-white shadow-lg">
                    <Clock3 size={28} />
                  </div>
                </div>

                <div className="space-y-8">
                  <Input
                    label="Project File URL"
                    placeholder="Google Drive / Dropbox / GitHub / Vercel Link"
                    value={submission.file}
                    onChange={(e) =>
                      setSubmission({
                        ...submission,
                        file: e.target.value,
                      })
                    }
                  />

                  <TextArea
                    label="Completion Message"
                    rows={6}
                    value={submission.message}
                    onChange={(e) =>
                      setSubmission({
                        ...submission,
                        message: e.target.value,
                      })
                    }
                    placeholder="Explain what has been completed, deployment details, credentials, documentation, etc."
                  />

                  <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-violet-500/10 p-6">
                    <h3 className="font-bold dark:text-white">
                      Before submitting
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li>✓ Test your application thoroughly.</li>

                      <li>✓ Verify deployment links.</li>

                      <li>✓ Include documentation.</li>

                      <li>✓ Mention setup instructions if required.</li>
                    </ul>
                  </div>

                  <Button variant="warning" onClick={submitWork}>
                    Submit Work For Review
                  </Button>
                </div>
              </Card>
            )}

            {/* ===========================
      CLIENT APPROVAL
=========================== */}

            {isOwner && gig.status === "submitted" && (
              <Card padding="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <Badge variant="info">Awaiting Approval</Badge>

                    <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                      Review Submission
                    </h2>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      The freelancer has submitted the project for review.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 p-5 text-white">
                    <ShieldCheck size={32} />
                  </div>
                </div>

                {gig.submission && (
                  <motion.div
                    whileHover={{
                      y: -4,
                    }}
                    className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Freelancer Message
                      </p>

                      <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
                        {gig.submission.message}
                      </p>
                    </div>

                    {gig.submission.file && (
                      <a
                        href={gig.submission.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                        Open Submitted Work
                        <ArrowRight size={18} />
                      </a>
                    )}
                  </motion.div>
                )}

                <div className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                  <div className="flex gap-4">
                    <CheckCircle2 className="mt-1 text-emerald-500" />

                    <div>
                      <h3 className="font-bold dark:text-white">
                        Review Checklist
                      </h3>

                      <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <li>✓ Verify all requested features.</li>

                        <li>✓ Check deployment.</li>

                        <li>✓ Test responsiveness.</li>

                        <li>✓ Review documentation.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button variant="success" onClick={approveWork}>
                    <ThumbsUp size={18} className="mr-2" />
                    Approve & Complete Project
                  </Button>
                </div>
              </Card>
            )}
            {/* ===========================
        REVIEW SECTION
=========================== */}

            {(isOwner || isFreelancer) && gig.status === "completed" && (
              <Card padding="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <Badge variant="warning">Project Completed</Badge>

                    <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                      Share Your Experience
                    </h2>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Help build trust by leaving an honest review.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 p-6 text-white shadow-xl">
                    <Star size={34} />
                  </div>
                </div>

                <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 dark:border-yellow-500/20 dark:bg-gradient-to-r dark:from-yellow-500/10 dark:to-orange-500/10">
                  <h3 className="font-bold dark:text-white">
                    Rate this Project
                  </h3>

                  <div className="mt-6 flex flex-wrap gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{
                          scale: 1.12,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        type="button"
                        onClick={() =>
                          setReview({
                            ...review,
                            rating: star,
                          })
                        }
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all ${
                          review.rating >= star
                            ? "bg-yellow-400 text-white shadow-xl"
                            : "bg-slate-100 text-slate-400 hover:bg-yellow-100 dark:bg-white/10"
                        }`}>
                        ★
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <TextArea
                    rows={5}
                    value={review.comment}
                    onChange={(e) =>
                      setReview({
                        ...review,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Describe your experience working on this project..."
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <Button variant="warning" onClick={submitReview}>
                    Submit Review
                  </Button>
                </div>
              </Card>
            )}

            {/* ===========================
      PAYMENT SECTION
=========================== */}

            {isOwner && gig.status === "completed" && (
              <Card padding="p-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Badge variant="success">Ready For Payment</Badge>

                    <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                      Release Freelancer Payment
                    </h2>

                    <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
                      The project has been successfully completed. Release the
                      agreed payment securely through GigFlow.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white shadow-2xl">
                    <p className="text-xs uppercase tracking-[0.25em]">
                      Amount
                    </p>

                    <div className="mt-4 flex items-center text-4xl font-black">
                      <IndianRupee size={28} />

                      {gig.budget?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                    <ShieldCheck className="mb-3 text-emerald-500" />

                    <h3 className="font-bold dark:text-white">
                      Secure Checkout
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Choose UPI, card, or netbanking.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                    <CheckCircle2 className="mb-3 text-blue-500" />

                    <h3 className="font-bold dark:text-white">
                      Instant Confirmation
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Payment status updates immediately.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/5 p-5 dark:bg-white/5">
                    <BadgeCheck className="mb-3 text-violet-500" />

                    <h3 className="font-bold dark:text-white">
                      Trusted Platform
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Safe transactions for both parties.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    variant="success"
                    onClick={payWithRazorpay}
                    disabled={paying}>
                    {paying ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Opening Checkout...
                      </>
                    ) : (
                      <>
                        Release Payment
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
            {/* ===========================
                    CHAT SECTION
            =========================== */}

            {canChat && gig.assignedTo && (
              <ChatBox
                gigId={gig._id}
                receiverId={isOwner ? gig.assignedTo._id : gig.userId._id}
                token={localStorage.getItem("token")}
              />
            )}
          </div>

          {/* ===========================
                RIGHT SIDEBAR
          =========================== */}

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card padding="p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-2xl font-black text-white">
                  {(gig.userId?.name || "A").charAt(0)}
                </div>

                <div>
                  <h3 className="text-xl font-bold dark:text-white">
                    {gig.userId?.name || "Anonymous"}
                  </h3>

                  <p className="text-sm text-slate-500">Project Owner</p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>

                  <Badge
                    variant={
                      gig.status === "open"
                        ? "success"
                        : gig.status === "completed"
                          ? "success"
                          : "warning"
                    }>
                    {gig.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Budget</span>

                  <span className="font-bold text-blue-600 dark:text-cyan-400">
                    ₹{gig.budget?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Proposals</span>

                  <span className="font-bold dark:text-white">
                    {bids.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Freelancer</span>

                  <span className="font-semibold dark:text-white">
                    {gig.assignedTo?.name || "--"}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="p-7">
              <h3 className="text-xl font-bold dark:text-white">
                Project Progress
              </h3>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Completion</span>

                  <span className="font-semibold">
                    {gig.status === "open"
                      ? "25%"
                      : gig.status === "in-progress"
                        ? "60%"
                        : gig.status === "submitted"
                          ? "90%"
                          : "100%"}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        gig.status === "open"
                          ? "25%"
                          : gig.status === "in-progress"
                            ? "60%"
                            : gig.status === "submitted"
                              ? "90%"
                              : "100%",
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-black/5 p-5 text-center dark:bg-white/5">
                  <Star className="mx-auto mb-2 text-yellow-500" />

                  <h4 className="text-2xl font-black dark:text-white">
                    {gig.review?.rating || "--"}
                  </h4>

                  <p className="text-xs text-slate-500">Rating</p>
                </div>

                <div className="rounded-2xl bg-black/5 p-5 text-center dark:bg-white/5">
                  <MessageCircle className="mx-auto mb-2 text-blue-500" />

                  {/* <h4 className="text-2xl font-black dark:text-white">
                    {gig.messages?.length || 0}
                  </h4> */}

                  <p className="text-xs text-slate-500">Messages</p>
                </div>
              </div>
            </Card>

            <Card
              padding="p-7"
              className="bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white">
              <Sparkles size={30} />

              <h3 className="mt-5 text-2xl font-black">GigFlow Premium</h3>

              <p className="mt-4 text-white/90 leading-7">
                Secure collaboration, milestone tracking, integrated messaging,
                and protected payments— all in one workspace.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default GigDetail;
