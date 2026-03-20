// Archivo: src/api/orders.js | Comentario: logica principal del modulo.
import client from './client';

// Obtener órdenes del usuario
export const getOrders = async () => {
  const response = await client.get('/orders');
  return response.data;
};

// Obtener detalle de una orden
export const getOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data;
};

// Crear orden
export const createOrder = async (data) => {
  const response = await client.post('/orders', data);
  return response.data;
};

// Cancelar orden
export const cancelOrder = async (id) => {
  const response = await client.patch(`/orders/${id}/cancel`);
  return response.data;
};
