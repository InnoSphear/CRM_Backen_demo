import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [superAdminMode, setSuperAdminMode] = useState(false);
  const [tenantPreview, setTenantPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("crm_tenant_slug") || "";
    const envSlug = import.meta.env.VITE_TENANT_SLUG || "";
    setTenantSlug(stored || envSlug || "");
  }, []);

  useEffect(() => {
    if (superAdminMode) {
      setTenantPreview(null);
      return;
    }
    const slug = tenantSlug.trim().toLowerCase();
    if (!slug) {
      setTenantPreview(null);
      return;
    }
    const timer = setTimeout(() => {
      api
        .tenantPublic(slug)
        .then((data) => {
          setTenantPreview(data);
          const root = document.documentElement;
          if (data?.branding?.primaryColor) root.style.setProperty("--brand-primary", data.branding.primaryColor);
          if (data?.branding?.secondaryColor) root.style.setProperty("--brand-secondary", data.branding.secondaryColor);
          if (data?.branding?.primaryColor) root.style.setProperty("--accent", data.branding.primaryColor);
          if (data?.branding?.secondaryColor) root.style.setProperty("--accent-dark", data.branding.secondaryColor);
        })
        .catch(() => setTenantPreview(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [tenantSlug, superAdminMode]);

  const headerTitle = useMemo(() => {
    if (superAdminMode) return "InnoSphear CRM";
    return tenantPreview?.name || "Counselor CRM";
  }, [superAdminMode, tenantPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (!superAdminMode && tenantSlug) {
        localStorage.setItem("crm_tenant_slug", tenantSlug.trim().toLowerCase());
      }
      if (superAdminMode) {
        localStorage.removeItem("crm_tenant_slug");
        localStorage.removeItem("crm_tenant_id");
      }
      const user = await login(email, password);
      setSuccess("Login successful. Redirecting to dashboard...");
      alert("Login successful.");
      if (user?.role === "super_admin") {
        navigate("/admin/tenants", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed");
      alert(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {superAdminMode && <div className="auth-logo">InnoSphear</div>}
        <div className="auth-title">{headerTitle}</div>
        <div className="auth-sub">
          {superAdminMode
            ? "Owner-level access for platform operations."
            : tenantPreview?.slug
            ? `${tenantPreview.slug}.crm · Sign in to your workspace`
            : "Secure access for admissions teams"}
        </div>
        <form onSubmit={handleSubmit} className="form">
          <label className="toggle">
            <input
              type="checkbox"
              checked={superAdminMode}
              onChange={(e) => setSuperAdminMode(e.target.checked)}
            />
            Login as Super Admin
          </label>
          {!superAdminMode && (
            <label>
              Tenant (Business)
              <input
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                type="text"
                placeholder="your-business-slug"
                required
              />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {!superAdminMode && (
            <div className="hint">
              Use the tenant slug provided by the Super Admin (example: <strong>default</strong>).
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => alert("Sign up is managed by the admin. Please contact the administrator.")}
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
