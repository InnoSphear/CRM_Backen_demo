import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const TenantBranding = () => {
  const { tenant, setTenant, applyBranding } = useAuth();
  const [branding, setBranding] = useState({
    logoUrl: "",
    primaryColor: "",
    secondaryColor: "",
    theme: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await api.tenantMe();
      setBranding({
        logoUrl: data.branding?.logoUrl || "",
        primaryColor: data.branding?.primaryColor || "",
        secondaryColor: data.branding?.secondaryColor || "",
        theme: data.branding?.theme || "",
      });
      setTenant(data);
      applyBranding(data.branding || {});
    };
    load().catch((err) => setError(err.message || "Failed to load branding"));
  }, [applyBranding, setTenant]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.updateTenantBranding({ branding });
      setTenant(updated);
      applyBranding(updated.branding || {});
      setSuccess("Branding updated.");
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout title="Branding">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">Branding Settings</div>
          <form className="form" onSubmit={save}>
            <label>
              Logo URL
              <input
                value={branding.logoUrl}
                onChange={(e) => setBranding((prev) => ({ ...prev, logoUrl: e.target.value }))}
              />
            </label>
            <div className="row">
              <label className="grow">
                Primary Color
                <input
                  value={branding.primaryColor}
                  onChange={(e) => setBranding((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#0f766e"
                />
              </label>
              <label className="grow">
                Secondary Color
                <input
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#1d4ed8"
                />
              </label>
            </div>
            <label>
              Theme Label
              <input
                value={branding.theme}
                onChange={(e) => setBranding((prev) => ({ ...prev, theme: e.target.value }))}
              />
            </label>
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save Branding"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Preview</div>
          <div className="brand-preview">
            <div className="brand-preview-header">
              <div className="brand-preview-logo">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="logo" />
                ) : (
                  <span>{tenant?.name?.[0] || "C"}</span>
                )}
              </div>
              <div>
                <div className="brand-preview-title">{tenant?.name || "Your Business"}</div>
                <div className="brand-preview-sub">{branding.theme || "CRM Workspace"}</div>
              </div>
            </div>
            <div className="brand-preview-palette">
              <div className="brand-chip" style={{ background: branding.primaryColor || "var(--brand-primary)" }}>
                Primary
              </div>
              <div className="brand-chip" style={{ background: branding.secondaryColor || "var(--brand-secondary)" }}>
                Secondary
              </div>
            </div>
            <div className="brand-preview-note">
              This updates the sidebar and accent colors instantly for your team.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TenantBranding;
