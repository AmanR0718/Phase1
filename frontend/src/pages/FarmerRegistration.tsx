import { useState } from "react";
import { useNavigate } from "react-router-dom";
import farmerService from "@/services/farmer.service";

export default function FarmerRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    district: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert("First name and last name required!");
      return;
    }

    setLoading(true);
    try {
      await farmerService.create({
        personal_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_primary: formData.phone,
        },
        address: {
          province: formData.province,
          district: formData.district,
        },
      });
      alert("✅ Farmer created!");
      navigate("/farmers/");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create farmer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => navigate("/farmers/")}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            backgroundColor: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← BACK
        </button>

        <h1>Create New Farmer</h1>
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

        <form onSubmit={handleSubmit}>
          {[
            ["First Name *", "firstName"],
            ["Last Name *", "lastName"],
            ["Phone", "phone"],
            ["Province", "province"],
            ["District", "district"],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                {label}
              </label>
              <input
                type="text"
                value={(formData as any)[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: loading ? "#9CA3AF" : "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "⏳ Creating..." : "✅ Create"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/farmers/")}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#6B7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
