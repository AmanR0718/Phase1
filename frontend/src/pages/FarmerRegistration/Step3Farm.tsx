import React, { useState } from "react";

type Props = {
  data: any;
  onBack: () => void;
  onNext: (values: any) => void;
};

export default function Step3Farm({ data, onBack, onNext }: Props) {
  const [size, setSize] = useState(data?.size_hectares || "");
  const [crops, setCrops] = useState(data?.crops || "");

  return (
    <div>
      <h3>Farm details (optional)</h3>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Farm size (hectares)</label>
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="e.g. 1.5"
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Main crops (comma separated)</label>
        <input
          value={crops}
          onChange={(e) => setCrops(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="maize, groundnuts"
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={onBack}
          style={{ padding: 12, background: "#6B7280", color: "white", border: "none", borderRadius: 6 }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onNext({ size_hectares: size, crops })}
          style={{ padding: 12, background: "#2563EB", color: "white", border: "none", borderRadius: 6 }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
