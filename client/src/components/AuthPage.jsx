import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Briefcase,
  Shield,
  MessageCircle,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setError("");
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation for register
    if (!isLogin) {
      if (form.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
    }

    setLoading(true);

    try {
      const result = isLogin
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password, form.role);

      if (!result.success) {
        throw new Error(result.message || "Authentication failed");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]"
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Brand */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">GigFlow</h1>
            <p className="text-slate-400 text-lg">
              Build your freelance career
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure Payments" },
              { icon: Users, text: "Verified Freelancers" },
              { icon: MessageCircle, text: "Real-Time Chat" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <item.icon size={20} className="text-emerald-400" />
                </div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { value: "10K+", label: "Users" },
              { value: "2K+", label: "Projects" },
              { value: "₹5Cr+", label: "Paid" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}>
                <h2 className="text-3xl font-black text-white">{stat.value}</h2>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isLogin ? "Sign in to continue" : "Start your journey today"}
              </p>
            </div>
            <div className="flex gap-2 bg-white/5 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isLogin
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}>
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !isLogin
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}>
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field - Register Only */}
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength - Register Only */}
            {!isLogin && form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 rounded-2xl bg-white/5 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">
                    Password Strength
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      form.password.length > 10
                        ? "text-green-400"
                        : form.password.length > 6
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}>
                    {form.password.length > 10
                      ? "Strong"
                      : form.password.length > 6
                        ? "Medium"
                        : "Weak"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        form.password.length > 10
                          ? "100%"
                          : form.password.length > 6
                            ? "66%"
                            : "33%",
                    }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      form.password.length > 10
                        ? "bg-green-500"
                        : form.password.length > 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="grid gap-2 pt-2 text-sm">
                  {[
                    { label: "8 Characters", test: form.password.length >= 8 },
                    {
                      label: "Uppercase Letter",
                      test: /[A-Z]/.test(form.password),
                    },
                    { label: "One Number", test: /\d/.test(form.password) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.test ? (
                        <CheckCircle2 size={15} className="text-green-400" />
                      ) : (
                        <XCircle size={15} className="text-red-400" />
                      )}
                      <span
                        className={
                          item.test ? "text-green-400" : "text-red-400"
                        }>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Confirm Password - Register Only */}
            {!isLogin && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 text-sm">
                    {form.password === confirmPassword ? (
                      <>
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span className="text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-red-400">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Role Selection - Register Only */}
            {!isLogin && (
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-300">
                  Choose Your Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({ ...form, role: "client" })}
                    className={`rounded-2xl border p-5 transition-all ${
                      form.role === "client"
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}>
                    <User
                      size={24}
                      className={`mx-auto mb-3 ${
                        form.role === "client"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />
                    <h3 className="font-semibold text-white">Client</h3>
                    <p className="mt-2 text-xs text-slate-400">
                      Hire talented freelancers
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({ ...form, role: "freelancer" })}
                    className={`rounded-2xl border p-5 transition-all ${
                      form.role === "freelancer"
                        ? "border-cyan-500 bg-cyan-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}>
                    <Briefcase
                      size={24}
                      className={`mx-auto mb-3 ${
                        form.role === "freelancer"
                          ? "text-cyan-400"
                          : "text-slate-400"
                      }`}
                    />
                    <h3 className="font-semibold text-white">Freelancer</h3>
                    <p className="mt-2 text-xs text-slate-400">
                      Find freelance work
                    </p>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password - Login Only */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition">
                    Remember Me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition">
                  Forgot Password?
                </Link>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <XCircle
                    size={20}
                    className="mt-0.5 text-red-400 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-red-400">
                      Authentication Failed
                    </h4>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={
                loading || (!isLogin && form.password !== confirmPassword)
              }
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 font-semibold text-white shadow-xl transition hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Continue" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-widest text-slate-500">
                or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social Login */}
            <div className="grid gap-3">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 py-3 text-white transition hover:bg-white/10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#fff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#fff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 py-3 text-white transition hover:bg-white/10 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.399s2.04.132 3 .399c2.292-1.552 3.3-1.23 3.3-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.694.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 text-center">
              <p className="text-sm text-slate-400">
                By continuing you agree to our
                <Link
                  to="/terms"
                  className="text-emerald-400 hover:text-emerald-300 mx-1 transition">
                  Terms
                </Link>
                and
                <Link
                  to="/privacy"
                  className="text-emerald-400 hover:text-emerald-300 mx-1 transition">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
