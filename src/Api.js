import axios from "axios";

const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl) return "/api/v1";

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