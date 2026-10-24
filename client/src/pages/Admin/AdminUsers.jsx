// src/pages/Admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";
import toast from "react-hot-toast";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) fetchUsers();
      else toast.error("Failed to update user status");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isActive ? "✅" : "❌"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => toggleStatus(u._id)}
                    className="bg-yellow-400 px-2 py-1 rounded text-xs"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
