import axios, { AxiosError } from "axios";
import useAuthStore from "@/store/authStore";

// ===============================
// ✅ Robust Codespaces-safe baseURL setup
// ===============================
let API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `https://${process.env.CODESPACE_NAME
    ? `${process.env.CODESPACE_NAME}-8000.app.github.dev`
    : "localhost:8000"}/api`;

// Ensure trailing /api
if (!API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "") + "/api";
}

// Fallback for some dev containers
if (API_BASE_URL.startsWith("https://localhost")) {
  API_BASE_URL = "http://127.0.0.1:8000/api";
}

if (import.meta.env.DEV) {
  console.log("🔧 [axios] Using API_BASE_URL:", API_BASE_URL);
}

// ===============================
// Axios instance
// ===============================
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ===============================
// Request Interceptor
// ===============================
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || useAuthStore.getState().token;
    if (token && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// Response Interceptor (Auto Refresh)
// ===============================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refresh_token") ||
        useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.assign("/login");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = res.data;
        localStorage.setItem("token", access_token);
        const { setToken } = useAuthStore.getState();
        setToken(access_token);

        isRefreshing = false;
        onTokenRefreshed(access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        const { logout } = useAuthStore.getState();
        logout();
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
