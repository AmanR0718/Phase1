import React, { useState } from "react";

type Props = {
  data: any;
  onNext: (values: any) => void;
};

export default function Step1Personal({ data, onNext }: Props) {
  const [firstName, setFirstName] = useState(data?.first_name || "");
  const [lastName, setLastName] = useState(data?.last_name || "");
  const [phone, setPhone] = useState(data?.phone_primary || "");
  const [err, setErr] = useState("");

  const handleNext = () => {
    if (!firstName || !lastName) {
      setErr("First and last name are required");
      return;
    }
    setErr("");
    onNext({ first_name: firstName, last_name: lastName, phone_primary: phone });
  };

  return (
    <div>
      <h3>Personal information</h3>
      {err && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 6 }}>{err}</div>}

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>First name *</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Last name *</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          placeholder="+2607..."
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleNext}
          style={{
            padding: 12,
            background: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
