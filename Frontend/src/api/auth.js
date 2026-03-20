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

// Obtener usuario actual
export const getCurrentUser = async () => {
  const response = await client.get('/user');
  return response.data;
};
