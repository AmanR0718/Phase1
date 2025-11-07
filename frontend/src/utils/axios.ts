import axios, { AxiosError } from "axios";
import useAuthStore from "@/store/authStore";

// ===============================
// ✅ Robust Codespaces-safe baseURL setup
// ===============================
let API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `https://${process.env.CODESPACE_NAME ? `${process.env.CODESPACE_NAME}-8000.app.github.dev` : "localhost:8000"}/api`;

// Always ensure it ends with /api
if (!API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "") + "/api";
}

console.log("DEBUG API_BASE_URL:", API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// Request Interceptor
// ===============================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// Response Interceptor (Auto Refresh)
// ===============================
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken =
        localStorage.getItem("refresh_token") ||
        useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const response = await axiosClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          });
          const { access_token } = response.data;
          localStorage.setItem("token", access_token);

          // Update Zustand store
          const { setToken } = useAuthStore.getState();
          setToken(access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosClient(originalRequest);
        } catch (err) {
          const { logout } = useAuthStore.getState();
          logout();
          window.location.href = "/login";
        }
      } else {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
