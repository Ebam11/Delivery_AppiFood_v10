    // Frontend/src/services/adminApi.js
    import { fetchJson } from '../api/fetchJson';

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    export const adminApi = {
    // ===== DASHBOARD =====
    getDashboard: () => fetchJson(`${API_URL}/admin/dashboard`),

    // ===== USUARIOS =====
    getUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${API_URL}/admin/users${query ? `?${query}` : ''}`);
    },
    getUser: (id) => fetchJson(`${API_URL}/admin/users/${id}`),
    updateUser: (id, data) => 
        fetchJson(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
        }),
    toggleUserStatus: (id) => 
        fetchJson(`${API_URL}/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
    deleteUser: (id) => 
        fetchJson(`${API_URL}/admin/users/${id}`, { method: 'DELETE' }),

    // ===== RESTAURANTES =====
    getRestaurants: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${API_URL}/admin/restaurants${query ? `?${query}` : ''}`);
    },
    getRestaurant: (id) => fetchJson(`${API_URL}/admin/restaurants/${id}`),
    verifyRestaurant: (id) => 
        fetchJson(`${API_URL}/admin/restaurants/${id}/verify`, { method: 'PATCH' }),
    toggleRestaurantStatus: (id) => 
        fetchJson(`${API_URL}/admin/restaurants/${id}/toggle-status`, { method: 'PATCH' }),
    deleteRestaurant: (id) => 
        fetchJson(`${API_URL}/admin/restaurants/${id}`, { method: 'DELETE' }),

    // ===== ÓRDENES =====
    getOrders: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${API_URL}/admin/orders${query ? `?${query}` : ''}`);
    },
    getOrder: (id) => fetchJson(`${API_URL}/admin/orders/${id}`),
    updateOrderStatus: (id, status) =>
        fetchJson(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
        }),
    deleteOrder: (id) =>
        fetchJson(`${API_URL}/admin/orders/${id}`, { method: 'DELETE' }),

    // ===== REVIEWS =====
    getReviews: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${API_URL}/admin/reviews${query ? `?${query}` : ''}`);
    },
    toggleReviewVisibility: (id) =>
        fetchJson(`${API_URL}/admin/reviews/${id}/toggle-visibility`, { method: 'PATCH' }),
    deleteReview: (id) =>
        fetchJson(`${API_URL}/admin/reviews/${id}`, { method: 'DELETE' }),

    // ===== REPORTES =====
    getSalesReport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${API_URL}/admin/reports/sales${query ? `?${query}` : ''}`);
    },
    getRestaurantsReport: () => 
        fetchJson(`${API_URL}/admin/reports/restaurants`),
    getUsersReport: () => 
        fetchJson(`${API_URL}/admin/reports/users`),

        // ===== NOTIFICACIONES =====
    getNotifications: () =>
        fetchJson(`${API_URL}/notifications`),
    markNotificationRead: (id) =>
        fetchJson(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' }),
    markAllNotificationsRead: () =>
        fetchJson(`${API_URL}/notifications/read-all`, { method: 'PATCH' }),
    deleteNotification: (id) =>
        fetchJson(`${API_URL}/notifications/${id}`, { method: 'DELETE' }),

    // ===== NOTIFICACIONES BROADCAST (admin) =====
    broadcastNotification: (data) =>
        fetchJson(`${API_URL}/admin/notifications/broadcast`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getNotificationHistory: () =>
        fetchJson(`${API_URL}/admin/notifications/history`),
    };