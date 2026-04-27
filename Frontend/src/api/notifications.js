// Archivo: src/api/notifications.js | Comentario: logica principal del modulo.
import client from './client';

export const getNotifications = async () => {
  const response = await client.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await client.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await client.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await client.delete(`/notifications/${notificationId}`);
  return response.data;
};