// src/pages/Admin/AdminReviews.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/reviews`, {
      credentials: "include",
      headers: authHeaders(),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load reviews");
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } else {
        toast.error("Failed to remove review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove review");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-slate-900 p-4 rounded shadow flex justify-between items-start"
          >
            <div>
              <p className="font-semibold">
                {review.reviewer?.name || "User"} reviewed{" "}
                {review.targetUser?.name || "User"}
              </p>
              <p className="text-yellow-600">Rating: {review.rating} / 5</p>
              <p className="text-sm">{review.comment}</p>
            </div>
            <button
              onClick={() => deleteReview(review._id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;
