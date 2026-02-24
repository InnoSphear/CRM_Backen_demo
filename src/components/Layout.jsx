import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ title, children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
