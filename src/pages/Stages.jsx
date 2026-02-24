import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyStage = { name: "", order: 1, color: "#2D6A4F", isClosed: false };

const Stages = () => {
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState(emptyStage);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadStages = async () => {
    const data = await api.stages();
    setStages(data);
  };

  useEffect(() => {
    loadStages().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.updateStage(editingId, form);
      else await api.createStage(form);
      setForm(emptyStage);
      setEditingId(null);
      await loadStages();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const startEdit = (stage) => {
    setEditingId(stage._id);
    setForm({
      name: stage.name,
      order: stage.order,
      color: stage.color,
      isClosed: stage.isClosed,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this stage?")) return;
    await api.deleteStage(id);
    await loadStages();
  };

  return (
    <Layout title="Pipeline Stages">
      {error && <div className="error">{error}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit Stage" : "New Stage"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Order
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </label>
            <label>
              Color
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </label>
            <label>
              Closed Stage
              <select value={form.isClosed ? "true" : "false"} onChange={(e) => setForm({ ...form, isClosed: e.target.value === "true" })}>
                <option value="false">Open</option>
                <option value="true">Closed</option>
              </select>
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update Stage" : "Create Stage"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyStage); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Stage List</div>
          <div className="table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Order</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {stages.map((stage) => (
              <div key={stage._id} className="table-row">
                <span>{stage.name}</span>
                <span>{stage.order}</span>
                <span>{stage.isClosed ? "Closed" : "Open"}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(stage)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(stage._id)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Stages;
