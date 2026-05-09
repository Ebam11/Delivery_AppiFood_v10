import { useState, useEffect } from 'react'
import { RESTAURANTS, USERS, ORDERS } from '../data/adminDashboardData'

/**
 * Hook para manejar la lógica del Panel de Administración Global.
 */
export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [restaurants, setRestaurants] = useState(RESTAURANTS)
  const [users, setUsers] = useState(USERS)
  const [orders, setOrders] = useState(ORDERS)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    restaurants,
    setRestaurants,
    users,
    setUsers,
    orders,
    toast,
    showToast
  }
}
