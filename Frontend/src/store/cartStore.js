// Archivo: src/store/cartStore.js | Comentario: logica principal del modulo.
import { create } from 'zustand';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../api/cart';

export const useCartStore = create((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  // Obtener carrito
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCart();
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener carrito';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Agregar item al carrito
  addItemToCart: async (restaurantId, productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await addItem({
        restaurant_id: restaurantId,
        product_id: productId,
        quantity,
      });
      // Refrescar carrito
      const cartResponse = await getCart();
      set({ cart: cartResponse.data, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al agregar item';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Actualizar cantidad
  updateItemQuantity: async (itemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      await updateItem(itemId, { quantity });
      const response = await getCart();
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar item';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Eliminar item
  removeItemFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await removeItem(itemId);
      const response = await getCart();
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar item';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Vaciar carrito
  clearCartItems: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearCart();
      set({ cart: null, isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Error al vaciar carrito';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
