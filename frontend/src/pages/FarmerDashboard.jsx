import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Farmer Dashboard</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="secondary"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h3>Welcome, {user?.email || "Farmer"}!</h3>
        <p>
          This is your personal farmer dashboard. Here you can view your
          personal information, land details, and documents.
        </p>
        <p style={{ color: "#666", fontSize: "14px", marginTop: 12 }}>
          <strong>Note:</strong> Full farmer profile features are coming soon.
          You'll be able to view and update your farming information here.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Quick Stats</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>0</div>
            <div style={{ fontSize: "12px", color: "#666" }}>Land Parcels</div>
          </div>
          <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>0</div>
            <div style={{ fontSize: "12px", color: "#666" }}>Documents</div>
          </div>
          <div style={{ padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>Pending</div>
            <div style={{ fontSize: "12px", color: "#666" }}>Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}
