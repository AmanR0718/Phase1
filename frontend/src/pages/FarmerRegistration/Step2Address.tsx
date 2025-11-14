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
  const [streetVillage, setStreetVillage] = useState(data?.street_village || "");
  const [postalCode, setPostalCode] = useState(data?.postal_code || "");
  const [gpsLatitude, setGpsLatitude] = useState(data?.gps_latitude || "");
  const [gpsLongitude, setGpsLongitude] = useState(data?.gps_longitude || "");

  const [provinceOther, setProvinceOther] = useState("");
  const [districtOther, setDistrictOther] = useState("");
  const [chiefdomOther, setChiefdomOther] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (provinceCode && provinceCode !== "OTHER") {
      loadDistricts(provinceCode);
    } else {
      setDistricts([]);
      setDistrictCode("");
    }
  }, [provinceCode]);

  // Load chiefdoms when district changes
  useEffect(() => {
    if (districtCode && districtCode !== "OTHER") {
      loadChiefdoms(districtCode);
    } else {
      setChiefdoms([]);
      setChiefdomCode("");
    }
  }, [districtCode]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const res = await geoService.provinces();
      setProvinces(res || []);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      setErr("Failed to load provinces. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    try {
      const res = await geoService.districts(provinceCode);
      setDistricts(res || []);
    } catch (error) {
      console.error("Failed to load districts:", error);
      setDistricts([]);
    }
  };

  const loadChiefdoms = async (districtCode: string) => {
    try {
      const res = await geoService.chiefdoms(districtCode);
      setChiefdoms(res || []);
    } catch (error) {
      console.error("Failed to load chiefdoms:", error);
      setChiefdoms([]);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLatitude(position.coords.latitude.toString());
          setGpsLongitude(position.coords.longitude.toString());
          setErr("");
        },
        (error) => {
          setErr("Unable to get location. Please enter manually.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setErr("Geolocation is not supported by your browser");
    }
  };

  const handleNext = () => {
    if (!provinceCode) {
      setErr("Please select a province");
      return;
    }
    if (!districtCode) {
      setErr("Please select a district");
      return;
    }
    if (!village) {
      setErr("Please enter village/locality name");
      return;
    }

    const province =
      provinceCode === "OTHER"
        ? { province_name: provinceOther }
        : provinces.find((p) => p.province_id === provinceCode) || { province_name: "" };

    const district =
      districtCode === "OTHER"
        ? { district_name: districtOther }
        : districts.find((d) => d.district_id === districtCode) || { district_name: "" };

    const chiefdom =
      chiefdomCode === "OTHER"
        ? { chiefdom_name: chiefdomOther }
        : chiefdoms.find((c) => c.chiefdom_id === chiefdomCode) || { chiefdom_name: "" };

    setErr("");
    onNext({
      province_code: provinceCode,
      province_name: province.province_name,
      district_code: districtCode,
      district_name: district.district_name,
      chiefdom_code: chiefdomCode || "",
      chiefdom_name: chiefdom.chiefdom_name || "",
      village,
      street_village: streetVillage,
      postal_code: postalCode,
      gps_latitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
      gps_longitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
    });
  };

  return (
    <div>
      <h3 style={{ color: "#1F2937", marginBottom: "20px" }}>📍 Address & Location</h3>

      {err && (
        <div
          style={{
            background: "#FEE2E2",
            color: "#DC2626",
            padding: 12,
            borderRadius: 6,
            marginBottom: 15,
          }}
        >
          ⚠️ {err}
        </div>
      )}

      {/* Province */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Province *
        </label>
        <select
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          disabled={loading}
        >
          <option value="">-- Select province --</option>
          {provinces.map((p) => (
            <option key={p.province_id} value={p.province_id}>
              {p.province_name}
            </option>
          ))}
          <option value="OTHER">Other (specify)</option>
        </select>

        {provinceCode === "OTHER" && (
          <input
            type="text"
            placeholder="Enter province name"
            value={provinceOther}
            onChange={(e) => setProvinceOther(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
            }}
          />
        )}
      </div>

      {/* District */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          District *
        </label>
        <select
          value={districtCode}
          onChange={(e) => setDistrictCode(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          disabled={!provinceCode || provinceCode === "OTHER"}
        >
          <option value="">-- Select district --</option>
          {districts.map((d) => (
            <option key={d.district_id} value={d.district_id}>
              {d.district_name}
            </option>
          ))}
          <option value="OTHER">Other (specify)</option>
        </select>

        {districtCode === "OTHER" && (
          <input
            type="text"
            placeholder="Enter district name"
            value={districtOther}
            onChange={(e) => setDistrictOther(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
            }}
          />
        )}
      </div>

      {/* Chiefdom */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Chiefdom (optional)
        </label>
        <select
          value={chiefdomCode}
          onChange={(e) => setChiefdomCode(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          disabled={!districtCode || districtCode === "OTHER"}
        >
          <option value="">-- Select chiefdom (optional) --</option>
          {chiefdoms.map((c) => (
            <option key={c.chiefdom_id} value={c.chiefdom_id}>
              {c.chiefdom_name}
            </option>
          ))}
          <option value="OTHER">Other (specify)</option>
        </select>

        {chiefdomCode === "OTHER" && (
          <input
            type="text"
            placeholder="Enter chiefdom name"
            value={chiefdomOther}
            onChange={(e) => setChiefdomOther(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
            }}
          />
        )}
      </div>

      {/* Village and Street */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Village / Locality *
          </label>
          <input
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Enter village name"
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
            Street / Village Detail
          </label>
          <input
            value={streetVillage}
            onChange={(e) => setStreetVillage(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Postal Code */}
      <div style={{ marginBottom: 15 }}>
        <label style={{ fontWeight: "600", display: "block", marginBottom: 6 }}>
          Postal Code (optional)
        </label>
        <input
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 16,
          }}
          placeholder="e.g., 10101"
        />
      </div>

      {/* GPS Coordinates */}
      <div style={{ marginBottom: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <label style={{ fontWeight: "600" }}>GPS Coordinates (optional)</label>
          <button
            type="button"
            onClick={handleGetLocation}
            style={{
              padding: "6px 12px",
              background: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            📍 Get Current Location
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <input
            value={gpsLatitude}
            onChange={(e) => setGpsLatitude(e.target.value)}
            style={{
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Latitude"
            type="number"
            step="any"
          />
          <input
            value={gpsLongitude}
            onChange={(e) => setGpsLongitude(e.target.value)}
            style={{
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 16,
            }}
            placeholder="Longitude"
            type="number"
            step="any"
          />
        </div>
      </div>

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