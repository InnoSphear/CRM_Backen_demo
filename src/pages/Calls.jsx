import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import Layout from "../components/Layout";
import { api } from "../api";

const Calls = () => {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const [leadData, callData] = await Promise.all([api.leads(), api.calls()]);
    setLeads(leadData);
    setLogs(callData);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000");
    socket.on("call:status", (log) => {
      setLogs((prev) => [log, ...prev.filter((item) => item._id !== log._id)]);
    });
    return () => socket.disconnect();
  }, []);

  const toggleLead = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const eligibleLeads = useMemo(() => leads.filter((lead) => lead.phone), [leads]);

  const handleCall = async () => {
    setError("");
    setSuccess("");
    if (selected.length === 0) {
      setError("Select leads to call.");
      alert("Select leads to call.");
      return;
    }
    try {
      await api.initiateCalls({ leadIds: selected });
      setSuccess("Calls queued successfully.");
      alert("Calls queued successfully.");
      setSelected([]);
      await loadData();
    } catch (err) {
      setError(err.message || "Call failed");
      alert(err.message || "Call failed");
    }
  };

  const handleClickCall = async (leadId) => {
    setError("");
    setSuccess("");
    try {
      await api.clickCall({ leadId });
      setSuccess("Click-to-call initiated.");
      alert("Click-to-call initiated.");
      await loadData();
    } catch (err) {
      setError(err.message || "Click-to-call failed");
      alert(err.message || "Click-to-call failed");
    }
  };

  return (
    <Layout title="Calling">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">Bulk Call</div>
          <div className="form">
            <div className="muted">
              Calls will be placed from the configured phone number and logged automatically.
            </div>
            <button className="btn primary" onClick={handleCall}>
              Start Calls
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
                <div className="row">
                  <button className="link" onClick={() => handleClickCall(lead._id)}>
                    Click-to-call
                  </button>
                  <input
                    type="checkbox"
                    checked={selected.includes(lead._id)}
                    onChange={() => toggleLead(lead._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
          <div className="card-title">Call Logs</div>
        <div className="table five">
          <div className="table-row table-head">
            <span>Lead</span>
            <span>To</span>
            <span>Status</span>
            <span>Recording</span>
            <span>Mode</span>
          </div>
          {logs.map((log) => (
            <div key={log._id} className="table-row">
              <span>{log.lead?.fullName}</span>
              <span>{log.to}</span>
              <span>{log.status}</span>
              <span>
                {log.recordingUrl ? (
                  <a className="link" href={log.recordingUrl} target="_blank" rel="noreferrer">
                    Play
                  </a>
                ) : (
                  "-"
                )}
              </span>
              <span>{log.mode || "bulk"}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Calls;
