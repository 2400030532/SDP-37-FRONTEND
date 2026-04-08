import axios from "axios";

const DEFAULT_RENDER_API_BASE_URL = "https://sdp-37-backend-1.onrender.com/api/v1";

const resolveDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") return "/api/v1";

  const host = window.location.hostname;
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0";

  return isLocalHost ? "/api/v1" : DEFAULT_RENDER_API_BASE_URL;
};

const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl) return resolveDefaultApiBaseUrl();

  const trimmed = String(rawUrl).replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return `${trimmed}/v1`;
  }

  return trimmed;
};

const API = axios.create({
  baseURL: normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  ),
});

API.interceptors.request.use((config) => {
  const requestUrl = String(config.url || "");
  const isPublicAuthRequest =
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/signup") ||
    requestUrl.includes("/status/");

  if (isPublicAuthRequest) {
    if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = localStorage.getItem("easyintern_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;