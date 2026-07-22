// src/pages/Admin/AdminMessages.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/messages`, { credentials: "include" })
      .then((res) => res.json())
      .then(setMessages);
  }, []);

  const blockUser = async (userId) => {
    if (!window.confirm("Block this user?")) return;
    await fetch(`${API_URL}/admin/block/${userId}`, {
      method: "PATCH",
      credentials: "include",
    });
    // Optionally refetch or remove from list
    setMessages((prev) => prev.filter((m) => m.sender?._id !== userId));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className="bg-white p-3 rounded shadow flex justify-between"
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
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;
