// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { API_URL } from "../api/config";
import { useAuth } from "../context/AuthContext";
import { User, Mail, BookOpen, Shield, Lock } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", bio: "", skills: "" });
  const [message, setMessage] = useState("");
  const [pwForm, setPwForm] = useState({ old: "", new: "" });
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${API_URL}/users/profile`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          skills: data.skills?.join(", ") || "",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        bio: form.bio,
        skills: form.skills.split(",").map((s) => s.trim()),
      }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/users/change-password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPassword: pwForm.old,
        newPassword: pwForm.new,
      }),
    });
    const data = await res.json();
    setPwMsg(data.message || "Error");
    if (res.ok) setPwForm({ old: "", new: "" });
  };

  if (!profile) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile info card */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-2">
        <p className="flex items-center gap-2">
          <User size={18} /> {profile.name}
        </p>
        <p className="flex items-center gap-2">
          <Mail size={18} /> {profile.email}
        </p>
        <p className="flex items-center gap-2">
          <Shield size={18} /> Role: {profile.role}
        </p>
      </div>

      {/* Update profile form */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Skills (comma separated)"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
          Update Profile
        </button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </form>

      {/* Change password form */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white rounded-2xl shadow p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Old Password"
          value={pwForm.old}
          onChange={(e) => setPwForm({ ...pwForm, old: e.target.value })}
        />
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2"
          placeholder="New Password"
          value={pwForm.new}
          onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
        />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
          Change Password
        </button>
        {pwMsg && <p className="text-sm text-emerald-600">{pwMsg}</p>}
      </form>
    </div>
  );
};

export default ProfilePage;
