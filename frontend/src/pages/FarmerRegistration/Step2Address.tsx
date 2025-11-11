// frontend/src/pages/FarmerRegistrationWizard/Step2Address.tsx
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

  // In Step2Address.tsx, update the useEffect for districts:
useEffect(() => {
  if (!provinceCode) {
    setDistricts([]);
    return;
  }
  geoService.districts(provinceCode) // Pass province_id as provinceCode
    .then((d) => setDistricts(d || []))
    .catch(() => setDistricts([]));
}, [provinceCode]);


  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      return;
    }
    setLoading(true);
    geoService.districts(provinceCode).then((d) => { setDistricts(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setChiefdoms([]);
      setChiefdomCode("");
      return;
    }
    setLoading(true);
    geoService.chiefdoms(districtCode).then((d) => { setChiefdoms(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, [districtCode]);

  const handleNext = () => {
    if (!provinceCode || !districtCode) {
      setErr("Please select province and district");
      return;
    }
    setErr("");
    const province = provinces.find((p) => p.code === provinceCode) || { name: "" };
    const district = districts.find((d) => d.code === districtCode) || { name: "" };
    const chiefdom = chiefdoms.find((c) => c.code === chiefdomCode) || { name: "" };

    onNext({
      province_code: provinceCode,
      province_name: province.name,
      district_code: districtCode,
      district_name: district.name,
      chiefdom_code: chiefdomCode,
      chiefdom_name: chiefdom.name,
      village,
    });
  };

  return (
    <div>
      <h3>Address & location</h3>
      {err && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 6 }}>{err}</div>}

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Province *</label>
        <select value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }}>
          <option value="">-- choose province --</option>
          {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>District *</label>
        <select value={districtCode} onChange={(e) => setDistrictCode(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }}>
          <option value="">-- choose district --</option>
          {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Chiefdom</label>
        <select value={chiefdomCode} onChange={(e) => setChiefdomCode(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }}>
          <option value="">-- choose chiefdom (optional) --</option>
          {chiefdoms.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: "bold" }}>Village / locality</label>
        <input value={village} onChange={(e) => setVillage(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button onClick={onBack} style={{ padding: 12, background: "#6B7280", color: "white", border: "none", borderRadius: 6 }}>← Back</button>
        <div style={{ flex: 1 }} />
        <button onClick={handleNext} style={{ padding: 12, background: "#2563EB", color: "white", border: "none", borderRadius: 6 }}>
          Next →
        </button>
      </div>
    </div>
  );
}
