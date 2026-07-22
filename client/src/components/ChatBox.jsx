import { useEffect, useState, useRef } from "react";
import { API_URL } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { Send } from "lucide-react";
import { io } from "socket.io-client";

let socket;

const ChatBox = ({ gigId, receiverId, token }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Create socket connection with auth token
    socket = io(API_URL.replace("/api", ""), {
      auth: { token },
    });

    // Fetch previous messages
    fetch(`${API_URL}/messages/${gigId}`, { credentials: "include" })
      .then((res) => res.json())
      .then(setMessages)
      .catch(console.error);

    socket.emit("joinRoom", gigId);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [gigId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!newMsg.trim() || !socket) return;
    socket.emit("sendMessage", {
      gigId,
      receiver: receiverId,
      content: newMsg,
    });
    setNewMsg("");
  };

  return (
    <div className="bg-white rounded-xl shadow border p-4 h-[400px] flex flex-col">
      <h3 className="font-semibold mb-3">Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`p-2 rounded-lg max-w-[80%] ${
              m.sender._id === user._id
                ? "bg-emerald-100 ml-auto"
                : "bg-slate-100"
            }`}
          >
            <p className="text-xs text-slate-500">{m.sender.name}</p>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 border rounded px-3 py-1"
          placeholder="Type a message..."
        />
        <button
          onClick={send}
          className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
