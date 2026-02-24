import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyBranding = (branding) => {
    if (!branding || typeof document === "undefined") return;
    const root = document.documentElement;
    if (branding.primaryColor) root.style.setProperty("--brand-primary", branding.primaryColor);
    if (branding.secondaryColor) root.style.setProperty("--brand-secondary", branding.secondaryColor);
    if (branding.primaryColor) root.style.setProperty("--accent", branding.primaryColor);
    if (branding.secondaryColor) root.style.setProperty("--accent-dark", branding.secondaryColor);
  };

  const bootstrap = async () => {
    try {
      const token = localStorage.getItem("crm_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const me = await api.me();
      setUser(me);
      if (me?.role !== "super_admin") {
        try {
          const tenantData = await api.tenantMe();
          setTenant(tenantData);
          applyBranding(tenantData.branding || {});
        } catch (err) {
          setTenant(null);
        }
      } else {
        setTenant(null);
      }
    } catch (error) {
      localStorage.removeItem("crm_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("crm_token", data.token);
    if (data.tenant?.id) {
      localStorage.setItem("crm_tenant_id", data.tenant.id);
    } else {
      localStorage.removeItem("crm_tenant_id");
    }
    if (data.tenant?.slug) {
      localStorage.setItem("crm_tenant_slug", data.tenant.slug);
    } else {
      localStorage.removeItem("crm_tenant_slug");
    }
    setUser(data.user);
    if (data.tenant) {
      setTenant(data.tenant);
      applyBranding(data.tenant.branding || {});
    } else {
      setTenant(null);
      if (data.user?.role === "super_admin") {
        const root = document.documentElement;
        root.style.setProperty("--brand-primary", "#0f172a");
        root.style.setProperty("--brand-secondary", "#2563eb");
        root.style.setProperty("--accent", "#2563eb");
        root.style.setProperty("--accent-dark", "#1e3a8a");
      }
    }
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_tenant_id");
    localStorage.removeItem("crm_tenant_slug");
    setUser(null);
    setTenant(null);
  };

  const value = useMemo(
    () => ({ user, setUser, tenant, setTenant, login, logout, loading, applyBranding }),
    [user, tenant, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
};
