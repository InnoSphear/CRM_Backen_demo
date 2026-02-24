import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

  const emptyLead = {
    fullName: "",
    email: "",
    phone: "",
  source: "",
  desiredProgram: "",
  targetCollege: "",
  stage: "",
  counselor: "",
    status: "Open",
    consentSms: false,
    consentCall: false,
    consentEmail: false,
    notes: "",
  };

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [form, setForm] = useState(emptyLead);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("table");

  const loadData = async () => {
    const [leadData, stageData, userData] = await Promise.all([
      api.leads(),
      api.stages(),
      user?.role === "admin" ? api.users() : Promise.resolve([]),
    ]);
    setLeads(leadData);
    setStages(stageData);
    if (user?.role === "admin") setCounselors(userData.filter((u) => u.role === "counselor"));
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  useEffect(() => {
    if (!form.stage && stages.length) {
      setForm((prev) => ({ ...prev, stage: stages[0]._id }));
    }
  }, [stages]);

  useEffect(() => {
    if (user?.role === "admin" && !form.counselor && counselors.length) {
      setForm((prev) => ({ ...prev, counselor: counselors[0]._id }));
    }
  }, [counselors, user, form.counselor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateLead(editingId, form);
      } else {
        await api.createLead(form);
      }
      setForm(emptyLead);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const startEdit = (lead) => {
    setEditingId(lead._id);
    setForm({
      fullName: lead.fullName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "",
      desiredProgram: lead.desiredProgram || "",
      targetCollege: lead.targetCollege || "",
      stage: lead.stage?._id || "",
      counselor: lead.counselor?._id || "",
      status: lead.status || "Open",
      consentSms: lead.consentSms || false,
      consentCall: lead.consentCall || false,
      consentEmail: lead.consentEmail || false,
      notes: lead.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await api.deleteLead(id);
    await loadData();
  };

  const counselorOptions = useMemo(() => counselors, [counselors]);
  const leadsByStage = useMemo(() => {
    const map = new Map();
    stages.forEach((stage) => map.set(stage._id, []));
    leads.forEach((lead) => {
      const key = lead.stage?._id;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(lead);
    });
    return map;
  }, [leads, stages]);

  const handleDrop = async (e, stageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;
    try {
      await api.updateLead(leadId, { stage: stageId });
      await loadData();
    } catch (err) {
      setError(err.message || "Move failed");
    }
  };

  return (
    <Layout title="Leads">
      {error && <div className="error">{error}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit Lead" : "New Lead"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>
              Source
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </label>
            <label>
              Desired Program
              <input value={form.desiredProgram} onChange={(e) => setForm({ ...form, desiredProgram: e.target.value })} />
            </label>
            <label>
              Target College
              <input value={form.targetCollege} onChange={(e) => setForm({ ...form, targetCollege: e.target.value })} />
            </label>
            <label>
              Stage
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} required>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            {user?.role === "admin" && (
              <label>
                Counselor
                <select value={form.counselor} onChange={(e) => setForm({ ...form, counselor: e.target.value })} required>
                  <option value="">Select counselor</option>
                  {counselorOptions.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {user?.role === "admin" && counselorOptions.length === 0 && (
              <div className="error">Add at least one counselor to assign leads.</div>
            )}
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Open">Open</option>
                <option value="Closed - Won">Closed - Won</option>
                <option value="Closed - Lost">Closed - Lost</option>
              </select>
            </label>
            <label>
              SMS Consent
              <select value={form.consentSms ? "true" : "false"} onChange={(e) => setForm({ ...form, consentSms: e.target.value === "true" })}>
                <option value="false">Not Consented</option>
                <option value="true">Consented</option>
              </select>
            </label>
            <label>
              Call Consent
              <select value={form.consentCall ? "true" : "false"} onChange={(e) => setForm({ ...form, consentCall: e.target.value === "true" })}>
                <option value="false">Not Consented</option>
                <option value="true">Consented</option>
              </select>
            </label>
            <label>
              Email Consent
              <select value={form.consentEmail ? "true" : "false"} onChange={(e) => setForm({ ...form, consentEmail: e.target.value === "true" })}>
                <option value="false">Not Consented</option>
                <option value="true">Consented</option>
              </select>
            </label>
            <label>
              Notes
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update Lead" : "Create Lead"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyLead); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title row space">
            <span>Lead Pipeline</span>
            <div className="toggle">
              <button className={`chip ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>
                Table
              </button>
              <button className={`chip ${view === "kanban" ? "active" : ""}`} onClick={() => setView("kanban")}>
                Kanban
              </button>
            </div>
          </div>
          {view === "table" ? (
            <div className="table">
              <div className="table-row table-head">
                <span>Name</span>
                <span>Stage</span>
                <span>Counselor</span>
                <span>Actions</span>
              </div>
              {leads.map((lead) => (
                <div key={lead._id} className="table-row">
                  <span>{lead.fullName}</span>
                  <span>{lead.stage?.name}</span>
                  <span>{lead.counselor?.name}</span>
                  <span className="actions">
                    <button className="link" onClick={() => startEdit(lead)}>Edit</button>
                    {user?.role === "admin" && (
                      <button className="link danger" onClick={() => handleDelete(lead._id)}>Delete</button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="kanban">
              {stages.map((stage) => (
                <div
                  key={stage._id}
                  className="kanban-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage._id)}
                >
                  <div className="kanban-head">
                    <span>{stage.name}</span>
                    <span className="pill">{leadsByStage.get(stage._id)?.length || 0}</span>
                  </div>
                  <div className="kanban-body">
                    {(leadsByStage.get(stage._id) || []).map((lead) => (
                      <div
                        key={lead._id}
                        className="kanban-card"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", lead._id)}
                      >
                        <div className="kanban-title">{lead.fullName}</div>
                        <div className="kanban-meta">{lead.counselor?.name || "-"}</div>
                        <div className="kanban-actions">
                          <button className="link" onClick={() => startEdit(lead)}>Edit</button>
                          {user?.role === "admin" && (
                            <button className="link danger" onClick={() => handleDelete(lead._id)}>Delete</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leads;
