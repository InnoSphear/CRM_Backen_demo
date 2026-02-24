import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyForm = { name: "", email: "", phone: "", password: "", role: "counselor", active: true };

const Counselors = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    const data = await api.users();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!form.name || !form.email) {
        setError("Name and email are required.");
        alert("Name and email are required.");
        return;
      }
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.updateUser(editingId, payload);
        setSuccess("User updated successfully.");
        alert("User updated successfully.");
      } else {
        if (!form.password) {
          setError("Password is required for new counselors.");
          alert("Password is required for new counselors.");
          return;
        }
        await api.createUser(form);
        setSuccess("User created successfully.");
        alert("User created successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Save failed");
      alert(err.message || "Save failed");
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      active: user.active,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.deleteUser(id);
    await loadUsers();
  };

  return (
    <Layout title="Counselors">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit User" : "Add Counselor"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+14155552671" />
            </label>
            <label>
              Password
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type="password"
                required={!editingId}
                placeholder={editingId ? "Leave blank to keep unchanged" : "Required"}
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="counselor">Counselor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Active
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update User" : "Create User"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="card">
          <div className="card-title">Team Directory</div>
          <div className="table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {users.map((user) => (
              <div key={user._id} className="table-row">
                <span>{user.name}</span>
                <span className="pill">{user.role}</span>
                <span>{user.active ? "Active" : "Inactive"}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(user)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(user._id)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Counselors;
