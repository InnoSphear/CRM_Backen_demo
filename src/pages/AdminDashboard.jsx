import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const AdminDashboard = () => {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");
  const [busyTenant, setBusyTenant] = useState("");

  useEffect(() => {
    api
      .adminTenants()
      .then(setTenants)
      .catch((err) => setError(err.message || "Failed to load tenants"));
  }, []);

  const summary = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.status === "active").length;
    const suspended = tenants.filter((t) => t.status === "suspended").length;
    const activeSubs = tenants.filter((t) => t.subscription?.status === "active").length;
    const trialing = tenants.filter((t) => t.subscription?.status === "trialing").length;
    const pastDue = tenants.filter((t) => t.subscription?.status === "past_due").length;
    return { total, active, suspended, activeSubs, trialing, pastDue };
  }, [tenants]);

  return (
    <Layout title="Super Admin Dashboard">
      {error && <div className="error">{error}</div>}
      <div className="grid stats">
        <div className="card stat-card">
          <div className="stat-label">Total Tenants</div>
          <div className="stat-value">{summary.total}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Active Tenants</div>
          <div className="stat-value">{summary.active}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Suspended Tenants</div>
          <div className="stat-value">{summary.suspended}</div>
        </div>
      </div>
      <div className="grid stats">
        <div className="card stat-card">
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-value">{summary.activeSubs}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Trialing</div>
          <div className="stat-value">{summary.trialing}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Past Due</div>
          <div className="stat-value">{summary.pastDue}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Tenants & Subscriptions</div>
        <div className="table five">
          <div className="table-row table-head">
            <span>Tenant</span>
            <span>Slug</span>
            <span>Status</span>
            <span>Plan</span>
            <span>Subscription</span>
          </div>
          {tenants.map((tenant) => (
            <div key={tenant._id} className="table-row">
              <span>{tenant.name}</span>
              <span>{tenant.slug}</span>
              <span>{tenant.status || "active"}</span>
              <span>{tenant.plan || "-"}</span>
              <div className="row space">
                <span>{tenant.subscription?.status || "-"}</span>
                <div className="row">
                  <button
                    className="btn ghost"
                    disabled={busyTenant === tenant._id}
                    onClick={async () => {
                      try {
                        setBusyTenant(tenant._id);
                        const res = await api.adminBillingSession({
                          tenantId: tenant._id,
                          plan: tenant.plan || "starter",
                        });
                        if (res?.url) window.location.href = res.url;
                      } catch (err) {
                        setError(err.message || "Billing session failed");
                      } finally {
                        setBusyTenant("");
                      }
                    }}
                  >
                    {busyTenant === tenant._id ? "Opening..." : "Checkout"}
                  </button>
                  <button
                    className="btn ghost"
                    disabled={busyTenant === tenant._id}
                    onClick={async () => {
                      try {
                        setBusyTenant(tenant._id);
                        const res = await api.adminBillingPortal({ tenantId: tenant._id });
                        if (res?.url) window.location.href = res.url;
                      } catch (err) {
                        setError(err.message || "Portal session failed");
                      } finally {
                        setBusyTenant("");
                      }
                    }}
                  >
                    Portal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
