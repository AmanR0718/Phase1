import React, { useState, useRef } from "react";
import { createFarmer } from "../api";
import { useNavigate } from "react-router-dom";
import {
  provinces,
  getDistrictsForProvince,
  getChiefsForDistrict,
} from "../data/zambiaLocations";

export default function AddFarmer({ apiBase, token }) {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState({});
  const [lands, setLands] = useState([]);
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    const t = token || localStorage.getItem("access_token");
    if (!t) return navigate("/login");
    setLoading(true);
    try {
      // Backend expects FarmerCreate shape; we map fields simply
      const payload = {
        personal_info: {
          first_name: personal.first_name,
          last_name: personal.last_name,
          phone_primary: personal.phone,
        },
        address: {
          province: personal.province,
          district: personal.district,
        },
      };
      const created = await createFarmer(t, payload);
      navigate("/operator");
    } catch (e) {
      console.error(e);
      alert("Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="view">
      <h2>Add Farmer</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <nav style={{ width: 220 }}>
          <div className="stepper">
            <div className={`step ${step === 0 ? "active" : ""}`}>
              Step 1: Personal Info
            </div>
            <div
              className={`step ${step === 1 ? "active" : ""}`}
              style={{ marginTop: 8 }}
            >
              Step 2: Land Details
            </div>
            <div
              className={`step ${step === 2 ? "active" : ""}`}
              style={{ marginTop: 8 }}
            >
              Step 3: Documents
            </div>
            <div
              className={`step ${step === 3 ? "active" : ""}`}
              style={{ marginTop: 8 }}
            >
              Step 4: Review & Submit
            </div>
          </div>
        </nav>
        <section style={{ flex: 1 }}>
          {step === 0 && (
            <PersonalForm
              data={personal}
              onChange={setPersonal}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <LandForm
              lands={lands}
              setLands={setLands}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <DocsForm
              docs={docs}
              setDocs={setDocs}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <ReviewPage
              personal={personal}
              lands={lands}
              docs={docs}
              onBack={() => setStep(2)}
              onSubmit={submit}
              loading={loading}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function PersonalForm({ data, onChange, onNext }) {
  const [first, setFirst] = useState(data.first_name || "");
  const [last, setLast] = useState(data.last_name || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [province, setProvince] = useState(data.province || "");
  const [district, setDistrict] = useState(data.district || "");
  const [chief, setChief] = useState(data.chief || "");

  // Get available districts based on selected province
  const availableDistricts = province ? getDistrictsForProvince(province) : [];

  // Get available chiefs based on selected province and district
  const availableChiefs =
    province && district ? getChiefsForDistrict(province, district) : [];

  // Reset district when province changes
  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setDistrict("");
    setChief("");
  };

  // Reset chief when district changes
  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setChief("");
  };

  function save() {
    onChange({
      first_name: first,
      last_name: last,
      phone,
      province,
      district,
      chief,
    });
    onNext();
  }

  return (
    <div className="panel">
      <h3>Personal Info</h3>
      <label>
        First name
        <input
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          required
        />
      </label>
      <label>
        Last name
        <input
          value={last}
          onChange={(e) => setLast(e.target.value)}
          required
        />
      </label>
      <label>
        Phone
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </label>
      <label>
        Province
        <select value={province} onChange={handleProvinceChange} required>
          <option value="">Select Province</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        District
        <select
          value={district}
          onChange={handleDistrictChange}
          required
          disabled={!province}
        >
          <option value="">Select District</option>
          {availableDistricts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label>
        Chief (Optional)
        <select
          value={chief}
          onChange={(e) => setChief(e.target.value)}
          disabled={!district}
        >
          <option value="">Select Chief</option>
          {availableChiefs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: 8 }}>
        <button onClick={save}>Save & Next</button>
      </div>
    </div>
  );
}

function LandForm({ lands, setLands, onNext, onBack }) {
  const [area, setArea] = useState("");
  const [crop, setCrop] = useState("");
  function add() {
    setLands([...lands, { area, crop }]);
    setArea("");
    setCrop("");
  }
  return (
    <div className="panel">
      <h3>Land Details</h3>
      <label>
        Area
        <input value={area} onChange={(e) => setArea(e.target.value)} />
      </label>
      <label>
        Crop
        <input value={crop} onChange={(e) => setCrop(e.target.value)} />
      </label>
      <button onClick={add}>Add land</button>
      <div style={{ marginTop: 12 }}>
        {lands.map((l, i) => (
          <div
            key={i}
            style={{ padding: 8, border: "1px solid #eee", marginBottom: 6 }}
          >
            {l.area} - {l.crop}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={onBack} className="secondary">
          Back
        </button>
        <button onClick={onNext} style={{ marginLeft: 8 }}>
          Next
        </button>
      </div>
    </div>
  );
}

function DocsForm({ docs, setDocs, onNext, onBack }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="panel">
      <h3>Documents</h3>
      <p>
        Upload documents using your browser's file picker (not implemented
        here).
      </p>
      <div style={{ marginTop: 12 }}>
        <button onClick={onBack} className="secondary">
          Back
        </button>
        <button onClick={onNext} style={{ marginLeft: 8 }}>
          Next
        </button>
      </div>
    </div>
  );
}

function ReviewPage({ personal, lands, docs, onBack, onSubmit, loading }) {
  return (
    <div className="panel">
      <h3>Review & Submit</h3>
      <pre style={{ background: "#fafafa", padding: 8 }}>
        {JSON.stringify({ personal, lands, docs }, null, 2)}
      </pre>
      <div style={{ marginTop: 12 }}>
        <button onClick={onBack} className="secondary">
          Back
        </button>
        <button onClick={onSubmit} style={{ marginLeft: 8 }} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
