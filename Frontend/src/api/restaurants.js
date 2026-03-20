// Archivo: src/api/restaurants.js | Comentario: logica principal del modulo.
import client from './client';

// Obtener todos los restaurantes
export const getRestaurants = async () => {
  const response = await client.get('/restaurants');
  return response.data;
};

// Obtener detalle de un restaurante
export const getRestaurantById = async (id) => {
  const response = await client.get(`/restaurants/${id}`);
  return response.data;
};

// Obtener reseñas de un restaurante
export const getRestaurantReviews = async (restaurantId) => {
  const response = await client.get(`/restaurants/${restaurantId}/reviews`);
  return response.data;
};

// Crear reseña (requiere autenticación)
export const createReview = async (restaurantId, data) => {
  const response = await client.post(`/restaurants/${restaurantId}/reviews`, data);
  return response.data;
};

// Obtener productos de un restaurante
export const getRestaurantProducts = async (restaurantId) => {
  const response = await client.get(`/restaurants/${restaurantId}/products`);
  return response.data;
};
