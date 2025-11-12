// frontend/src/services/geo.service.ts
import axios from "axios";

function resolveBaseURL(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase) {
    // Ensure it ends with /api (exactly once)
    return envBase.endsWith("/api") ? envBase : `${envBase.replace(/\/$/, "")}/api`;
  }

  const { host, protocol } = window.location;
  const isCodespace = /\.app\.github\.dev$/.test(host);
  if (isCodespace) {
    const target = host.replace("-5173.", "-8000.");
    return `${protocol}//${target}/api`;
  }

  return `${protocol}//localhost:8000/api`;
}

const API_BASE = resolveBaseURL();

const geoService = {
  async provinces() {
    const { data } = await axios.get(`${API_BASE}/geo/provinces`);
    return data;
  },
  async districts(province_id?: string) {
    const { data } = await axios.get(`${API_BASE}/geo/districts`, {
      params: province_id ? { province_id } : {},
    });
    return data;
  },
  async chiefdoms(district_id?: string) {
    const { data } = await axios.get(`${API_BASE}/geo/chiefdoms`, {
      params: district_id ? { district_id } : {},
    });
    return data;
  },
};

export default geoService;
