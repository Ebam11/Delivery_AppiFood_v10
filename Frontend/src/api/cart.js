// Archivo: src/api/cart.js | Comentario: logica principal del modulo.
import client from './client';

// Obtener carrito
export const getCart = async () => {
  const response = await client.get('/cart');
  return response.data;
};

// Agregar item al carrito
export const addItem = async (data) => {
  const response = await client.post('/cart/items', data);
  return response.data;
};

// Actualizar cantidad de item
export const updateItem = async (itemId, data) => {
  const response = await client.put(`/cart/items/${itemId}`, data);
  return response.data;
};

// Eliminar item del carrito
export const removeItem = async (itemId) => {
  const response = await client.delete(`/cart/items/${itemId}`);
  return response.data;
};

// Vaciar carrito
export const clearCart = async () => {
  const response = await client.delete('/cart');
  return response.data;
};
