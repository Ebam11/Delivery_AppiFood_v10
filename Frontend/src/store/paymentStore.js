import { create } from 'zustand';
import {
  createPayment as apiCreatePayment,
  confirmPayment,
  getPaymentMethods,
  getPaymentStatus,
} from '../api/payment';

export const usePaymentStore = create((set) => ({
  payment: null,
  paymentMethods: [],
  loading: false,
  error: null,

  createPayment: async (orderId, paymentMethod = 'co_pse_bank') => {
    set({ loading: true, error: null });
    try {
      const response = await apiCreatePayment(orderId, paymentMethod);
      set({ payment: response.data ?? response, loading: false });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear pago';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Confirmar pago después del callback
  confirmPaymentStatus: async (transactionId, referenceCode) => {
    set({ loading: true, error: null });
    try {
      const response = await confirmPayment(transactionId, referenceCode);
      set({ payment: response.data ?? response, loading: false });
      return response.data ?? response;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al confirmar pago';
      set({ error: message, loading: false });
      throw error;
    }
  },


  // Obtener métodos de pago
  fetchPaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getPaymentMethods();
      set({ paymentMethods: response.data || response, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener métodos de pago';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Verificar estado de pago
  checkPaymentStatus: async (paymentId) => {
    try {
      const response = await getPaymentStatus(paymentId);
      set({ payment: response.data });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al verificar pago';
      set({ error: message });
      throw error;
    }
  },

  // Limpiar errores
  clearError: () => set({ error: null }),

  // Limpiar pago
  clearPayment: () => set({ payment: null }),
}));
