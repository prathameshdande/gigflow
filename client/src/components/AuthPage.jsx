import { useState } from "react";
import { Lock, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthPage = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const res = isLogin
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password);

    if (res.success) {
      if (!isLogin) {
        alert("Registration successful. Please login.");
        setIsLogin(true);
      } else {
        onSuccess();
      }
    } else {
      setError(res.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4">
      <div className="relative w-full max-w-md">
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl blur opacity-25"></div>

        <form
          onSubmit={submit}
          className="relative bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Lock className="text-emerald-600" size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {isLogin
                ? "Sign in to continue to GigFlow"
                : "Join GigFlow and start posting gigs"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <XCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Name
                </label>
                <input
                  required
                  placeholder="Enter your name"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-white font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>

          {/* Switch */}
          <p className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
