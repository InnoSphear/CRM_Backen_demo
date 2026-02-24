import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api, getTenantHeaders } from "../api";

const Reports = () => {
  const [stages, setStages] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", counselorId: "", stageId: "" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.stages(), api.users()])
      .then(([stageData, userData]) => {
        setStages(stageData);
        setCounselors(userData.filter((u) => u.role === "counselor"));
      })
      .catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const runReport = async () => {
    const params = new URLSearchParams();
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.counselorId) params.append("counselorId", filters.counselorId);
    if (filters.stageId) params.append("stageId", filters.stageId);
    const data = await api.customReport(`?${params.toString()}`);
    setReport(data);
  };

  const downloadReport = async (format) => {
    const params = new URLSearchParams();
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.counselorId) params.append("counselorId", filters.counselorId);
    if (filters.stageId) params.append("stageId", filters.stageId);
    params.append("format", format);

    try {
      const token = localStorage.getItem("crm_token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/export?${params.toString()}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...getTenantHeaders(),
          },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Export failed" }));
        throw new Error(err.message || "Export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `crm-report-${stamp}.${format === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Export failed");
    }
  };

  return (
    <Layout title="Custom Reports">
      {error && <div className="error">{error}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">Report Filters</div>
          <div className="form">
            <label>
              From
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </label>
            <label>
              To
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </label>
            <label>
              Counselor
              <select value={filters.counselorId} onChange={(e) => setFilters({ ...filters, counselorId: e.target.value })}>
                <option value="">All</option>
                {counselors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Stage
              <select value={filters.stageId} onChange={(e) => setFilters({ ...filters, stageId: e.target.value })}>
                <option value="">All</option>
                {stages.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn primary" onClick={runReport}>
              Run Report
            </button>
            <div className="row">
              <button className="btn secondary" onClick={() => downloadReport("csv")}>
                Export CSV
              </button>
              <button className="btn secondary" onClick={() => downloadReport("pdf")}>
                Export PDF
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Results</div>
          {!report ? (
            <div className="empty">Run a report to view results.</div>
          ) : (
            <>
              <div className="pill">Total: {report.count}</div>
              <div className="table">
                <div className="table-row table-head">
                  <span>Name</span>
                  <span>Stage</span>
                  <span>Counselor</span>
                </div>
                {report.leads.map((lead) => (
                  <div key={lead._id} className="table-row">
                    <span>{lead.fullName}</span>
                    <span>{lead.stage?.name}</span>
                    <span>{lead.counselor?.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
