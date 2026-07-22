// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { API_URL } from "../api/config";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold">Forgot Password</h2>
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="w-full border rounded-lg px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full bg-emerald-600 text-white py-2 rounded-lg">
          Send Reset Link
        </button>
        {message && (
          <p className="text-sm text-center text-emerald-700">{message}</p>
        )}
        <p className="text-sm text-center">
          Remembered?{" "}
          <Link to="/auth" className="text-emerald-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
