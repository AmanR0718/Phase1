import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";

export default function FarmersList() {
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await farmerService.getFarmers(50, 0);

      const farmerList = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setFarmers(farmerList);
    } catch (err: any) {
      console.error("Fetch farmers error:", err);
      setError(err.response?.data?.detail || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filtered = farmers.filter((f) => {
    const name =
      `${f.personal_info?.first_name || ""} ${f.personal_info?.last_name || ""}`.toLowerCase();
    const farmerId = (f.farmer_id || "").toLowerCase();
    const phone = (f.personal_info?.phone_primary || "").toLowerCase();
    
    return (
      name.includes(search.toLowerCase()) ||
      farmerId.includes(search.toLowerCase()) ||
      phone.includes(search.toLowerCase())
    );
  });

  const handleDelete = async (farmerId: string) => {
    const yes = confirm("Are you sure you want to delete this farmer?");
    if (!yes) return;

    try {
      await farmerService.deleteFarmer(farmerId);
      alert("✅ Farmer deleted successfully!");
      fetchFarmers();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.detail || "❌ Failed to delete farmer");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2563EB",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#1E40AF",
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

        <button
          onClick={fetchFarmers}
          style={{
            backgroundColor: "#1E3A8A",
            color: "white",
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => navigate("/farmers/create")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#16A34A",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Add New Farmer
          </button>

          <input
            placeholder="Search by name, ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              width: "300px",
            }}
          />
        </div>

        {/* Error */}
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
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
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
              📊 Farmers ({filtered.length})
            </div>

            {/* TABLE */}
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                {search
                  ? "No farmers match your search criteria."
                  : "No farmers registered yet. Click 'Add New Farmer' to get started."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#F3F4F6" }}>
                  <tr>
                    <th style={{ padding: "15px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>Farmer ID</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>First Name</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>Last Name</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>Phone</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>District</th>
                    <th style={{ padding: "15px", textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((f, i) => (
                    <tr key={f.farmer_id || f._id || i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "15px" }}>{i + 1}</td>
                      <td style={{ padding: "15px", fontFamily: "monospace", fontSize: 13 }}>
                        {f.farmer_id || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>{f.personal_info?.first_name || "-"}</td>
                      <td style={{ padding: "15px" }}>{f.personal_info?.last_name || "-"}</td>
                      <td style={{ padding: "15px" }}>{f.personal_info?.phone_primary || "-"}</td>
                      <td style={{ padding: "15px" }}>{f.address?.district || "-"}</td>

                      <td style={{ padding: "15px", display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => navigate(`/farmers/edit/${f.farmer_id}`)}
                          style={{
                            color: "#2563EB",
                            border: "1px solid #2563EB",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: "6px 12px",
                            borderRadius: 4,
                          }}
                          title="Edit farmer"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => navigate(`/farmers/${f.farmer_id}`)}
                          style={{
                            color: "#16A34A",
                            border: "1px solid #16A34A",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: "6px 12px",
                            borderRadius: 4,
                          }}
                          title="View details"
                        >
                          👁️ View
                        </button>

                        <button
                          onClick={() => handleDelete(f.farmer_id)}
                          style={{
                            color: "#DC2626",
                            border: "1px solid #DC2626",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 14,
                            padding: "6px 12px",
                            borderRadius: 4,
                          }}
                          title="Delete farmer"
                        >
                          🗑️ Delete
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