// Frontend/src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos reales
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [restaurantsReport, setRestaurantsReport] = useState([]);
  const [usersReport, setUsersReport] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [toast, setToast] = useState(null);


  // Función para cargar datos según tab activa
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard': {
          const response = await adminApi.getDashboard();
          setStats(response.data);
          break;
        }
        case 'restaurants': {
          const response = await adminApi.getRestaurants(filters);
          setRestaurants(response.data || []);
          setPagination(response.meta || {});
          break;
        }
        case 'users': {
          const response = await adminApi.getUsers(filters);
          setUsers(response.data || []);
          setPagination(response.meta || {});
          break;
        }
        case 'orders': {
          const response = await adminApi.getOrders(filters);
          setOrders(response.data || []);
          setPagination(response.meta || {});
          break;
        }
        case 'reviews': {
          const response = await adminApi.getReviews(filters);
          setReviews(response.data || []);
          setPagination(response.meta || {});
          break;
        }
        case 'reports': {
          setReportsLoading(true);
          setReportsError(null);
          try {
            const [sales, restaurants, users] = await Promise.all([
              adminApi.getSalesReport(),
              adminApi.getRestaurantsReport(),
              adminApi.getUsersReport(),
            ]);
            setSalesReport(sales.data || sales);
            setRestaurantsReport(restaurants.data || restaurants);
            setUsersReport(users.data || users);
          } catch (err) {
            setReportsError('Error al cargar los reportes');
          } finally {
            setReportsLoading(false);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  // Cargar al cambiar de tab o filtros
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== ACCIONES =====
  
  // Usuarios
  const toggleUserStatus = async (id) => {
    try {
      await adminApi.toggleUserStatus(id);
      await loadData();
      showToast('Estado de usuario actualizado');
    } catch (error) {
      showToast('Error al actualizar usuario', 'error');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await adminApi.deleteUser(id);
      await loadData();
      showToast('Usuario eliminado');
    } catch (error) {
      showToast('Error al eliminar usuario', 'error');
    }
  };

  // Restaurantes
  const verifyRestaurant = async (id) => {
    try {
      await adminApi.verifyRestaurant(id);
      await loadData();
      showToast('Estado de verificación actualizado');
    } catch (error) {
      showToast('Error al verificar restaurante', 'error');
    }
  };

  const toggleRestaurantStatus = async (id) => {
    try {
      await adminApi.toggleRestaurantStatus(id);
      await loadData();
      showToast('Estado de restaurante actualizado');
    } catch (error) {
      showToast('Error al actualizar restaurante', 'error');
    }
  };

  const deleteRestaurant = async (id) => {
    if (!confirm('¿Eliminar este restaurante?')) return;
    try {
      await adminApi.deleteRestaurant(id);
      await loadData();
      showToast('Restaurante eliminado');
    } catch (error) {
      showToast('Error al eliminar restaurante', 'error');
    }
  };

  // Órdenes
  const updateOrderStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      await loadData();
      showToast('Estado de orden actualizado');
    } catch (error) {
      showToast('Error al actualizar orden', 'error');
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    try {
      await adminApi.deleteOrder(id);
      await loadData();
      showToast('Orden eliminada');
    } catch (error) {
      showToast('Error al eliminar orden', 'error');
    }
  };

  // Reviews
  const toggleReviewVisibility = async (id) => {
    try {
      await adminApi.toggleReviewVisibility(id);
      await loadData();
      showToast('Visibilidad actualizada');
    } catch (error) {
      showToast('Error al actualizar review', 'error');
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('¿Eliminar esta review?')) return;
    try {
      await adminApi.deleteReview(id);
      await loadData();
      showToast('Review eliminada');
    } catch (error) {
      showToast('Error al eliminar review', 'error');
    }
  };

  // Toast
  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    // Estado
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    loading,
    stats,
    restaurants,
    users,
    orders,
    reviews,
    pagination,
    filters,
    toast,
    
    // Acciones
    showToast,
    loadData,
    updateFilters,
    
    // CRUD Usuarios
    toggleUserStatus,
    deleteUser,
    
    // CRUD Restaurantes
    verifyRestaurant,
    toggleRestaurantStatus,
    deleteRestaurant,
    
    // CRUD Órdenes
    updateOrderStatus,
    deleteOrder,
    
    // CRUD Reviews
    toggleReviewVisibility,
    deleteReview,
    
    // Reportes
    salesReport,
    restaurantsReport,
    usersReport,
    reportsLoading,
    reportsError,
  };
}