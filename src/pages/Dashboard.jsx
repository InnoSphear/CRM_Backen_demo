import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { api } from "../api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load"));
  }, []);

  return (
    <Layout title="Dashboard">
      {error && <div className="error">{error}</div>}
      {!data ? (
        <div className="card">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid stats">
            <StatCard label="Total Leads" value={data.totals.totalLeads} accent="#0F766E" />
            <StatCard label="Open Leads" value={data.totals.openLeads} accent="#1D4ED8" />
            <StatCard label="Closed Leads" value={data.totals.closedLeads} accent="#B91C1C" />
          </div>

          <div className="grid two">
            <div className="card">
              <div className="card-title">Pipeline Distribution</div>
              <div className="list">
                {data.pipeline.map((item) => (
                  <div key={item.stageId} className="list-row">
                    <div className="list-title">{item.stageName}</div>
                    <div className="pill">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Counselor Performance</div>
              <div className="table">
                <div className="table-row table-head">
                  <span>Counselor</span>
                  <span>Leads</span>
                  <span>Activities</span>
                </div>
                {data.performance.map((row) => (
                  <div key={row.counselorId} className="table-row">
                    <span>{row.counselorName}</span>
                    <span>{row.leads}</span>
                    <span>{row.activities}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
