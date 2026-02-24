import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyCampaign = {
  name: "",
  type: "single",
  channel: "sms",
  scheduleAt: "",
  content: "",
  subject: "",
  steps: [{ dayOffset: 0, content: "" }],
  leadIds: [],
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(emptyCampaign);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const [campaignData, leadData] = await Promise.all([api.campaigns(), api.leads()]);
    setCampaigns(campaignData);
    setLeads(leadData);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const toggleLead = (id) => {
    setForm((prev) => ({
      ...prev,
      leadIds: prev.leadIds.includes(id) ? prev.leadIds.filter((x) => x !== id) : [...prev.leadIds, id],
    }));
  };

  const addStep = () => {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, { dayOffset: 1, content: "" }] }));
  };

  const updateStep = (index, key, value) => {
    const next = [...form.steps];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, steps: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!form.name || form.leadIds.length === 0) {
        setError("Name and leads are required.");
        alert("Name and leads are required.");
        return;
      }
      const payload = {
        ...form,
        scheduleAt: form.scheduleAt ? new Date(form.scheduleAt).toISOString() : null,
      };
      await api.createCampaign(payload);
      setSuccess("Campaign created.");
      alert("Campaign created.");
      setForm(emptyCampaign);
      await loadData();
    } catch (err) {
      setError(err.message || "Create failed");
      alert(err.message || "Create failed");
    }
  };

  const cancelCampaign = async (id) => {
    if (!confirm("Cancel this campaign?")) return;
    await api.cancelCampaign(id);
    await loadData();
  };

  const leadList = useMemo(() => {
    if (form.channel === "email") return leads.filter((l) => l.email);
    return leads.filter((l) => l.phone);
  }, [leads, form.channel]);

  return (
    <Layout title="Campaigns & Drip">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">New Campaign</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="single">Single</option>
                <option value="drip">Drip</option>
              </select>
            </label>
            <label>
              Channel
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label>
              Schedule At
              <input type="datetime-local" value={form.scheduleAt} onChange={(e) => setForm({ ...form, scheduleAt: e.target.value })} />
            </label>
            {form.channel === "email" && (
              <label>
                Subject
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </label>
            )}
            {form.type === "single" ? (
              <label>
                Content
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
              </label>
            ) : (
              <div className="form">
                {form.steps.map((step, index) => (
                  <div key={index} className="card subtle">
                    <label>
                      Day Offset
                      <input type="number" value={step.dayOffset} onChange={(e) => updateStep(index, "dayOffset", Number(e.target.value))} />
                    </label>
                    <label>
                      Content
                      <textarea value={step.content} onChange={(e) => updateStep(index, "content", e.target.value)} rows={3} />
                    </label>
                  </div>
                ))}
                <button className="btn ghost" type="button" onClick={addStep}>
                  Add Step
                </button>
              </div>
            )}
            <label>
              Select Leads
              <div className="list">
                {leadList.map((lead) => (
                  <div key={lead._id} className="list-row">
                    <div>
                      <div className="list-title">{lead.fullName}</div>
                      <div className="muted">{lead.phone}</div>
                    </div>
                    <input type="checkbox" checked={form.leadIds.includes(lead._id)} onChange={() => toggleLead(lead._id)} />
                  </div>
                ))}
              </div>
            </label>
            <button className="btn primary" type="submit">
              Create Campaign
            </button>
          </form>
        </div>
        <div className="card">
          <div className="card-title">Campaigns</div>
          <div className="table five">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Type</span>
              <span>Channel</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {campaigns.map((c) => (
              <div key={c._id} className="table-row">
                <span>{c.name}</span>
                <span>{c.type}</span>
                <span>{c.channel}</span>
                <span>{c.status}</span>
                <span className="actions">
                  <button className="link danger" onClick={() => cancelCampaign(c._id)}>Cancel</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Campaigns;
