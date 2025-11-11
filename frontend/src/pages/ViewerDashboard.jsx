import React, { useEffect, useState } from "react";
import { getFarmers } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function ViewerDashboard({ apiBase }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    load(token);
  }, []);

  async function load(token) {
    setLoading(true);
    try {
      const data = await getFarmers(token);
      setFarmers(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Viewer Dashboard</h2>
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

      <p style={{ color: "#666", marginTop: 8 }}>
        View-only access to farmer records. You cannot add or edit farmers.
      </p>

      {loading && <div style={{ padding: 20 }}>Loading farmers...</div>}
      {!loading && farmers.length === 0 && (
        <div style={{ padding: 20 }}>No farmers found.</div>
      )}

      <div id="farmers-list" style={{ marginTop: 12 }}>
        {farmers.map((f) => (
          <div key={f.farmer_id || f.temp_id} className="card tile">
            <div className="avatar">
              {(f.personal_info?.first_name || "")[0] || "F"}
            </div>
            <div className="meta">
              <div style={{ fontWeight: 700 }}>
                {f.personal_info?.first_name} {f.personal_info?.last_name}
              </div>
              <div className="small-muted">
                {f.personal_info?.phone_primary || f.personal_info?.phone}
              </div>
              <div className="small-muted">{f.nrc_number || f.farmer_id}</div>
            </div>
            <div className="actions">
              <Link to={`/farmers/${f.farmer_id || f.temp_id}`}>
                <button className="btn-icon">View</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

