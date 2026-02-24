import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../api";

const emptyForm = { name: "", channel: "sms", content: "", subject: "", htmlContent: "", whatsappTemplateName: "", whatsappApproved: false };

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);

  const loadData = async () => {
    const data = await api.templates();
    setTemplates(data);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || "Failed to load"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!form.name || !form.content) {
        setError("Name and content required.");
        alert("Name and content required.");
        return;
      }
      if (editingId) {
        await api.updateTemplate(editingId, form);
        setSuccess("Template updated.");
        alert("Template updated.");
      } else {
        await api.createTemplate(form);
        setSuccess("Template created.");
        alert("Template created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Save failed");
      alert(err.message || "Save failed");
    }
  };

  const startEdit = (template) => {
    setEditingId(template._id);
      setForm({
        name: template.name,
        channel: template.channel || "sms",
        content: template.content,
        subject: template.subject || "",
        htmlContent: template.htmlContent || "",
        whatsappTemplateName: template.whatsappTemplateName || "",
        whatsappApproved: template.whatsappApproved || false,
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    await api.deleteTemplate(id);
    await loadData();
  };

  return (
    <Layout title="Message Templates">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="grid two">
        <div className="card">
          <div className="card-title">{editingId ? "Edit Template" : "New Template"}</div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Channel
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            {form.channel === "email" && (
              <>
                <label>
                  Subject
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </label>
                <label>
                  HTML Content
                  <textarea value={form.htmlContent} onChange={(e) => setForm({ ...form, htmlContent: e.target.value })} rows={5} />
                </label>
                <button className="btn ghost" type="button" onClick={() => setPreview((v) => !v)}>
                  {preview ? "Hide" : "Preview"} HTML
                </button>
                {preview && (
                  <div className="card subtle">
                    <div className="muted">HTML Preview</div>
                    <div dangerouslySetInnerHTML={{ __html: form.htmlContent || "" }} />
                  </div>
                )}
              </>
            )}
            {form.channel === "whatsapp" && (
              <>
                <label>
                  WhatsApp Template Name
                  <input value={form.whatsappTemplateName} onChange={(e) => setForm({ ...form, whatsappTemplateName: e.target.value })} />
                </label>
                <label>
                  WhatsApp Approved
                  <select value={form.whatsappApproved ? "true" : "false"} onChange={(e) => setForm({ ...form, whatsappApproved: e.target.value === "true" })}>
                    <option value="false">Not Approved</option>
                    <option value="true">Approved</option>
                  </select>
                </label>
              </>
            )}
            <label>
              Content
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
            </label>
            <div className="row">
              <button className="btn primary" type="submit">
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="card">
          <div className="card-title">Templates</div>
          <div className="table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Channel</span>
              <span>Content</span>
              <span>Actions</span>
            </div>
            {templates.map((t) => (
              <div key={t._id} className="table-row">
                <span>{t.name}</span>
                <span>{t.channel}</span>
                <span className="truncate">{t.content}</span>
                <span className="actions">
                  <button className="link" onClick={() => startEdit(t)}>Edit</button>
                  <button className="link danger" onClick={() => handleDelete(t._id)}>Delete</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Templates;
