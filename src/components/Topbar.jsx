import React from "react";
import { useAuth } from "../context/AuthContext";

const Topbar = ({ title }) => {
  const { logout, tenant } = useAuth();
  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-subtitle">
          {tenant?.name ? `${tenant.name} · CRM workspace` : "Full funnel visibility for counselor performance."}
        </div>
      </div>
      <button className="btn secondary" onClick={logout}>
        Log out
      </button>
    </header>
  );
};

export default Topbar;
