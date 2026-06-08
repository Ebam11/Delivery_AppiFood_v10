// Archivo: src/api/client.js | Comentario: logica principal del modulo.
import axios from 'axios';
import { API_URL } from './config';
import { logError, logInfo } from '../services/logService';

// Crear instancia de axios
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // The app uses Bearer tokens, so cookies are not required.
  // Keeping this false avoids CORS credential mismatches.
  withCredentials: false,
});

// Estado para evitar múltiples requests de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Interceptor para agregar token de autenticación
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores y refresh token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No reintentar si es error 401 en login o refresh
    if (
      error.response?.status !== 401 ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    // Si ya estamos refrescando, esperar
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        logInfo('No refresh token disponible, redirigiendo a login');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      logInfo('Renovando token de acceso');

      // Hacer request de refresh (usar axios directo para evitar interceptores)
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data.data || response.data;

      // Guardar nuevos tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      logInfo('Token renovado exitosamente');

      // Reintentar request original
      originalRequest.headers.Authorization = `Bearer ${access_token}`;

      processQueue(null, access_token);

      return client(originalRequest);
    } catch (refreshError) {
      logError('Error renovando token', { error: refreshError.message });

      // Limpiar tokens y redirigir
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');

      processQueue(refreshError, null);

      window.location.href = '/login';

      return Promise.reject(refreshError);
    }
  }
);

export const api = client;
export default client;
