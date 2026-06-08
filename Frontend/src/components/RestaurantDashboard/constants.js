/**
 * Constantes compartidas del Dashboard de Restaurante.
 * Centraliza colores y datos de actividad que antes estaban en restaurantDashboardData.
 */
export const COLORS = {
  primary: '#FF4B3E',
  primaryLight: '#FFF0EE',
  secondary: '#1E293B',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

export const ACTIVITY = [
  { icon: '🛒', name: 'Nuevo pedido', action: 'Pedido #1042 recibido', time: 'Hace 5 min' },
  { icon: '⭐', name: 'Nueva reseña', action: 'Carlos G. dejó 5 estrellas', time: 'Hace 12 min' },
  { icon: '📦', name: 'Pedido entregado', action: 'Pedido #1039 completado', time: 'Hace 25 min' },
  { icon: '🍕', name: 'Producto agotado', action: 'Pizza Hawaiana sin stock', time: 'Hace 1h' },
];
