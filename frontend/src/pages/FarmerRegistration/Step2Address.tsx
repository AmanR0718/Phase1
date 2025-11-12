// frontend/src/pages/FarmerRegistration/Step2Address.tsx
import React, { useEffect, useState } from "react";
import geoService from "@/services/geo.service";

type Props = {
  data: any;
  onBack: () => void;
  onNext: (values: any) => void;
};

export default function Step2Address({ data, onBack, onNext }: Props) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [chiefdoms, setChiefdoms] = useState<any[]>([]);

  const [provinceCode, setProvinceCode] = useState(data?.province_code || "");
  const [districtCode, setDistrictCode] = useState(data?.district_code || "");
  const [chiefdomCode, setChiefdomCode] = useState(data?.chiefdom_code || "");
  const [village, setVillage] = useState(data?.village || "");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 🔹 Load provinces on mount
  useEffect(() => {
    console.log("Loading provinces...");
    geoService
      .provinces()
      .then((res) => {
        console.log("Provinces loaded:", res);
        setProvinces(res || []);
      })
      .catch((e) => console.error("Failed to load provinces:", e));
  }, []);

  // 🔹 Load districts when province changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setChiefdoms([]);
      setChiefdomCode("");
      return;
    }

    console.log("Loading districts for province:", provinceCode);
    setDistricts([]);
    setDistrictCode("");
    setChiefdoms([]);
    setChiefdomCode("");

    setLoading(true);
    geoService
      .districts(provinceCode)
      .then((d) => {
        console.log("Districts loaded:", d);
        setDistricts(d || []);
      })
      .catch((e) => console.error("Failed to load districts:", e))
      .finally(() => setLoading(false));
  }, [provinceCode]);

  // 🔹 Load chiefdoms when district changes ✅ THIS IS THE KEY
  useEffect(() => {
    if (!districtCode) {
      setChiefdoms([]);
      setChiefdomCode("");
      return;
    }

    console.log("🔍 Loading chiefdoms for district:", districtCode);
    setChiefdoms([]);
    setChiefdomCode("");

    setLoading(true);
    geoService
      .chiefdoms(districtCode)
      .then((c) => {
        console.log("✅ Chiefdoms loaded:", c);
        console.log("   Count:", c?.length || 0);
        setChiefdoms(c || []);
      })
      .catch((e) => {
        console.error("❌ Failed to load chiefdoms:", e);
        setChiefdoms([]);
      })
      .finally(() => setLoading(false));
  }, [districtCode]);

  const handleNext = () => {
    if (!provinceCode || !districtCode) {
      setErr("Please select province and district");
      return;
    }
    setErr("");

    const province = provinces.find((p) => p.province_id === provinceCode) || { province_name: "" };
    const district = districts.find((d) => d.district_id === districtCode) || { district_name: "" };
    const chiefdom = chiefdoms.find((c) => c.chiefdom_id === chiefdomCode) || { chiefdom_name: "" };

    onNext({
      province_code: provinceCode,
      province_name: province.province_name,
      district_code: districtCode,
      district_name: district.district_name,
      chiefdom_code: chiefdomCode,
      chiefdom_name: chiefdom.chiefdom_name,
      village,
    });
  };

  return (
    <div>
      <h3>Address & location</h3>
      {err && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 6 }}>{err}</div>}

      {loading && (
        <div style={{ marginTop: 10, color: "#2563EB", fontSize: 14 }}>
          Loading geographic data...
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Province *</label>
        <select
          value={provinceCode}
          onChange={(e) => {
            console.log("Province selected:", e.target.value);
            setProvinceCode(e.target.value);
          }}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        >
          <option value="">-- choose province --</option>
          {provinces.map((p) => (
            <option key={p.province_id} value={p.province_id}>
              {p.province_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>District *</label>
        <select
          value={districtCode}
          onChange={(e) => {
            console.log("District selected:", e.target.value);
            setDistrictCode(e.target.value);
          }}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          disabled={!provinceCode || loading}
        >
          <option value="">-- choose district --</option>
          {districts.map((d) => (
            <option key={d.district_id} value={d.district_id}>
              {d.district_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>
          Chiefdom {chiefdoms.length > 0 && `(${chiefdoms.length} available)`}
        </label>
        <select
          value={chiefdomCode}
          onChange={(e) => {
            console.log("Chiefdom selected:", e.target.value);
            setChiefdomCode(e.target.value);
          }}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
          disabled={!districtCode || loading}
        >
          <option value="">-- choose chiefdom (optional) --</option>
          {chiefdoms.map((c) => (
            <option key={c.chiefdom_id} value={c.chiefdom_id}>
              {c.chiefdom_name || c.chief_name || c.chiefdom_id}
            </option>
          ))}
        </select>
        {chiefdoms.length === 0 && districtCode && !loading && (
          <div style={{ marginTop: 4, color: "#666", fontSize: 13 }}>
            No chiefdoms available for this district
          </div>
        )}
        {loading && districtCode && (
          <div style={{ marginTop: 4, color: "#2563EB", fontSize: 13 }}>
            Loading chiefdoms...
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Village / locality</label>
        <input
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
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
          onClick={handleNext}
          style={{ padding: 12, background: "#2563EB", color: "white", border: "none", borderRadius: 6 }}
          disabled={loading}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
