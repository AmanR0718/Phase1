import React, { useState } from "react";

type Props = {
  data: any;
  onBack: () => void;
  onNext: (values: any) => void;
};

export default function Step3Farm({ data, onBack, onNext }: Props) {
  const [farmSize, setFarmSize] = useState(data?.farm_size_hectares || "");
  const [cropsGrown, setCropsGrown] = useState(
    Array.isArray(data?.crops_grown) ? data.crops_grown.join(", ") : data?.crops_grown || ""
  );
  const [livestock, setLivestock] = useState(
    Array.isArray(data?.livestock) ? data.livestock.join(", ") : data?.livestock || ""
  );
  const [hasIrrigation, setHasIrrigation] = useState(data?.has_irrigation || false);
  const [farmingExperience, setFarmingExperience] = useState(
    data?.farming_experience_years || ""
  );
  const [err, setErr] = useState("");

  const handleNext = () => {
    // Basic validation
    if (farmSize && parseFloat(farmSize) <= 0) {
      setErr("Farm size must be greater than 0");
      return;
    }

    if (farmingExperience && parseInt(farmingExperience) < 0) {
      setErr("Farming experience cannot be negative");
      return;
    }

    setErr("");
    
    // Parse crops and livestock from comma-separated strings
    const cropsArray = cropsGrown
      ? cropsGrown.split(",").map((c) => c.trim()).filter((c) => c)
      : [];
    
    const livestockArray = livestock
      ? livestock.split(",").map((l) => l.trim()).filter((l) => l)
      : [];

    onNext({
      farm_size_hectares: farmSize ? parseFloat(farmSize) : 0,
      crops_grown: cropsArray,
      livestock: livestockArray,
      has_irrigation: hasIrrigation,
      farming_experience_years: farmingExperience ? parseInt(farmingExperience) : 0,
    });
  };

  return (
    <div>
      <h3 style={{ color: "#1F2937", marginBottom: "20px" }}>
        🌾 Farm Details
      </h3>

      {err && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#DC2626",
            padding: 12,
            borderRadius: 6,
            marginBottom: 15,
            border: "1px solid #FCA5A5",
          }}
        >
          ⚠️ {err}
        </div>
      )}

      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          padding: 12,
          borderRadius: 6,
          marginBottom: 20,
          fontSize: 14,
          color: "#1E40AF",
        }}
      >
        ℹ️ Farm details are optional but help us provide better support services.
      </div>

      {/* Farm Size */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Farm Size (hectares)
        </label>
        <input
          value={farmSize}
          onChange={(e) => setFarmSize(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          placeholder="e.g., 2.5"
          type="number"
          step="0.1"
          min="0"
        />
        <small style={{ color: "#6B7280", fontSize: 12 }}>
          Total area of farmland in hectares
        </small>
      </div>

      {/* Crops Grown */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Main Crops Grown
        </label>
        <input
          value={cropsGrown}
          onChange={(e) => setCropsGrown(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          placeholder="e.g., Maize, Groundnuts, Beans"
        />
        <small style={{ color: "#6B7280", fontSize: 12 }}>
          Separate multiple crops with commas
        </small>
      </div>

      {/* Livestock */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Livestock (if any)
        </label>
        <input
          value={livestock}
          onChange={(e) => setLivestock(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          placeholder="e.g., Cattle, Goats, Chickens"
        />
        <small style={{ color: "#6B7280", fontSize: 12 }}>
          Separate multiple types with commas
        </small>
      </div>

      {/* Farming Experience */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Years of Farming Experience
        </label>
        <input
          value={farmingExperience}
          onChange={(e) => setFarmingExperience(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          placeholder="e.g., 10"
          type="number"
          min="0"
        />
        <small style={{ color: "#6B7280", fontSize: 12 }}>
          How many years have you been farming?
        </small>
      </div>

      {/* Irrigation */}
      <div style={{ marginBottom: 15 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            padding: 12,
            background: "#F9FAFB",
            border: "1px solid #D1D5DB",
            borderRadius: 6,
          }}
        >
          <input
            type="checkbox"
            checked={hasIrrigation}
            onChange={(e) => setHasIrrigation(e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer" }}
          />
          <span style={{ fontWeight: "600" }}>Has Irrigation System</span>
        </label>
        <small style={{ color: "#6B7280", fontSize: 12, marginLeft: 28, display: "block", marginTop: 4 }}>
          Check if your farm has any irrigation infrastructure
        </small>
      </div>

      {/* Summary Card */}
      {(farmSize || cropsGrown || livestock || farmingExperience) && (
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            padding: 15,
            borderRadius: 6,
            marginTop: 20,
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#166534", fontSize: 16 }}>
            ✅ Farm Summary
          </h4>
          <div style={{ fontSize: 14, color: "#166534", lineHeight: 1.8 }}>
            {farmSize && <div>• Farm Size: {farmSize} hectares</div>}
            {cropsGrown && <div>• Crops: {cropsGrown}</div>}
            {livestock && <div>• Livestock: {livestock}</div>}
            {farmingExperience && <div>• Experience: {farmingExperience} years</div>}
            {hasIrrigation && <div>• Has irrigation system</div>}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            background: "#6B7280",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleNext}
          style={{
            padding: "12px 24px",
            background: "#2563EB",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}