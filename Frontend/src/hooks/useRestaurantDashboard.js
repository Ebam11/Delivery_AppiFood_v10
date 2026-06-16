import { useState, useEffect, useCallback } from 'react'
import { fetchJson } from '../api/fetchJson'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../api/notifications'

export function useRestaurantDashboard(user) {
  const [activeTab, setActiveTab]         = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orders, setOrders]               = useState([])
  const [menu, setMenu]                   = useState([])
  const [categories, setCategories]       = useState([])
  const [stats, setStats]                 = useState(null)
  const [loading, setLoading]             = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const mapOrder = (order) => {
    const items = Array.isArray(order?.items)
      ? order.items.map((item) => ({
          name:  item.product?.name || item.name || 'Producto',
          qty:   item.quantity || item.qty || 1,
          price: Number(item.unit_price ?? item.price ?? 0),
        }))
      : []
    const createdAt = order?.created_at ? new Date(order.created_at) : null
    return {
      id:       order?.id ? `#ORD${order.id}` : `#ORD-${Date.now()}`,
      idRaw:    order?.id,
      date:     createdAt ? createdAt.toISOString().slice(0, 10) : '',
      time:     createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      customer: order?.user?.name || order?.customer_name || 'Cliente',
      type:     order?.delivery_address ? 'Online' : 'Dine-In',
      amount:   Number(order?.total || 0),
      status:   order?.status || 'pending',
      address:  order?.delivery_address || '-',
      items,
    }
  }

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications()
      const payload = data?.data?.data ?? data?.data ?? data
      setNotifications(Array.isArray(payload) ? payload : [])
      setUnreadCount(data?.unread_count ?? 0)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [ordersRes, productsRes, categoriesRes] = await Promise.all([
          fetchJson('/api/restaurant/orders'),
          fetchJson('/api/restaurant/products?paginate=false'),
          fetchJson('/api/restaurant/categories')
        ])

        if (ordersRes?.data) {
          setOrders(ordersRes.data.map(mapOrder))
        }

        if (productsRes) {
          const items = Array.isArray(productsRes) ? productsRes : productsRes.data || []
          setMenu(items.map(p => ({
            id:                p.id,
            name:              p.name,
            description:       p.description,
            price:             Number(p.price),
            img:               p.image || '',
            category:          p.category?.name || 'Otro',
            category_id:       p.category_id,
            stock:             p.stock,
            prep_time_minutes: p.prep_time_minutes,
            active:            p.is_available ?? true,
            rating:            p.rating ?? 0,
            orders:            p.sales_count ?? 0,
          })))
        }

        if (categoriesRes) {
          const cats = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []
          setCategories(cats)
        }
      } catch (error) {
        console.error('Error al cargar datos del restaurante:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    loadNotifications()
  }, [user])

  const handleStatusChange = async (orderId, newStatus) => {
    const rawId = orderId.replace('#ORD', '')
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
    }
  }

  const handleAddProduct = async (formData) => {
    try {
      let options = { method: 'POST' }
      if (formData.file) {
        const body = new FormData()
        body.append('name', formData.name)
        body.append('price', formData.price)
        if (formData.description) body.append('description', formData.description)
        if (formData.category_id) body.append('category_id', formData.category_id)
        if (formData.stock !== '' && formData.stock != null) body.append('stock', formData.stock)
        if (formData.prep_time_minutes !== '' && formData.prep_time_minutes != null) {
          body.append('prep_time_minutes', formData.prep_time_minutes)
        }
        body.append('image', formData.file)
        options.body = body
      } else {
        options.body = {
          name:              formData.name,
          price:             formData.price,
          description:       formData.description || null,
          category_id:       formData.category_id,
          stock:             formData.stock !== '' ? formData.stock : null,
          prep_time_minutes: formData.prep_time_minutes !== '' ? formData.prep_time_minutes : null,
        }
      }
      const res = await fetchJson('/api/restaurant/products', options)
      if (res?.data) {
        const p = res.data
        setMenu(prev => [...prev, {
          id:                p.id,
          name:              p.name,
          description:       p.description,
          price:             Number(p.price),
          img:               p.image || '',
          category:          p.category?.name || 'Otro',
          category_id:       p.category_id,
          stock:             p.stock,
          prep_time_minutes: p.prep_time_minutes,
          active:            p.is_available ?? true,
          rating:            0,
          orders:            0,
        }])
        setToast('Producto añadido con éxito')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      console.error('Error al agregar producto:', error)
      setToast('Error al agregar el producto')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      await fetchJson(`/api/restaurant/products/${id}`, { method: 'DELETE' })
      setMenu(prev => prev.filter(p => p.id !== id))
      setToast('Producto eliminado')
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      setToast('Error al eliminar el producto')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleNotifRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      await loadNotifications()
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const handleNotifDelete = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try {
      await deleteNotification(id)
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      await loadNotifications()
    }
  }

  const handleNotifMarkAll = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error al marcar todas:', error)
    }
  }

  return {
    activeTab,        setActiveTab,
    isSidebarOpen,    setIsSidebarOpen,
    orders,
    menu,
    categories,
    stats,
    loading,
    selectedOrder,    setSelectedOrder,
    toast,
    handleStatusChange,
    handleAddProduct,
    handleDeleteProduct,
    notifications,
    unreadCount,
    handleNotifRead,
    handleNotifDelete,
    handleNotifMarkAll,
  }
}