import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const client = axios.create({ baseURL: API_BASE });

export async function login(username, password) {  // Remove apiBase parameter
  const res = await client.post("/api/auth/login", { username, password });
  return res.data;
}

export async function getFarmers(token, skip = 0, limit = 20) {
  const res = await client.get(`/api/farmers?skip=${skip}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createFarmer(token, payload) {
  const res = await client.post("/api/farmers/", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function syncBatch(token, payload) {
  const res = await client.post("/api/sync/batch", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function uploadPhoto(token, farmerId, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await client.post(`/api/farmers/${farmerId}/upload-photo`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getFarmerById(token, farmerId) {
  const res = await client.get(`/api/farmers/${farmerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}