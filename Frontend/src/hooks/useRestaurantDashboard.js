import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { useRestaurantOrderNotifications } from './useOrderRealtime'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../api/notifications'

export function useRestaurantDashboard(user) {
  const token = useAuthStore((s) => s.token)
  const [activeTab, setActiveTab]         = useState(() => localStorage.getItem('rd_active_tab') || 'dashboard')
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

  // Persistir pestaña activa actual al cambiar
  useEffect(() => {
    localStorage.setItem('rd_active_tab', activeTab)
  }, [activeTab])

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

  // Notificaciones en tiempo real: detectar nuevos pedidos cada 20s
  useRestaurantOrderNotifications(!!user, (newOrders) => {
    setOrders(prev => [
      ...newOrders.map(mapOrder),
      ...prev,
    ])
    const count = newOrders.length
    setToast({
      type: 'success',
      message: `🍽️ ${count} nuevo${count > 1 ? 's' : ''} pedido${count > 1 ? 's' : ''} recibido${count > 1 ? 's' : ''}`,
    })
    setTimeout(() => setToast(null), 5000)
    // Refrescar notificaciones del backend
    loadNotifications()
  })

  // ===== HELPERS DE CACHÉ LOCAL =====
  const CACHE_KEYS = {
    menu: 'rd_cache_menu',
    categories: 'rd_cache_categories',
    profile: 'rd_cache_profile',
    orders: 'rd_cache_orders',
  }

  const readCache = (key) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      // Caché válida por 10 minutos máximo
      if (Date.now() - ts > 10 * 60 * 1000) return null
      return data
    } catch { return null }
  }

  const writeCache = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
    } catch { /* localStorage lleno, ignorar */ }
  }

  // ===== MAPPER DE PRODUCTOS =====
  const mapProduct = (p) => ({
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
  })

  const parseCategories = (categoriesRes) => {
    if (!categoriesRes) return []
    if (Array.isArray(categoriesRes)) return categoriesRes
    if (categoriesRes && typeof categoriesRes === 'object') {
      const d = categoriesRes.data
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.data)) return d.data
    }
    return []
  }

  // ===== EFECTO PRINCIPAL (con caché instantánea) =====
  useEffect(() => {
    if (!user || !token) return

    // 1) Cargar datos de caché inmediatamente (aparecen al instante)
    const cachedMenu = readCache(CACHE_KEYS.menu)
    const cachedCats = readCache(CACHE_KEYS.categories)
    const cachedProfile = readCache(CACHE_KEYS.profile)
    const cachedOrders = readCache(CACHE_KEYS.orders)

    let hasCache = false
    if (cachedMenu && cachedMenu.length > 0) {
      setMenu(cachedMenu)
      hasCache = true
    }
    if (cachedCats && cachedCats.length > 0) {
      setCategories(cachedCats)
      hasCache = true
    }
    if (cachedProfile) {
      setRestaurantProfile(cachedProfile)
    }
    if (cachedOrders && cachedOrders.length > 0) {
      setOrders(cachedOrders)
    }

    // Si hay caché, quitamos el loading inmediatamente para que se vea al instante
    if (hasCache) setLoading(false)

    // 2) Revalidar en segundo plano con datos frescos del servidor
    const revalidate = async () => {
      if (!hasCache) setLoading(true)

      const safeFetch = async (url) => {
        try {
          return await fetchJson(url)
        } catch (err) {
          console.error(`Error cargando [${url}]:`, err)
          return null
        }
      }

      const [ordersRes, productsRes, categoriesRes, profileRes] = await Promise.all([
        safeFetch('/api/restaurant/orders'),
        safeFetch('/api/restaurant/products?paginate=false'),
        safeFetch('/api/restaurant/categories?paginate=false'),
        safeFetch('/api/restaurant/profile'),
      ])

      if (ordersRes?.data) {
        const mapped = ordersRes.data.map(mapOrder)
        setOrders(mapped)
        writeCache(CACHE_KEYS.orders, mapped)
      }

      if (productsRes) {
        const items = Array.isArray(productsRes) ? productsRes : productsRes.data || []
        const mapped = items.map(mapProduct)
        setMenu(mapped)
        writeCache(CACHE_KEYS.menu, mapped)
      }

      if (categoriesRes) {
        const cats = parseCategories(categoriesRes)
        setCategories(cats)
        writeCache(CACHE_KEYS.categories, cats)
      }

      if (profileRes?.data) {
        setRestaurantProfile(profileRes.data)
        writeCache(CACHE_KEYS.profile, profileRes.data)
      }

      setLoading(false)
    }

    revalidate()
    loadNotifications()

    // Polling de notificaciones cada 30 segundos
    const pollingInterval = setInterval(() => {
      loadNotifications()
    }, 30000)

    return () => clearInterval(pollingInterval)
  }, [user, token])

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

  const getAuthOptions = (method, isMultipart = false, bodyData = null) => {
    const token = useAuthStore.getState().token
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const options = { method, headers }
    if (bodyData) {
      options.body = bodyData
    }
    return options
  }

  const handleAddProduct = async (formData) => {
    // Generar preview de imagen si hay archivo
    const tempImg = formData.file ? URL.createObjectURL(formData.file) : ''
    const catName = categories.find(c => String(c.id) === String(formData.category_id))?.name || 'Otro'
    const tempId = `temp_${Date.now()}`

    // 1) OPTIMISTA: Insertar el plato al instante con ID temporal
    const optimisticItem = {
      id:                tempId,
      name:              formData.name,
      description:       formData.description || '',
      price:             Number(formData.price),
      img:               tempImg,
      category:          catName,
      category_id:       formData.category_id,
      stock:             formData.stock !== '' ? Number(formData.stock) : null,
      prep_time_minutes: formData.prep_time_minutes !== '' ? Number(formData.prep_time_minutes) : null,
      active:            true,
      rating:            0,
      orders:            0,
      _saving:           true, // Flag para mostrar indicador de guardado
    }

    setMenu(prev => [optimisticItem, ...prev])
    setToast('Guardando plato...')

    try {
      let isMultipart = false
      let body = null

      if (formData.file) {
        isMultipart = true
        body = new FormData()
        body.append('name', formData.name)
        body.append('price', formData.price)
        if (formData.description) body.append('description', formData.description)
        if (formData.category_id) body.append('category_id', formData.category_id)
        if (formData.stock !== '' && formData.stock != null) body.append('stock', formData.stock)
        if (formData.prep_time_minutes !== '' && formData.prep_time_minutes != null) {
          body.append('prep_time_minutes', formData.prep_time_minutes)
        }
        body.append('image', formData.file)
      } else {
        body = {
          name:              formData.name,
          price:             formData.price,
          description:       formData.description || null,
          category_id:       formData.category_id,
          stock:             formData.stock !== '' ? formData.stock : null,
          prep_time_minutes: formData.prep_time_minutes !== '' ? formData.prep_time_minutes : null,
        }
      }

      // 2) Enviar al servidor
      const options = getAuthOptions('POST', isMultipart, body)
      const res = await fetchJson('/api/restaurant/products', options)

      if (res?.data) {
        const realItem = mapProduct(res.data)
        // 3) Reemplazar el item temporal por el real del servidor
        setMenu(prev => {
          const updated = prev.map(p => p.id === tempId ? realItem : p)
          writeCache(CACHE_KEYS.menu, updated)
          return updated
        })
        setToast('✅ Producto añadido con éxito')
        setTimeout(() => setToast(null), 3000)
      } else {
        // Si no hay data, quitar el optimista
        setMenu(prev => prev.filter(p => p.id !== tempId))
        setToast('Error: no se recibió respuesta del servidor')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (error) {
      console.error('Error al agregar producto:', error)
      // REVERTIR: quitar el item optimista
      setMenu(prev => prev.filter(p => p.id !== tempId))
      setToast('Error al agregar el producto')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDeleteProduct = async (id) => {
    try {
      const options = getAuthOptions('DELETE')
      await fetchJson(`/api/restaurant/products/${id}`, options)
      setMenu(prev => {
        const updated = prev.filter(p => p.id !== id)
        writeCache(CACHE_KEYS.menu, updated)
        return updated
      })
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
      let isMultipart = false
      let body = null

      if (formData.file) {
        isMultipart = true
        body = new FormData()
        body.append('name', formData.name)
        body.append('price', formData.price)
        if (formData.description) body.append('description', formData.description)
        if (formData.category_id) body.append('category_id', formData.category_id)
        if (formData.stock !== '' && formData.stock != null) body.append('stock', formData.stock)
        if (formData.prep_time_minutes !== '' && formData.prep_time_minutes != null) {
          body.append('prep_time_minutes', formData.prep_time_minutes)
        }
        body.append('image', formData.file)
      } else {
        body = {
          name:              formData.name,
          price:             formData.price,
          description:       formData.description || null,
          category_id:       formData.category_id,
          stock:             formData.stock !== '' ? formData.stock : null,
          prep_time_minutes: formData.prep_time_minutes !== '' ? formData.prep_time_minutes : null,
        }
      }

      const options = getAuthOptions('PUT', isMultipart, body)
      const res = await fetchJson(`/api/restaurant/products/${id}`, options)
      if (res?.data) {
        const p = res.data
        setMenu(prev => {
          const updated = prev.map(item => item.id === id ? {
            ...item,
            name:              p.name,
            description:       p.description,
            price:             Number(p.price),
            img:               p.image || item.img,
            category:          p.category?.name || item.category,
            category_id:       p.category_id,
            stock:             p.stock,
            prep_time_minutes: p.prep_time_minutes,
          } : item)
          writeCache(CACHE_KEYS.menu, updated)
          return updated
        })
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
    setMenu(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
      writeCache(CACHE_KEYS.menu, updated)
      return updated
    })
    try {
      const options = getAuthOptions('PATCH')
      await fetchJson(`/api/restaurant/products/${id}/toggle-availability`, options)
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
      setMenu(prev => {
        const reverted = prev.map(p => p.id === id ? { ...p, active: !p.active } : p)
        writeCache(CACHE_KEYS.menu, reverted)
        return reverted
      })
    }
  }

  // ===== HANDLERS DE PERFIL =====
  // Se llaman desde RestaurantInfoSection tras guardar exitosamente

  const handleProfileSaved = (updatedData) => {
    setRestaurantProfile(prev => ({ ...prev, ...updatedData }))
    writeCache(CACHE_KEYS.profile, { ...(restaurantProfile || {}), ...updatedData })
  }

  const handleLogoSaved = (logoUrl) => {
    setRestaurantProfile(prev => prev ? { ...prev, logo: logoUrl } : prev)
    writeCache(CACHE_KEYS.profile, { ...(restaurantProfile || {}), logo: logoUrl })
  }

  const handleBannerSaved = (bannerUrl) => {
    setRestaurantProfile(prev => prev ? { ...prev, banner: bannerUrl } : prev)
    writeCache(CACHE_KEYS.profile, { ...(restaurantProfile || {}), banner: bannerUrl })
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
    handleProfileSaved,
    handleLogoSaved,
    handleBannerSaved,
  }
}