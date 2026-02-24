const API_URL = import.meta.env.VITE_API_URL || "https://crm-frontend-demo.onrender.com/api";

const getToken = () => localStorage.getItem("crm_token");
const getTenantSlug = () => {
  const stored = localStorage.getItem("crm_tenant_slug");
  if (stored) return stored;
  const envSlug = import.meta.env.VITE_TENANT_SLUG;
  if (envSlug) return envSlug;
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  const parts = host.split(".");
  if (parts.length < 3) return null;
  return parts[0];
};

export const getTenantHeaders = () => {
  const headers = {};
  const tenantId = localStorage.getItem("crm_tenant_id");
  const tenantSlug = getTenantSlug();
  if (tenantId) headers["X-Tenant-ID"] = tenantId;
  if (tenantSlug) headers["X-Tenant-Slug"] = tenantSlug;
  return headers;
};

const request = async (path, { method = "GET", body, token } = {}) => {
  const headers = { "Content-Type": "application/json", ...getTenantHeaders() };
  const authToken = token || getToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/users/me"),
  users: () => request("/users"),
  createUser: (payload) => request("/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: "PUT", body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
  stages: () => request("/stages"),
  createStage: (payload) => request("/stages", { method: "POST", body: payload }),
  updateStage: (id, payload) => request(`/stages/${id}`, { method: "PUT", body: payload }),
  deleteStage: (id) => request(`/stages/${id}`, { method: "DELETE" }),
  leads: (query = "") => request(`/leads${query}`),
  createLead: (payload) => request("/leads", { method: "POST", body: payload }),
  updateLead: (id, payload) => request(`/leads/${id}`, { method: "PUT", body: payload }),
  deleteLead: (id) => request(`/leads/${id}`, { method: "DELETE" }),
  activities: (query = "") => request(`/activities${query}`),
  createActivity: (payload) => request("/activities", { method: "POST", body: payload }),
  updateActivity: (id, payload) => request(`/activities/${id}`, { method: "PUT", body: payload }),
  deleteActivity: (id) => request(`/activities/${id}`, { method: "DELETE" }),
  automations: () => request("/automations"),
  createAutomation: (payload) => request("/automations", { method: "POST", body: payload }),
  updateAutomation: (id, payload) => request(`/automations/${id}`, { method: "PUT", body: payload }),
  deleteAutomation: (id) => request(`/automations/${id}`, { method: "DELETE" }),
  messages: () => request("/messages"),
  sendMessages: (payload) => request("/messages/send", { method: "POST", body: payload }),
  calls: () => request("/calls"),
  initiateCalls: (payload) => request("/calls/initiate", { method: "POST", body: payload }),
  clickCall: (payload) => request("/calls/click", { method: "POST", body: payload }),
  templates: () => request("/templates"),
  createTemplate: (payload) => request("/templates", { method: "POST", body: payload }),
  updateTemplate: (id, payload) => request(`/templates/${id}`, { method: "PUT", body: payload }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: "DELETE" }),
  campaigns: () => request("/campaigns"),
  createCampaign: (payload) => request("/campaigns", { method: "POST", body: payload }),
  updateCampaign: (id, payload) => request(`/campaigns/${id}`, { method: "PUT", body: payload }),
  cancelCampaign: (id) => request(`/campaigns/${id}/cancel`, { method: "POST" }),
  dashboard: () => request("/reports/dashboard"),
  customReport: (query = "") => request(`/reports/custom${query}`),
  adminTenants: () => request("/admin/tenants"),
  createTenant: (payload) => request("/admin/tenants", { method: "POST", body: payload }),
  updateTenant: (id, payload) => request(`/admin/tenants/${id}`, { method: "PUT", body: payload }),
  tenantMe: () => request("/tenants/me"),
  updateTenantBranding: (payload) => request("/tenants/me/branding", { method: "PUT", body: payload }),
  tenantPublic: (slug) => request(`/tenants/public?slug=${encodeURIComponent(slug)}`),
  createBillingSession: (payload) => request("/billing/checkout", { method: "POST", body: payload }),
  adminBillingSession: (payload) => request("/billing/admin/checkout", { method: "POST", body: payload }),
  adminBillingPortal: (payload) => request("/billing/admin/portal", { method: "POST", body: payload }),
};
