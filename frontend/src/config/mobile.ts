const trimTrailingSlashes = (url: string) => url.replace(/\/+$/, "");

export const getApiBaseUrl = (): string => {
  const isCapacitor = !!(window as any).Capacitor;
  const env = import.meta.env;
  const configuredUrl = isCapacitor
    ? env.VITE_MOBILE_API_URL || env.VITE_API_PROD_URL || env.VITE_API_BASE_URL
    : env.VITE_API_BASE_URL || env.VITE_API_PROD_URL || env.VITE_MOBILE_API_URL;

  if (configuredUrl) return trimTrailingSlashes(configuredUrl);
  if (import.meta.env.DEV) return "http://localhost:8000";

  throw new Error(
    "API URL is not configured. Set VITE_API_BASE_URL, VITE_API_PROD_URL, or VITE_MOBILE_API_URL before building."
  );
};

export const getApiEndpoint = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, "");
  return `${getApiBaseUrl()}/api/${cleanPath}`;
};

export const mobileConfig = {
  getApiBaseUrl,
  getApiEndpoint,
  isProduction: () => import.meta.env.PROD,
  isDevelopment: () => import.meta.env.DEV,
};

export default mobileConfig;
