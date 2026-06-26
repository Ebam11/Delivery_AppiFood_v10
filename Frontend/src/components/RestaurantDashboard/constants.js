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
  { icon: '🛒', nameKey: 'rd.activity.new_order', actionKey: 'rd.activity.order_received', timeKey: 'rd.activity.time_5min' },
  { icon: '⭐', nameKey: 'rd.activity.new_review', actionKey: 'rd.activity.review_5_stars', timeKey: 'rd.activity.time_12min' },
  { icon: '📦', nameKey: 'rd.activity.order_delivered', actionKey: 'rd.activity.order_completed', timeKey: 'rd.activity.time_25min' },
  { icon: '🍕', nameKey: 'rd.activity.product_out_of_stock', actionKey: 'rd.activity.pizza_hawaiana_out', timeKey: 'rd.activity.time_1h' },
]
