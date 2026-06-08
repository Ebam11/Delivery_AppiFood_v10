import { useState, useEffect } from 'react'
import { fetchJson } from '../api/fetchJson'

/**
 * Hook para manejar la lógica del Panel de Administración Global.
 */
export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true)
        const [usersRes, restRes, ordersRes] = await Promise.all([
          fetchJson('/api/admin/users'),
          fetchJson('/api/admin/restaurants'),
          fetchJson('/api/admin/orders')
        ]).catch(() => [null, null, null])

        if (usersRes?.data) setUsers(usersRes.data)
        else if (Array.isArray(usersRes)) setUsers(usersRes)

        if (restRes?.data) setRestaurants(restRes.data)
        else if (Array.isArray(restRes)) setRestaurants(restRes)

        if (ordersRes?.data) setOrders(ordersRes.data)
        else if (Array.isArray(ordersRes)) setOrders(ordersRes)
        
      } catch (error) {
        console.error('Error loading admin data', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

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
    showToast,
    loading
  }
}
