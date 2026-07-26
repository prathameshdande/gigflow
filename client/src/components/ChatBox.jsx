import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ShieldCheck, Circle } from "lucide-react";

import { API_URL } from "../api/config";
import { useAuth } from "../context/AuthContext";

import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";



const ChatBox = ({ gigId, receiverId, token }) => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token || !gigId || !receiverId) return;

    socketRef.current = io(API_URL.replace("/api", ""), {
      auth: { token },
      transports: ["websocket"],
    });

    fetch(`${API_URL}/messages/${gigId}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        console.log("Fetched Messages:", data);
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setMessages([]);
      });
    
    socketRef.current.emit("joinRoom", gigId);

    socketRef.current.on("newMessage", (msg) => {
      console.log("Realtime:", msg);

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);

        if (exists) return prev;

        return [...prev, msg];
      });
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

  }, [token, gigId, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!gigId || !user) return null;

  const send = () => {
  if (!newMsg.trim()) return;

  if (!receiverId) {
    console.error("Receiver ID missing");
    return;
  }

  if (!socketRef.current) {
    console.error("Socket not connected");
    return;
  }

  socketRef.current.emit("sendMessage", {
    gigId,
    receiver: receiverId,
    content: newMsg.trim(),
  });

  setNewMsg("");
};

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log("Current User:", user);
  console.log("First Message:", messages[0]);
  return (
    <Card
      padding="p-0"
      className="flex h-[720px] flex-col overflow-hidden border border-slate-200/70 shadow-xl dark:border-white/10">
      {/* Header */}

      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-6 py-5 text-white dark:border-white/10">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <MessageCircle size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-black">Project Chat</h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
                <Circle
                  size={10}
                  fill="currentColor"
                  className="text-emerald-300"
                />
                Connected Securely
              </div>
            </div>
          </div>

          <div className="hidden rounded-2xl bg-white/10 px-5 py-3 backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} />

              <span className="text-sm font-semibold">
                End-to-End Workspace
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-6 dark:from-slate-950 dark:to-slate-900">
        {!Array.isArray(messages) || messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No Messages Yet"
            description="Start collaborating with your client or freelancer."
          />
        ) : (
          <AnimatePresence>
            <div className="space-y-5">
              {(Array.isArray(messages) ? messages : []).map((m) => {
                const mine = m.sender?._id === user?._id;

                return (
                  <motion.div
                    key={m._id}
                    initial={{
                      opacity: 0,
                      y: 18,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className={`flex ${
                      mine ? "justify-end" : "justify-start"
                    }`}>
                    <div
                      className={`flex max-w-[85%] gap-3 ${
                        mine ? "flex-row-reverse" : ""
                      }`}>
                      {/* Avatar */}

                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-lg ${
                          mine
                            ? "bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500"
                            : "bg-gradient-to-r from-emerald-500 to-green-500"
                        }`}>
                        {(m.sender?.name ?? "Unknown User")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* Bubble */}

                      <div
                        className={`overflow-hidden rounded-3xl shadow-lg ${
                          mine
                            ? "bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white"
                            : "border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                        }`}>
                        <div className="px-5 py-4">
                          <div
                            className={`mb-2 flex items-center justify-between gap-5 ${
                              mine ? "text-blue-100" : "text-slate-500"
                            }`}>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">
                              {mine ? "You" : m.sender?.name}
                            </span>

                            <span className="text-[11px] opacity-80">
                              {formatTime(m.createdAt)}
                            </span>
                          </div>

                          <p
                            className={`whitespace-pre-wrap break-words leading-7 ${
                              mine
                                ? "text-white"
                                : "text-slate-700 dark:text-slate-300"
                            }`}>
                            {m.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          </AnimatePresence>
        )}
      </div>
      {/* ===========================
            INPUT SECTION
      =========================== */}

      <div className="border-t border-slate-200 bg-white/80 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your message..."
              className="w-full"
            />

            <p className="mt-2 pl-2 text-xs text-slate-500 dark:text-slate-400">
              Press <span className="font-semibold">Enter</span> to send
            </p>
          </div>

          <motion.div
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}>
            <Button
              onClick={send}
              disabled={!newMsg.trim()}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-0 shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={20} />
            </Button>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};

export default ChatBox;
