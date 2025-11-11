import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const geoService = {
  async provinces() {
    const { data } = await axios.get(`${API_BASE}/api/geo/provinces`);
    return data;
  },

  async districts(province_id?: string) {
    const { data } = await axios.get(`${API_BASE}/api/geo/districts`, {
      params: province_id ? { province_id } : {},
    });
    return data;
  },

  async chiefdoms(district_id?: string) {
    const { data } = await axios.get(`${API_BASE}/api/geo/chiefdoms`, {
      params: district_id ? { district_id } : {},
    });
    return data;
  },
};

export default geoService;
