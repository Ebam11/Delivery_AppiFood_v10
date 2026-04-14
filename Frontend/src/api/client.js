// Archivo: src/api/client.js | Comentario: logica principal del modulo.
import axios from 'axios';
import { API_URL } from './config';

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

// Interceptor para agregar token de autenticación
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar autenticación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = client;
export default client;
