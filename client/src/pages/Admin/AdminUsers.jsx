// src/pages/Admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../../api/config";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/admin/users`, {
      credentials: "include",
    });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    await fetch(`${API_URL}/admin/users/${id}/toggle`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
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
              <tr key={u._id} className="border-t hover:bg-slate-50">
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
