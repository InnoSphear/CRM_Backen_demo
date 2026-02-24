import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyRule = {
  name: "",
  trigger: "lead.created",
  active: true,
  condition: {
    stage: "",
    source: "",
    status: "",
    counselor: "",
    desiredProgram: "",
    targetCollege: "",
  },
  action: {
    type: "createActivity",
    activityType: "task",
    descriptionTemplate: "",
    dueInDays: 2,
    stage: "",
    status: "",
  },
};

const Automations = () => {
  const [rules, setRules] = useState([]);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState(emptyRule);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [counselors, setCounselors] = useState([]);

  const loadData = async () => {
    const [rulesData, stageData, userData] = await Promise.all([
      api.automations(),
      api.stages(),
      api.users(),
    ]);
    setRules(rulesData);
    setStages(stageData);
    setCounselors(userData.filter((u) => u.role === "counselor"));
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      condition: form.condition,
      action: form.action,
    };
    try {
      if (editingId) await api.updateAutomation(editingId, payload);
      else await api.createAutomation(payload);
      setForm(emptyRule);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const startEdit = (rule) => {
    setEditingId(rule._id);
    setForm({
      name: rule.name,
      trigger: rule.trigger,
      active: rule.active,
      condition: {
        stage: rule.condition?.stage?._id || "",
        source: rule.condition?.source || "",
        status: rule.condition?.status || "",
        counselor: rule.condition?.counselor?._id || "",
        desiredProgram: rule.condition?.desiredProgram || "",
        targetCollege: rule.condition?.targetCollege || "",
      },
      action: {
        type: rule.action?.type || "createActivity",
        activityType: rule.action?.activityType || "task",
        descriptionTemplate: rule.action?.descriptionTemplate || "",
        dueInDays: rule.action?.dueInDays ?? 2,
        stage: rule.action?.stage?._id || "",
        status: rule.action?.status || "",
      },
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this automation?")) return;
    await api.deleteAutomation(id);
    await loadData();
  };

  return (
    <Layout title="Automation Workflows">
      {error && <div className="error">{error}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit Rule" : "New Automation"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Trigger
              <select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
                <option value="lead.created">Lead Created</option>
                <option value="lead.stageChanged">Stage Changed</option>
                <option value="lead.updated">Lead Updated</option>
              </select>
            </label>
            <div className="subsection">Conditions</div>
            <label>
              Stage
              <select
                value={form.condition.stage}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, stage: e.target.value } })}
              >
                <option value="">Any</option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source
              <input
                value={form.condition.source}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, source: e.target.value } })}
                placeholder="e.g. Facebook Ads"
              />
            </label>
            <label>
              Status
              <select
                value={form.condition.status}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, status: e.target.value } })}
              >
                <option value="">Any</option>
                <option value="Open">Open</option>
                <option value="Closed - Won">Closed - Won</option>
                <option value="Closed - Lost">Closed - Lost</option>
              </select>
            </label>
            <label>
              Counselor
              <select
                value={form.condition.counselor}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, counselor: e.target.value } })}
              >
                <option value="">Any</option>
                {counselors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Desired Program
              <input
                value={form.condition.desiredProgram}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, desiredProgram: e.target.value } })}
              />
            </label>
            <label>
              Target College
              <input
                value={form.condition.targetCollege}
                onChange={(e) => setForm({ ...form, condition: { ...form.condition, targetCollege: e.target.value } })}
              />
            </label>

            <div className="subsection">Action</div>
            <label>
              Action Type
              <select
                value={form.action.type}
                onChange={(e) => setForm({ ...form, action: { ...form.action, type: e.target.value } })}
              >
                <option value="createActivity">Create Activity</option>
                <option value="updateStage">Update Stage</option>
                <option value="updateStatus">Update Status</option>
              </select>
            </label>
            {form.action.type === "createActivity" && (
              <>
                <label>
                  Activity Type
                  <select
                    value={form.action.activityType}
                    onChange={(e) => setForm({ ...form, action: { ...form.action, activityType: e.target.value } })}
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                  </select>
                </label>
                <label>
                  Description Template
                  <textarea
                    value={form.action.descriptionTemplate}
                    onChange={(e) =>
                      setForm({ ...form, action: { ...form.action, descriptionTemplate: e.target.value } })
                    }
                    required
                  />
                </label>
                <label>
                  Due in Days
                  <input
                    type="number"
                    value={form.action.dueInDays}
                    onChange={(e) => setForm({ ...form, action: { ...form.action, dueInDays: Number(e.target.value) } })}
                  />
                </label>
              </>
            )}
            {form.action.type === "updateStage" && (
              <label>
                New Stage
                <select
                  value={form.action.stage}
                  onChange={(e) => setForm({ ...form, action: { ...form.action, stage: e.target.value } })}
                >
                  <option value="">Select stage</option>
                  {stages.map((stage) => (
                    <option key={stage._id} value={stage._id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {form.action.type === "updateStatus" && (
              <label>
                New Status
                <select
                  value={form.action.status}
                  onChange={(e) => setForm({ ...form, action: { ...form.action, status: e.target.value } })}
                >
                  <option value="">Select status</option>
                  <option value="Open">Open</option>
                  <option value="Closed - Won">Closed - Won</option>
                  <option value="Closed - Lost">Closed - Lost</option>
                </select>
              </label>
            )}
            <label>
              Active
              <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update Rule" : "Create Rule"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyRule); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Active Rules</div>
          <div className="table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Trigger</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {rules.map((rule) => (
              <div key={rule._id} className="table-row">
                <span>{rule.name}</span>
                <span>{rule.trigger}</span>
                <span>{rule.active ? "Active" : "Inactive"}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(rule)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(rule._id)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Automations;
