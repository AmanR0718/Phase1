import React, { useState } from "react";

type Props = {
  data: any;
  onNext: (values: any) => void;
  onBack: () => void;
};

export default function Step1Personal({ data, onNext, onBack }: Props) {
  const [firstName, setFirstName] = useState(data?.first_name || "");
  const [lastName, setLastName] = useState(data?.last_name || "");
  const [phone, setPhone] = useState(data?.phone_primary || "");
  const [phoneSecondary, setPhoneSecondary] = useState(data?.phone_secondary || "");
  const [email, setEmail] = useState(data?.email || "");
  const [dob, setDob] = useState(data?.date_of_birth || "");
  const [gender, setGender] = useState(data?.gender || "");
  const [nrc, setNrc] = useState(data?.nrc_number || "");
  const [err, setErr] = useState("");

  const handleNext = () => {
    // Validation
    if (!firstName || !lastName) {
      setErr("First and last name are required");
      return;
    }

    if (!phone) {
      setErr("Primary phone number is required");
      return;
    }

    // Phone format validation (Zambian format)
    const phonePattern = /^\+260\d{9}$/;
    if (!phonePattern.test(phone.replace(/[-\s]/g, ""))) {
      setErr("Phone must be in format +260XXXXXXXXX");
      return;
    }

    if (!nrc) {
      setErr("NRC number is required");
      return;
    }

    // NRC format validation
    const nrcPattern = /^\d{6}\/\d{2}\/\d{1}$/;
    if (!nrcPattern.test(nrc)) {
      setErr("NRC must be in format 123456/12/1");
      return;
    }

    if (!dob) {
      setErr("Date of birth is required");
      return;
    }

    // Age validation (18+)
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setErr("Farmer must be at least 18 years old");
      return;
    }

    if (!gender) {
      setErr("Gender is required");
      return;
    }

    setErr("");
    onNext({
      first_name: firstName,
      last_name: lastName,
      phone_primary: phone,
      phone_secondary: phoneSecondary,
      email: email,
      date_of_birth: dob,
      gender: gender,
      nrc_number: nrc,
    });
  };

  return (
    <div>
      <h3 style={{ color: "#1F2937", marginBottom: "20px" }}>
        👤 Personal Information
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

      {/* Name Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            First Name *
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Enter first name"
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Last Name *
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Enter last name"
          />
        </div>
      </div>

      {/* Phone Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Primary Phone *
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="+260971234567"
            type="tel"
          />
          <small style={{ color: "#6B7280", fontSize: 12 }}>
            Format: +260XXXXXXXXX
          </small>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Secondary Phone
          </label>
          <input
            value={phoneSecondary}
            onChange={(e) => setPhoneSecondary(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="+260961234567 (optional)"
            type="tel"
          />
        </div>
      </div>

      {/* Email and NRC */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Email Address
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="email@example.com (optional)"
            type="email"
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            NRC Number *
          </label>
          <input
            value={nrc}
            onChange={(e) => setNrc(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="123456/12/1"
          />
          <small style={{ color: "#6B7280", fontSize: 12 }}>
            Format: 123456/12/1
          </small>
        </div>
      </div>

      {/* DOB and Gender */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Date of Birth *
          </label>
          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            type="date"
            max={new Date().toISOString().split("T")[0]}
          />
          <small style={{ color: "#6B7280", fontSize: 12 }}>
            Must be 18 years or older
          </small>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Gender *
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            background: "#E5E7EB",
            color: "#1F2937",
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }} /> {/* This will push the next button to the right */}
        <button
          onClick={handleNext}
          style={{
            padding: "12px 24px",
            background: "#16A34A",
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