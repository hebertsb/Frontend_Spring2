import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/",
});

// Helper to set token programmatically
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    if (typeof window !== "undefined") localStorage.setItem("authToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") localStorage.removeItem("authToken");
  }
}

// Request interceptor as a fallback in case token was set directly in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        // Optional: force reload to redirect to login if app handles it on mount
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
