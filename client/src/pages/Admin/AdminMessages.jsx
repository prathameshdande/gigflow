// src/pages/Admin/AdminMessages.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/messages`, {
      credentials: "include",
      headers: authHeaders(),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load messages");
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const blockUser = async (userId) => {
    if (!window.confirm("Block this user?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/block/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.sender?._id !== userId));
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to block user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to block user");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-2">
        {messages.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white dark:bg-slate-900 p-3 rounded shadow flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {msg.sender?.name || "Unknown"} →{" "}
                  {msg.receiver?.name || "Unknown"}
                </p>
                <p className="text-sm">{msg.content}</p>
              </div>
              <button
                onClick={() => blockUser(msg.sender?._id)}
                className="text-red-500 text-sm hover:underline"
              >
                Block Sender
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
