import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [restaurantProfile, setRestaurantProfile] = useState(null)

  // Genera un sonido de notificación usando Web Audio API
  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.warn('Audio no disponible:', e)
    }
  }

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

  // ===== NOTIFICACIONES =====
  // MOVER AQUÍ antes del useEffect que las usa
  const prevUnreadCount = useRef(null)

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications()
      const payload = data?.data?.data ?? data?.data ?? data
      const notifList = Array.isArray(payload) ? payload : []
      const newUnread = data?.unread_count ?? notifList.filter(n => !n.is_read && !n.read_at).length

      // Reproducir sonido si hay notificaciones nuevas
      if (prevUnreadCount.current !== null && newUnread > prevUnreadCount.current) {
        playNotificationSound()
      }
      prevUnreadCount.current = newUnread

      setNotifications(notifList)
      setUnreadCount(newUnread)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }, [])

  // ===== EFECTO PRINCIPAL =====
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [ordersRes, productsRes, categoriesRes, profileRes] = await Promise.all([
          fetchJson('/api/restaurant/orders'),
          fetchJson('/api/restaurant/products?paginate=false'),
          fetchJson('/api/restaurant/categories'),
          fetchJson('/api/restaurant/profile'),
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

        if (profileRes?.data) {
          setRestaurantProfile(profileRes.data)
        }
      } catch (error) {
        console.error('Error al cargar datos del restaurante:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    loadNotifications() // ✅ Ahora loadNotifications está definida

    // Polling de notificaciones cada 30 segundos
    const pollingInterval = setInterval(() => {
      loadNotifications()
    }, 30000)

    return () => clearInterval(pollingInterval)
  }, [user]) // ✅ loadNotifications NO está en dependencias porque es estable

  // ===== HANDLERS =====
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

  const handleEditProduct = async (id, formData) => {
    try {
      let options = { method: 'PUT' }
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
      const res = await fetchJson(`/api/restaurant/products/${id}`, options)
      if (res?.data) {
        const p = res.data
        setMenu(prev => prev.map(item => item.id === id ? {
          ...item,
          name:              p.name,
          description:       p.description,
          price:             Number(p.price),
          img:               p.image || item.img,
          category:          p.category?.name || item.category,
          category_id:       p.category_id,
          stock:             p.stock,
          prep_time_minutes: p.prep_time_minutes,
        } : item))
        setToast('Producto actualizado')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      console.error('Error al editar producto:', error)
      setToast('Error al editar el producto')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleToggleAvailability = async (id) => {
    setMenu(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
    try {
      await fetchJson(`/api/restaurant/products/${id}/toggle-availability`, { method: 'PATCH' })
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
      setMenu(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
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
    handleEditProduct,
    handleToggleAvailability,
    restaurantProfile,
    searchQuery,
    setSearchQuery,
  }
}