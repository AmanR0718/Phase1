import React, { useEffect, useState } from "react";
import { getFarmers, createFarmer, uploadPhoto } from "../api";
import { provinces, getDistrictsForProvince } from "../data/zambiaLocations";

export default function Farmers({ apiBase, token }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [detail, setDetail] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getFarmers(apiBase, token);
      setFarmers(data.results || []);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitNew(e) {
    e.preventDefault();
    const f = e.target;
    const payload = {
      personal_info: {
        first_name: f.first_name.value,
        last_name: f.last_name.value,
        phone_primary: f.phone_primary.value,
      },
      address: {
        province: f.province.value,
        district: f.district.value,
      },
    };
    setMsg("");
    try {
      const created = await createFarmer(apiBase, token, payload);
      setFarmers([created, ...farmers]);
      setShowNew(false);
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handlePhotoUpload(e, farmerId) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(apiBase, token, farmerId, file);
      setMsg("Photo uploaded");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="view">
      <div className="toolbar">
        <button onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancel" : "New Farmer"}
        </button>
        <button onClick={load} className="secondary">
          Refresh
        </button>
      </div>

      {showNew && (
        <div className="panel">
          <h3>New Farmer</h3>
          <form onSubmit={submitNew}>
            <label>
              First name <input name="first_name" required />
            </label>
            <label>
              Last name <input name="last_name" required />
            </label>
            <label>
              Phone <input name="phone_primary" required />
            </label>
            <label>
              Province
              <select
                name="province"
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedDistrict("");
                }}
                required
              >
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
                name="district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedProvince}
                required
              >
                <option value="">Select District</option>
                {selectedProvince &&
                  getDistrictsForProvince(selectedProvince).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </label>
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      <div id="farmers-list">
        {loading && <div>Loading...</div>}
        {!loading && farmers.length === 0 && <div>No farmers yet</div>}
        {farmers.map((f) => (
          <div key={f.farmer_id || f.temp_id} className="card">
            <strong>
              {f.personal_info?.first_name} {f.personal_info?.last_name}
            </strong>
            <div>Phone: {f.personal_info?.phone_primary}</div>
            <div>Farmer ID: {f.farmer_id || "—"}</div>
            <div>Province: {f.address?.province}</div>
            <div style={{ marginTop: 8 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, f.farmer_id)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="message">{msg}</div>
    </div>
  );
}
