import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Counselors from "./pages/Counselors";
import Stages from "./pages/Stages";
import Automations from "./pages/Automations";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Messaging from "./pages/Messaging";
import Calls from "./pages/Calls";
import Templates from "./pages/Templates";
import Campaigns from "./pages/Campaigns";
import AdminTenants from "./pages/AdminTenants";
import TenantBranding from "./pages/TenantBranding";
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="card">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!["admin", "super_admin"].includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const SuperAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "super_admin") return <Navigate to="/dashboard" replace />;
  return children;
};

const TenantAdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  const LoginRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="card">Loading...</div>;
    if (user) return <Navigate to="/dashboard" replace />;
    return <Login />;
  };

  const RootRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="card">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "super_admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  };

  const DashboardRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="card">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "super_admin") return <Navigate to="/admin/dashboard" replace />;
    return <Dashboard />;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/dashboard"
        element={
          <DashboardRoute />
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Activities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging"
        element={
          <ProtectedRoute>
            <Messaging />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <Calls />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Templates />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Campaigns />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/counselors"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Counselors />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stages"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Stages />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/automations"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Automations />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Reports />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tenants"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminTenants />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <AdminDashboard />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/branding"
        element={
          <ProtectedRoute>
            <TenantAdminRoute>
              <TenantBranding />
            </TenantAdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
