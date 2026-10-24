import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Lock,
  Camera,
  Edit3,
  Calendar,
  BadgeCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    role: "",
    createdAt: new Date().toISOString(),
    skills: [],
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(null);

  const [pwForm, setPwForm] = useState({ old: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setProfile({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          role: data.role || "",
          createdAt: data.createdAt,
          skills: data.skills || [],
        });

        const { data: reviews } = await api.get(`/reviews/${data._id}`);
        setReviewCount(reviews.length);
        if (reviews.length) {
          const avg =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };

    if (user) loadProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/users/profile", {
        name: profile.name,
        bio: profile.bio,
      });
      setUser(data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");

    if (pwForm.new.length < 8) {
      setPwMsg("Password must be at least 8 characters");
      return;
    }

    setPwSaving(true);
    try {
      await api.put("/users/change-password", {
        oldPassword: pwForm.old,
        newPassword: pwForm.new,
      });
      setPwMsg("Password updated successfully!");
      setPwForm({ old: "", new: "" });
    } catch (err) {
      setPwMsg(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-10 dark:bg-[#09090B]">
      {/* Background Blur Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
          className="absolute left-10 top-16 h-80 w-80 rounded-full bg-emerald-500/15 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
          }}
          className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[130px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-[150px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Manage your personal information, security, and professional
            profile.
          </p>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-3xl font-bold text-white">
                {profile.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-1.5 text-white shadow-lg hover:scale-105 transition-transform">
                <Camera size={16} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold dark:text-white">
                {profile.name}
              </h2>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <BadgeCheck size={16} className="text-emerald-500" />
                <span className="text-sm text-emerald-500">
                  Verified Account
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Rating",
              value: avgRating ? `${avgRating} ★` : "No ratings yet",
              icon: "⭐",
            },
            { label: "Reviews", value: String(reviewCount), icon: "💬" },
            {
              label: "Member Since",
              value: profile.createdAt
                ? new Date(profile.createdAt).getFullYear()
                : "-",
              icon: "📅",
            },
            { label: "Role", value: profile.role || "-", icon: "🧑‍💻" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-white/10 bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-2 text-2xl font-bold dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* About & Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid gap-6 lg:grid-cols-3">
          {/* About Card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-5 text-xl font-bold dark:text-white">About Me</h2>
            <p className="leading-8 text-zinc-600 dark:text-zinc-300">
              {profile.bio?.trim()
                ? profile.bio
                : "No bio added yet. Tell clients about yourself, your experience, and what makes you different from other freelancers."}
            </p>
          </motion.div>

          {/* Achievements */}
          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-5 text-xl font-bold dark:text-white">
              Achievements
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="text-emerald-500" />
                <span>Verified Account</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-blue-500" />
                <span>{profile.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-500" />
                <span>Joined {new Date(profile.createdAt).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-3">
                ⭐<span>Professional Freelancer</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -5 }}
          className="rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
          <h2 className="mb-6 text-xl font-bold dark:text-white">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {(profile.skills || []).length > 0 ? (
              profile.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.08,
                    y: -3,
                  }}
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-md">
                  {skill}
                </motion.div>
              ))
            ) : (
              <p className="text-zinc-500">No skills added yet.</p>
            )}
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">
                Edit Profile
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Update your personal information
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <Edit3 className="text-emerald-500" />
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSaveProfile}>
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-zinc-300">
                Bio
              </label>
              <textarea
                rows="3"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <motion.button
              type="submit"
              disabled={savingProfile}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/30 disabled:opacity-60">
              {savingProfile ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>
        </motion.div>

        {/* Security Section */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5 }}
          onSubmit={handleChangePassword}
          className="rounded-3xl border border-white/10 bg-white p-8 shadow-xl dark:bg-zinc-900">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">Security</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Update your password regularly to keep your account secure.
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <Lock className="text-red-500" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Old Password */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-zinc-300">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  value={pwForm.old}
                  onChange={(e) =>
                    setPwForm({
                      ...pwForm,
                      old: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-12 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium dark:text-zinc-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={pwForm.new}
                  onChange={(e) =>
                    setPwForm({
                      ...pwForm,
                      new: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-12 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {pwForm.new.length >= 8 ? (
                  <CheckCircle2 className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
                )}
                Minimum 8 characters
              </div>
              <div className="flex items-center gap-2 text-sm">
                {/[A-Z]/.test(pwForm.new) ? (
                  <CheckCircle2 className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
                )}
                One uppercase letter
              </div>
              <div className="flex items-center gap-2 text-sm">
                {/\d/.test(pwForm.new) ? (
                  <CheckCircle2 className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
                )}
                One number
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={pwSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-500/30 disabled:opacity-60">
              {pwSaving ? "Updating..." : "Update Password"}
            </motion.button>

            {pwMsg && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center text-green-600">
                {pwMsg}
              </motion.div>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default ProfilePage;
