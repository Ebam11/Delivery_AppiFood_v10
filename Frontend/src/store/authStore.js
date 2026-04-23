// Archivo: src/store/authStore.js
import { create } from 'zustand';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

function normalizeUserRole(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return rawUser;
  const role = String(rawUser.role ?? rawUser.rol ?? 'customer').toLowerCase();
  return { ...rawUser, role };
}

function loadUserFromStorage() {
  try {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    return normalizeUserRole(JSON.parse(saved));
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: loadUserFromStorage(),   // ← antes era null siempre
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(email, password);
      const token = response.data?.token || response.token;
      const rawUser = response.user || response.data?.user;
      const user = normalizeUserRole(rawUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isLoading: false });
  },

  setUser: (rawUser) => {
    const user = normalizeUserRole(rawUser);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  clearError: () => set({ error: null }),
}));