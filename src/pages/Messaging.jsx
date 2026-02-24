import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import Layout from "../components/Layout";
import { api } from "../api";

const Messaging = () => {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState([]);
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("sms");
  const [subject, setSubject] = useState("");
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const [leadData, messageData, templateData] = await Promise.all([
      api.leads(),
      api.messages(),
      api.templates(),
    ]);
    setLeads(leadData);
    setLogs(messageData);
    setTemplates(templateData);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000");
    socket.on("message:status", (log) => {
      setLogs((prev) => [log, ...prev.filter((item) => item._id !== log._id)]);
    });
    return () => socket.disconnect();
  }, []);


  const toggleLead = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const eligibleLeads = useMemo(() => {
    if (channel === "email") return leads.filter((lead) => lead.email);
    return leads.filter((lead) => lead.phone);
  }, [leads, channel]);

  const applyTemplate = (id) => {
    setTemplateId(id);
    const template = templates.find((t) => t._id === id);
    if (template) {
      setContent(template.content);
      setChannel(template.channel || "sms");
    }
  };

  const handleSend = async () => {
    setError("");
    setSuccess("");
    if (!content || selected.length === 0) {
      setError("Select leads and write a message.");
      alert("Select leads and write a message.");
      return;
    }
    try {
      await api.sendMessages({ leadIds: selected, content, channel, subject, templateId });
      setSuccess("Messages queued successfully.");
      alert("Messages queued successfully.");
      setContent("");
      setSelected([]);
      await loadData();
    } catch (err) {
      setError(err.message || "Send failed");
      alert(err.message || "Send failed");
    }
  };

  return (
    <Layout title="Messaging">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">Bulk Message</div>
          <div className="form">
            <label>
              Template
              <select value={templateId} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">Select template</option>
                {templates.filter((t) => t.channel === channel).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Channel
              <select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value);
                  setTemplateId("");
                }}
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            {channel === "email" && (
              <label>
                Subject
                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </label>
            )}
            <label>
              Content
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
            </label>
            <button className="btn primary" onClick={handleSend}>
              Send to Selected
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Select Recipients</div>
          <div className="list">
            {eligibleLeads.map((lead) => (
              <div key={lead._id} className="list-row">
                <div>
                  <div className="list-title">{lead.fullName}</div>
                  <div className="muted">{lead.phone || "No phone"}</div>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(lead._id)}
                  onChange={() => toggleLead(lead._id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Message Logs</div>
          <div className="table five">
            <div className="table-row table-head">
              <span>Lead</span>
              <span>To</span>
              <span>Status</span>
              <span>Channel</span>
              <span>Opens</span>
            </div>
            {logs.map((log) => (
              <div key={log._id} className="table-row">
                <span>{log.lead?.fullName}</span>
                <span>{log.to}</span>
                <span>{log.status}</span>
                <span>{log.channel}</span>
                <span>{log.openCount || 0} / {log.clickCount || 0}</span>
              </div>
            ))}
          </div>
      </div>
    </Layout>
  );
};

export default Messaging;
