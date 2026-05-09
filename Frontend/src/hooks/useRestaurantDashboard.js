import { useState, useEffect } from 'react'
import { fetchJson } from '../api/fetchJson'
import { INITIAL_ORDERS, INITIAL_MENU } from '../data/restaurantDashboardData'

/**
 * Hook personalizado para manejar la lógica del Panel del Restaurante.
 */
export function useRestaurantDashboard(user) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [menu, setMenu] = useState(INITIAL_MENU)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast] = useState(null)

  // Mapeo de datos del servidor a formato local
  const mapOrder = (order) => {
    const items = Array.isArray(order?.items)
      ? order.items.map((item) => ({
          name: item.product?.name || item.name || 'Producto',
          qty: item.quantity || item.qty || 1,
          price: Number(item.unit_price ?? item.price ?? 0),
        }))
      : []

    const createdAt = order?.created_at ? new Date(order.created_at) : null

    return {
      id: order?.id ? `#ORD${order.id}` : `#ORD-${Date.now()}`,
      idRaw: order?.id,
      date: createdAt ? createdAt.toISOString().slice(0, 10) : '',
      time: createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      customer: order?.user?.name || order?.customer_name || 'Cliente',
      type: order?.delivery_address ? 'Online' : 'Dine-In',
      amount: Number(order?.total || 0),
      status: order?.status || 'pending',
      address: order?.delivery_address || '-',
      items,
    }
  }

  // Carga de datos iniciales
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [ordersRes, statsRes] = await Promise.all([
          fetchJson('/api/restaurant/orders'),
          fetchJson('/api/restaurant/dashboard/stats')
        ])

        if (ordersRes?.data) {
          const mapped = ordersRes.data.map(mapOrder)
          setOrders(mapped.length > 0 ? mapped : INITIAL_ORDERS)
        }
        
        if (statsRes) setStats(statsRes)
      } catch (error) {
        console.error('Error al cargar datos del restaurante:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Actualizar estado de una orden
  const handleStatusChange = async (orderId, newStatus) => {
    const rawId = orderId.replace('#ORD', '')
    
    // Actualización optimista
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }))

    try {
      await fetchJson(`/api/restaurant/orders/${rawId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      })
      
      setToast(`Pedido ${orderId} actualizado a ${newStatus}`)
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      // Revertir en caso de error (opcional para simplicidad de "junior")
    }
  }

  return {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    orders,
    menu,
    stats,
    loading,
    selectedOrder,
    setSelectedOrder,
    toast,
    handleStatusChange
  }
}
