import axios from "axios";

// Función helper para construir la URL base correctamente
const getBaseURL = () => {
  const apiUrlRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Remover slashes finales
  const apiUrl = apiUrlRaw.replace(/\/+$/, '');
  // Si la URL ya contiene '/api' al final, no agregamos otra vez
  if (/\/api(\/?$)/i.test(apiUrl)) {
    return apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
  }
  return `${apiUrl}/api/`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos timeout
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
  // Limpiar URL para evitar doble slash
  if (config.url) {
    config.url = config.url.replace(/^\/+/, ''); // Remover slashes iniciales
  }
  
  console.log('🌐 AXIOS: Configuración de request');
  console.log('🌐 AXIOS: BaseURL:', config.baseURL);
  console.log('🌐 AXIOS: URL solicitada:', config.url);
  console.log('🌐 AXIOS: URL completa:', (config.baseURL || '') + (config.url || ''));
  console.log('🌐 AXIOS: Método:', config.method?.toUpperCase());
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log('🔐 AXIOS: Enviando token:', token.substring(0, 50) + '...');
      config.headers = config.headers || {};
      config.headers.Authorization = `Token ${token}`;
    }
  }
  
  // Log del payload si es POST/PUT/PATCH
  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
    console.log('📦 AXIOS: Payload enviado:', JSON.stringify(config.data, null, 2));
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
