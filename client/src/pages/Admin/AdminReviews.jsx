// src/pages/Admin/AdminReviews.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/reviews`, { credentials: "include" })
      .then((res) => res.json())
      .then(setReviews);
  }, []);

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white p-4 rounded shadow flex justify-between items-start"
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
