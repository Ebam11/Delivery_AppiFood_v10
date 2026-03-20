// Archivo: src/store/restaurantStore.js | Comentario: logica principal del modulo.
import { create } from 'zustand';
import { getRestaurants, getRestaurantById } from '../api/restaurants';

export const useRestaurantStore = create((set) => ({
  restaurants: [],
  selectedRestaurant: null,
  isLoading: false,
  error: null,

  // Obtener todos los restaurantes
  fetchRestaurants: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRestaurants();
      set({ restaurants: response.data || response, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener restaurantes';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Obtener detalle de un restaurante
  fetchRestaurantById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRestaurantById(id);
      set({ selectedRestaurant: response.data || response, isLoading: false });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener restaurante';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Limpiar selección
  clearSelected: () => set({ selectedRestaurant: null }),

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
