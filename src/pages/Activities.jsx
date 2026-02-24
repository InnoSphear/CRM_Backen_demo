import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyActivity = { lead: "", type: "call", description: "", dueAt: "", completed: false };

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(emptyActivity);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    const [activityData, leadData] = await Promise.all([api.activities(), api.leads()]);
    setActivities(activityData);
    setLeads(leadData);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  useEffect(() => {
    if (!form.lead && leads.length) setForm((prev) => ({ ...prev, lead: leads[0]._id }));
  }, [leads]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined };
    try {
      if (editingId) await api.updateActivity(editingId, payload);
      else await api.createActivity(payload);
      setForm(emptyActivity);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const startEdit = (activity) => {
    setEditingId(activity._id);
    setForm({
      lead: activity.lead?._id || "",
      type: activity.type,
      description: activity.description,
      dueAt: activity.dueAt ? activity.dueAt.slice(0, 10) : "",
      completed: activity.completed,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this activity?")) return;
    await api.deleteActivity(id);
    await loadData();
  };

  return (
    <Layout title="Activities">
      {error && <div className="error">{error}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit Activity" : "New Activity"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Lead
              <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} required>
                {leads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Note</option>
                <option value="task">Task</option>
              </select>
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <label>
              Due Date
              <input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
            </label>
            <label>
              Completed
              <select value={form.completed ? "true" : "false"} onChange={(e) => setForm({ ...form, completed: e.target.value === "true" })}>
                <option value="false">Pending</option>
                <option value="true">Done</option>
              </select>
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update Activity" : "Create Activity"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyActivity); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Activity Log</div>
          <div className="table">
            <div className="table-row table-head">
              <span>Lead</span>
              <span>Type</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {activities.map((activity) => (
              <div key={activity._id} className="table-row">
                <span>{activity.lead?.fullName}</span>
                <span>{activity.type}</span>
                <span>{activity.completed ? "Done" : "Pending"}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(activity)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(activity._id)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Activities;
