import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Farmers from "./components/Farmers";
import Sync from "./components/Sync";
import OperatorDashboard from "./pages/OperatorDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ViewerDashboard from "./pages/ViewerDashboard";
import AddFarmer from "./pages/AddFarmer";
import FarmerDetail from "./pages/FarmerDetail";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="appbar">
        <h1>Farmer Management</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            to="/login"
            className="btn-ghost"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Login
          </Link>
          <Link
            to="/operator"
            className="btn-ghost"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Operator
          </Link>
          <button className="btn-icon" title="Scan QR">
            📷 QR
          </button>
        </div>
      </header>
      <div className="app-body">{children}</div>
      <div className="app-footer" id="app-footer">
        <small>
          Frontend talking to{" "}
          <code
            style={{
              background: "#f1f5f9",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {API_BASE}
          </code>
        </small>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // Handle successful login
  const handleLogin = (data) => {
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    }
    if (data.user) {
      setUser(data.user);
    }
  };

  // Get default route based on user role
  const getDefaultRoute = () => {
    if (!token || !user) return "/login";

    const roles = user.roles || [];
    if (roles.includes("ADMIN") || roles.includes("OPERATOR")) {
      return "/operator";
    } else if (roles.includes("VIEWER")) {
      return "/viewer";
    } else if (roles.includes("FARMER")) {
      return "/farmer";
    }
    return "/operator";
  };

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={getDefaultRoute()} replace />}
          />
          <Route
            path="/login"
            element={<Login apiBase={API_BASE} onLogin={handleLogin} />}
          />
          <Route
            path="/operator"
            element={<OperatorDashboard apiBase={API_BASE} />}
          />
          <Route
            path="/viewer"
            element={<ViewerDashboard apiBase={API_BASE} />}
          />
          <Route
            path="/farmer"
            element={<FarmerDashboard apiBase={API_BASE} />}
          />
          <Route
            path="/farmers"
            element={<Farmers apiBase={API_BASE} token={token} />}
          />
          <Route
            path="/farmers/add"
            element={<AddFarmer apiBase={API_BASE} token={token} />}
          />
          <Route
            path="/farmers/:id"
            element={<FarmerDetail apiBase={API_BASE} token={token} />}
          />
          <Route
            path="/sync"
            element={<Sync apiBase={API_BASE} token={token} />}
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
