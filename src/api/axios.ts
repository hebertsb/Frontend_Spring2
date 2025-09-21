import axios from "axios";

// Función helper para construir la URL base correctamente
const getBaseURL = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Asegurar que termina con /api/ sin duplicar
  const cleanUrl = apiUrl.replace(/\/+$/, ''); // Remover slashes finales
  return `${cleanUrl}/api/`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos timeout
});

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
    const token = localStorage.getItem("access");
    console.log('🔐 AXIOS: Token encontrado en localStorage:', token ? 'SÍ' : 'NO');
    if (token) {
      console.log('🔐 AXIOS: Enviando token:', token.substring(0, 50) + '...');
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('🔐 AXIOS: No hay token disponible');
    }
  }
  
  // Log del payload si es POST/PUT/PATCH
  if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
    console.log('📦 AXIOS: Payload enviado:', JSON.stringify(config.data, null, 2));
  }
  
  return config;
});

// Interceptor de respuesta para capturar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🚨 AXIOS: Error interceptado');
    console.log('🚨 AXIOS: Status:', error.response?.status);
    console.log('🚨 AXIOS: StatusText:', error.response?.statusText);
    console.log('🚨 AXIOS: URL:', error.config?.url);
    console.log('🚨 AXIOS: Method:', error.config?.method);
    console.log('🚨 AXIOS: Headers enviados:', error.config?.headers);
    
    if (error.response?.status === 401) {
      console.log('🚨 AXIOS: Error 401 - Token inválido o expirado');
      // Aquí podrías agregar lógica para renovar el token automáticamente
    }
    
    return Promise.reject(error);
  }
);

export default api;
