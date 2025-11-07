import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";

export default function FarmersList() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getFarmers(5, 0);
      const farmerList = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
      setFarmers(farmerList);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div
        style={{
          backgroundColor: "#2563EB",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#2563EB",
            color: "white",
            border: "2px solid white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← BACK
        </button>
        <h1 style={{ margin: 0 }}>All Farmers</h1>
      </div>

      <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px" }}>
        <button
          onClick={() => navigate("/farmers/create")}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            backgroundColor: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Add New
        </button>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              textAlign: "center",
              borderRadius: "6px",
            }}
          >
            ⏳ Loading...
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "15px",
                backgroundColor: "#1F2937",
                color: "white",
                fontWeight: "bold",
              }}
            >
              📊 Farmers ({farmers.length})
            </div>
            {farmers.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No farmers
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#F3F4F6" }}>
                  <tr>
                    <th style={{ padding: "15px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>
                      First Name
                    </th>
                    <th style={{ padding: "15px", textAlign: "left" }}>
                      Last Name
                    </th>
                    <th style={{ padding: "15px", textAlign: "left" }}>Phone</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f, i) => (
                    <tr key={f.farmer_id || i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "15px" }}>{i + 1}</td>
                      <td style={{ padding: "15px", fontWeight: "bold" }}>
                        {f.personal_info?.first_name || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {f.personal_info?.last_name || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {f.personal_info?.phone_primary || "-"}
                      </td>
                      <td style={{ padding: "15px", display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => navigate(`/farmers/edit/${f.farmer_id}`)}
                          style={{
                            color: "#2563EB",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          style={{
                            color: "#DC2626",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
