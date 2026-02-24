import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyTenant = {
  id: "",
  name: "",
  slug: "",
  plan: "starter",
  status: "active",
  branding: {
    logoUrl: "",
    primaryColor: "",
    secondaryColor: "",
    theme: "",
  },
  settings: {
    smtp: {
      host: "",
      port: "",
      user: "",
      pass: "",
      from: "",
    },
    twilio: {
      accountSid: "",
      authToken: "",
      fromSms: "",
      fromWhatsApp: "",
      fromCall: "",
      twimlUrl: "",
      recordCalls: false,
      recordingCallbackUrl: "",
    },
    whatsapp: {
      businessToken: "",
      businessId: "",
    },
  },
  features: {
    campaigns: false,
    automations: false,
    messaging: true,
    calling: true,
    reports: true,
  },
  admin: {
    name: "",
    email: "",
    password: "",
  },
};

const normalizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const AdminTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState(emptyTenant);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEdit = useMemo(() => Boolean(form.id), [form.id]);

  const loadTenants = async () => {
    const data = await api.adminTenants();
    setTenants(data);
  };

  useEffect(() => {
    loadTenants().catch((err) => setError(err.message || "Failed to load tenants"));
  }, []);

  const resetForm = () => {
    setForm(emptyTenant);
    setError("");
    setSuccess("");
  };

  const selectTenant = (tenant) => {
    setForm({
      ...emptyTenant,
      id: tenant._id,
      name: tenant.name || "",
      slug: tenant.slug || "",
      plan: tenant.plan || "starter",
      status: tenant.status || "active",
      branding: {
        logoUrl: tenant.branding?.logoUrl || "",
        primaryColor: tenant.branding?.primaryColor || "",
        secondaryColor: tenant.branding?.secondaryColor || "",
        theme: tenant.branding?.theme || "",
      },
      settings: {
        smtp: {
          host: tenant.settings?.smtp?.host || "",
          port: tenant.settings?.smtp?.port || "",
          user: tenant.settings?.smtp?.user || "",
          pass: tenant.settings?.smtp?.pass || "",
          from: tenant.settings?.smtp?.from || "",
        },
        twilio: {
          accountSid: tenant.settings?.twilio?.accountSid || "",
          authToken: tenant.settings?.twilio?.authToken || "",
          fromSms: tenant.settings?.twilio?.fromSms || "",
          fromWhatsApp: tenant.settings?.twilio?.fromWhatsApp || "",
          fromCall: tenant.settings?.twilio?.fromCall || "",
          twimlUrl: tenant.settings?.twilio?.twimlUrl || "",
          recordCalls: Boolean(tenant.settings?.twilio?.recordCalls),
          recordingCallbackUrl: tenant.settings?.twilio?.recordingCallbackUrl || "",
        },
        whatsapp: {
          businessToken: tenant.settings?.whatsapp?.businessToken || "",
          businessId: tenant.settings?.whatsapp?.businessId || "",
        },
      },
      features: {
        campaigns: Boolean(tenant.features?.campaigns),
        automations: Boolean(tenant.features?.automations),
        messaging: tenant.features?.messaging !== false,
        calling: tenant.features?.calling !== false,
        reports: tenant.features?.reports !== false,
      },
      admin: { name: "", email: "", password: "" },
    });
    setSuccess("");
    setError("");
  };

  const handleChange = (path, value) => {
    setForm((prev) => {
      const updated = { ...prev };
      let cursor = updated;
      const keys = path.split(".");
      keys.slice(0, -1).forEach((key) => {
        cursor[key] = { ...cursor[key] };
        cursor = cursor[key];
      });
      cursor[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (!form.name || !form.slug) {
        throw new Error("Tenant name and slug are required");
      }
      if (!isEdit) {
        if (!form.admin.name || !form.admin.email || !form.admin.password) {
          throw new Error("Tenant admin name, email, and password are required");
        }
      }
      const payload = {
        name: form.name,
        slug: normalizeSlug(form.slug),
        plan: form.plan,
        status: form.status,
        branding: form.branding,
        settings: {
          smtp: {
            host: form.settings.smtp.host,
            port: form.settings.smtp.port ? Number(form.settings.smtp.port) : undefined,
            user: form.settings.smtp.user,
            pass: form.settings.smtp.pass,
            from: form.settings.smtp.from,
          },
          twilio: {
            accountSid: form.settings.twilio.accountSid,
            authToken: form.settings.twilio.authToken,
            fromSms: form.settings.twilio.fromSms,
            fromWhatsApp: form.settings.twilio.fromWhatsApp,
            fromCall: form.settings.twilio.fromCall,
            twimlUrl: form.settings.twilio.twimlUrl,
            recordCalls: Boolean(form.settings.twilio.recordCalls),
            recordingCallbackUrl: form.settings.twilio.recordingCallbackUrl,
          },
          whatsapp: {
            businessToken: form.settings.whatsapp.businessToken,
            businessId: form.settings.whatsapp.businessId,
          },
        },
        features: form.features,
      };

      if (isEdit) {
        await api.updateTenant(form.id, payload);
        setSuccess("Tenant updated.");
      } else {
        await api.createTenant({
          ...payload,
          adminName: form.admin.name,
          adminEmail: form.admin.email,
          adminPassword: form.admin.password,
        });
        setSuccess("Tenant created.");
        resetForm();
      }
      await loadTenants();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout title="Super Admin · Tenants">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="row space">
            <div className="card-title">Tenants</div>
            <button className="btn ghost" onClick={resetForm}>
              New Tenant
            </button>
          </div>
          <div className="list">
            {tenants.map((tenant) => (
              <button key={tenant._id} className="list-row" onClick={() => selectTenant(tenant)}>
                <div>
                  <div className="list-title">{tenant.name}</div>
                  <div className="muted">
                    {tenant.slug} · {tenant.plan || "starter"} · {tenant.status || "active"}
                  </div>
                </div>
                <span className="pill">{tenant.status || "active"}</span>
              </button>
            ))}
            {!tenants.length && <div className="empty">No tenants found.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-title">{isEdit ? "Update Tenant" : "Create Tenant"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <div className="section-title">Core</div>
            <label>
              Business Name
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </label>
            <label>
              Slug (subdomain)
              <input
                value={form.slug}
                onChange={(e) => handleChange("slug", normalizeSlug(e.target.value))}
                placeholder="example: acme"
                required
              />
            </label>
            <div className="row">
              <label className="grow">
                Plan
                <select value={form.plan} onChange={(e) => handleChange("plan", e.target.value)}>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
              <label className="grow">
                Status
                <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            </div>

            {!isEdit && (
              <>
                <div className="section-title">Tenant Admin</div>
                <label>
                  Admin Name
                  <input
                    value={form.admin.name}
                    onChange={(e) => handleChange("admin.name", e.target.value)}
                    required={!isEdit}
                  />
                </label>
                <label>
                  Admin Email
                  <input
                    value={form.admin.email}
                    onChange={(e) => handleChange("admin.email", e.target.value)}
                    type="email"
                    required={!isEdit}
                  />
                </label>
                <label>
                  Admin Password
                  <input
                    value={form.admin.password}
                    onChange={(e) => handleChange("admin.password", e.target.value)}
                    type="password"
                    required={!isEdit}
                  />
                </label>
              </>
            )}

            <div className="section-title">Branding</div>
            <label>
              Logo URL
              <input value={form.branding.logoUrl} onChange={(e) => handleChange("branding.logoUrl", e.target.value)} />
            </label>
            <div className="row">
              <label className="grow">
                Primary Color
                <input
                  value={form.branding.primaryColor}
                  onChange={(e) => handleChange("branding.primaryColor", e.target.value)}
                  placeholder="#0f766e"
                />
              </label>
              <label className="grow">
                Secondary Color
                <input
                  value={form.branding.secondaryColor}
                  onChange={(e) => handleChange("branding.secondaryColor", e.target.value)}
                  placeholder="#1d4ed8"
                />
              </label>
            </div>
            <label>
              Theme
              <input value={form.branding.theme} onChange={(e) => handleChange("branding.theme", e.target.value)} />
            </label>

            <div className="section-title">Features</div>
            <div className="row">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.features.campaigns}
                  onChange={(e) => handleChange("features.campaigns", e.target.checked)}
                />
                Campaigns
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.features.automations}
                  onChange={(e) => handleChange("features.automations", e.target.checked)}
                />
                Automations
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.features.messaging}
                  onChange={(e) => handleChange("features.messaging", e.target.checked)}
                />
                Messaging
              </label>
            </div>
            <div className="row">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.features.calling}
                  onChange={(e) => handleChange("features.calling", e.target.checked)}
                />
                Calling
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form.features.reports}
                  onChange={(e) => handleChange("features.reports", e.target.checked)}
                />
                Reports
              </label>
            </div>

            <div className="section-title">SMTP</div>
            <label>
              Host
              <input value={form.settings.smtp.host} onChange={(e) => handleChange("settings.smtp.host", e.target.value)} />
            </label>
            <div className="row">
              <label className="grow">
                Port
                <input
                  value={form.settings.smtp.port}
                  onChange={(e) => handleChange("settings.smtp.port", e.target.value)}
                  type="number"
                />
              </label>
              <label className="grow">
                User
                <input value={form.settings.smtp.user} onChange={(e) => handleChange("settings.smtp.user", e.target.value)} />
              </label>
            </div>
            <label>
              Password
              <input
                value={form.settings.smtp.pass}
                onChange={(e) => handleChange("settings.smtp.pass", e.target.value)}
                type="password"
              />
            </label>
            <label>
              From
              <input value={form.settings.smtp.from} onChange={(e) => handleChange("settings.smtp.from", e.target.value)} />
            </label>

            <div className="section-title">Twilio</div>
            <label>
              Account SID
              <input
                value={form.settings.twilio.accountSid}
                onChange={(e) => handleChange("settings.twilio.accountSid", e.target.value)}
              />
            </label>
            <label>
              Auth Token
              <input
                value={form.settings.twilio.authToken}
                onChange={(e) => handleChange("settings.twilio.authToken", e.target.value)}
                type="password"
              />
            </label>
            <div className="row">
              <label className="grow">
                From SMS
                <input
                  value={form.settings.twilio.fromSms}
                  onChange={(e) => handleChange("settings.twilio.fromSms", e.target.value)}
                />
              </label>
              <label className="grow">
                From WhatsApp
                <input
                  value={form.settings.twilio.fromWhatsApp}
                  onChange={(e) => handleChange("settings.twilio.fromWhatsApp", e.target.value)}
                />
              </label>
            </div>
            <label>
              From Call
              <input value={form.settings.twilio.fromCall} onChange={(e) => handleChange("settings.twilio.fromCall", e.target.value)} />
            </label>
            <label>
              TwiML URL
              <input value={form.settings.twilio.twimlUrl} onChange={(e) => handleChange("settings.twilio.twimlUrl", e.target.value)} />
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={form.settings.twilio.recordCalls}
                onChange={(e) => handleChange("settings.twilio.recordCalls", e.target.checked)}
              />
              Record Calls
            </label>
            <label>
              Recording Callback URL
              <input
                value={form.settings.twilio.recordingCallbackUrl}
                onChange={(e) => handleChange("settings.twilio.recordingCallbackUrl", e.target.value)}
              />
            </label>

            <div className="section-title">WhatsApp Business</div>
            <label>
              Business Token
              <input
                value={form.settings.whatsapp.businessToken}
                onChange={(e) => handleChange("settings.whatsapp.businessToken", e.target.value)}
                type="password"
              />
            </label>
            <label>
              Business ID
              <input
                value={form.settings.whatsapp.businessId}
                onChange={(e) => handleChange("settings.whatsapp.businessId", e.target.value)}
              />
            </label>

            <div className="section-title">Billing</div>
            <div className="hint">
              Use Stripe checkout from the Super Admin Dashboard to activate subscriptions.
            </div>

            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? "Saving..." : isEdit ? "Update Tenant" : "Create Tenant"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminTenants;
