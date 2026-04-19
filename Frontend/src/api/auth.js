// Archivo: src/api/auth.js | Comentario: logica principal del modulo.
import client from './client';

// Registro
export const register = async (data) => {
  const response = await client.post('/auth/register', data);
  return response.data;
};

// Login
export const login = async (email, password) => {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await client.post('/auth/logout');
  return response.data;
};

// Enviar enlace de recuperación de contraseña
export const sendPasswordResetLink = async (email) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data;
};

// Restablecer contraseña con token
export const resetPassword = async (data) => {
  const response = await client.post('/auth/reset-password', data);
  return response.data;
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  const response = await client.get('/me');
  return response.data;
};
