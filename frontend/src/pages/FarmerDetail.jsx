import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFarmerById } from "../api";

export default function FarmerDetail({ apiBase, token }) {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = token || localStorage.getItem("access_token");
    if (!t) {
      navigate("/login");
      return;
    }
    load(t);
  }, [id]);

  async function load(t) {
    setLoading(true);
    try {
      const data = await getFarmerById(t, id);
      setFarmer(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="view">Loading...</div>;
  if (!farmer) return <div className="view">Farmer not found</div>;

  return (
    <div className="view">
      <h2 style={{ marginBottom: 8 }}>
        {farmer.personal_info?.first_name} {farmer.personal_info?.last_name}
      </h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}
      >
        <div>
          <section className="panel">
            <h3>Personal Info</h3>
            <div style={{ marginTop: 8 }}>
              NRC: <strong>{farmer.farmer_id}</strong>
            </div>
            <div style={{ marginTop: 6 }}>
              Phone: {farmer.personal_info?.phone_primary}
            </div>
            <div style={{ marginTop: 6 }}>
              Province: {farmer.address?.province}
            </div>
          </section>

          <section className="panel" style={{ marginTop: 12 }}>
            <h3>Documents</h3>
            <div style={{ marginTop: 8 }}>
              {(farmer.identification_documents || []).map((d, i) => (
                <div key={i} className="doc-row">
                  {d.url ? (
                    <img src={d.url} alt={d.name} className="doc-thumb" />
                  ) : (
                    <div
                      className="doc-thumb"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      PDF
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      {d.name || `Document ${i + 1}`}
                    </div>
                    <div className="small-muted">{d.type || ""}</div>
                  </div>
                  <div>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      <button className="btn-icon">⬇️</button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <div className="card">
            <div
              style={{
                height: 220,
                background: "#f0f6fb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              {farmer.personal_info?.photo ? (
                <img
                  src={farmer.personal_info.photo}
                  alt="photo"
                  style={{ maxHeight: 200, borderRadius: 8 }}
                />
              ) : (
                <div style={{ color: "#0b3954" }}>No Photo</div>
              )}
            </div>
            <div style={{ padding: 8 }}>
              <button style={{ width: "100%" }}>Upload Photo</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
