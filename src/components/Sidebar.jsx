import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, tenant } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const isTenantAdmin = user?.role === "admin";
  const isTenantUser = user && user.role !== "super_admin";
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          {tenant?.branding?.logoUrl ? (
            <img src={tenant.branding.logoUrl} alt="logo" className="brand-logo" />
          ) : (
            "CRM"
          )}
        </div>
        <div>
          <div className="brand-title">{isSuperAdmin ? "InnoSphear CRM" : tenant?.name || "Counselor CRM"}</div>
          <div className="brand-sub">
            {isSuperAdmin ? "Super Admin Console" : tenant?.slug ? `${tenant.slug}.crm` : "Admissions Growth"}
          </div>
        </div>
      </div>
      <nav className="nav">
        {isTenantUser && <NavLink to="/dashboard">Dashboard</NavLink>}
        {isTenantUser && <NavLink to="/leads">Leads</NavLink>}
        {isTenantUser && <NavLink to="/activities">Activities</NavLink>}
        {isTenantUser && <NavLink to="/messaging">Messaging</NavLink>}
        {isTenantUser && <NavLink to="/calls">Calling</NavLink>}
        {isTenantAdmin && <NavLink to="/templates">Templates</NavLink>}
        {isTenantAdmin && <NavLink to="/campaigns">Campaigns</NavLink>}
        {isTenantAdmin && <NavLink to="/counselors">Counselors</NavLink>}
        {isTenantAdmin && <NavLink to="/stages">Pipeline Stages</NavLink>}
        {isTenantAdmin && <NavLink to="/automations">Automation</NavLink>}
        {isTenantAdmin && <NavLink to="/reports">Reports</NavLink>}
        {isTenantAdmin && <NavLink to="/admin/branding">Branding</NavLink>}
        {isSuperAdmin && <NavLink to="/admin/dashboard">Super Admin</NavLink>}
        {isSuperAdmin && <NavLink to="/admin/tenants">Tenant Admin</NavLink>}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.name || "User"}</div>
        <div className="sidebar-role">{user?.role || "-"}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
