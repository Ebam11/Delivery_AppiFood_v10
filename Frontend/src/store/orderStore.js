// Archivo: src/store/orderStore.js | Comentario: logica principal del modulo.
import { create } from 'zustand';
import {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
} from '../api/orders';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  selectedOrder: null,
  isLoading: false,
  error: null,

  // Obtener órdenes del usuario
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrders();
      set({ orders: response.data || response, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener órdenes';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Obtener detalle de orden (alias para fetchOrderById)
  fetchOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrderById(id);
      set({ currentOrder: response.data, selectedOrder: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener orden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Obtener detalle de orden
  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrderById(id);
      set({ currentOrder: response.data, selectedOrder: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener orden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Crear nueva orden
  createNewOrder: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createOrder(formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar un poco
      // Refrescar lista de órdenes
      const ordersResponse = await getOrders();
      set({ orders: ordersResponse.data || ordersResponse, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear orden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Cancelar orden
  cancelOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cancelOrder(id);
      // Refrescar orden si está seleccionada
      if (this.selectedOrder?.id === id) {
        const updatedOrder = await getOrderById(id);
        set({ selectedOrder: updatedOrder.data });
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cancelar orden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Limpiar selección
  clearSelected: () => set({ selectedOrder: null }),

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
