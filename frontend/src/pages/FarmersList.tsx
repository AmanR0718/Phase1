import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";

export default function FarmersList() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<null | string>(null);

  const limit = 5;

  // 🔹 Fetch farmers
  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await farmerService.getFarmers(limit, page * limit);
      const farmerList = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
      setFarmers(farmerList);
    } catch (err: any) {
      console.error("Failed to load farmers:", err);
      setError(err.response?.data?.detail || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete a farmer
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await farmerService.deleteFarmer(id);
      setMessage("✅ Farmer deleted successfully");
      setConfirmDelete(null);
      await fetchFarmers(); // refresh list
    } catch (err: any) {
      console.error("Delete failed:", err);
      setMessage("❌ Failed to delete farmer");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [page]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* 🔹 Header */}
      <div
        style={{
          backgroundColor: "#2563EB",
          color: "white",
          padding: "15px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "2px solid white",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>Farmers</h1>
        </div>
        <button
          onClick={() => navigate("/farmers/create")}
          style={{
            backgroundColor: "#16A34A",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ Add Farmer
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 20px" }}>
        {/* 🔹 Toast message */}
        {message && (
          <div
            style={{
              background: message.startsWith("✅") ? "#DCFCE7" : "#FEE2E2",
              color: message.startsWith("✅") ? "#166534" : "#B91C1C",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "6px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: "white",
              padding: 40,
              textAlign: "center",
              borderRadius: 6,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            ⏳ Loading farmers...
          </div>
        ) : farmers.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: 40,
              borderRadius: 6,
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            No farmers found.
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#F3F4F6" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>#</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>First Name</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Last Name</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f, i) => (
                  <tr key={f.farmer_id || i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "12px" }}>{i + 1 + page * limit}</td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {f.personal_info?.first_name || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{f.personal_info?.last_name || "-"}</td>
                    <td style={{ padding: "12px" }}>{f.personal_info?.phone_primary || "-"}</td>
                    <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => navigate(`/farmers/edit/${f.farmer_id}`)}
                        style={{
                          color: "#2563EB",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(f.farmer_id)}
                        style={{
                          color: "#DC2626",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#F9FAFB",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: page === 0 ? "#E5E7EB" : "#2563EB",
                  color: page === 0 ? "#6B7280" : "white",
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                style={{
                  background: "#2563EB",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              textAlign: "center",
              width: "90%",
              maxWidth: 400,
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Are you sure?</h3>
            <p>This action will permanently delete the farmer record.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: "#6B7280",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{
                  background: "#DC2626",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
