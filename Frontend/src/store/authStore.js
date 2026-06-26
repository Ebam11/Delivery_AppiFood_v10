// Archivo: src/store/authStore.js | Comentario: logica principal del modulo.
import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isLoading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(email, password);
      const token = response.data?.token || response.token;
      localStorage.setItem('token', token);
      set({ token, user: response.user || response.data?.user, isLoading: false });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  
  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('theme'); // ← limpiar tema al cerrar sesión
    set({ token: null, user: null, isLoading: false });
  },

  // Establecer usuario
  setUser: (user) => set({ user }),

  // Establecer token
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
