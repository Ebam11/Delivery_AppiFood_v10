import { useState, useEffect, useCallback } from 'react'
import { fetchJson } from '../api/fetchJson'
import { INITIAL_ORDERS, INITIAL_MENU } from '../data/restaurantDashboardData'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../api/notifications'


export function useRestaurantDashboard(user) {
  const [activeTab, setActiveTab]         = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orders, setOrders]               = useState(INITIAL_ORDERS)
  const [menu, setMenu]                   = useState(INITIAL_MENU)
  const [categories, setCategories]       = useState([])
  const [stats, setStats]                 = useState(null)
  const [loading, setLoading]             = useState(true)
  const [menuLoading, setMenuLoading]     = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  // ─── Mappers ────────────────────────────────────────────────────────────────

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

  const mapProduct = (product) => ({
    id:          product.id,
    name:        product.name        || '',
    description: product.description || '',
    price:       Number(product.price ?? 0),
    img:         product.image_url   || product.img || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    category:    product.category    || null,
    category_id: product.category_id || null,
    active:      product.is_available ?? product.active ?? true,
    rating:      Number(product.rating ?? 0),
    orders:      Number(product.orders_count ?? product.orders ?? 0),
  })

  // ─── Carga inicial ───────────────────────────────────────────────────────────

  const loadMenu = useCallback(async () => {
    setMenuLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchJson('/api/restaurant/products'),
        fetchJson('/api/restaurant/categories'),
      ])

      if (Array.isArray(productsRes?.data)) {
        const mapped = productsRes.data.map(mapProduct)
        setMenu(mapped.length > 0 ? mapped : INITIAL_MENU)
      }

      if (Array.isArray(categoriesRes?.data)) {
        setCategories(categoriesRes.data)
      }
    } catch (error) {
      console.error('Error al cargar menú:', error)
    } finally {
      setMenuLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      setLoading(true)
      try {
        const [ordersRes, statsRes] = await Promise.all([
          fetchJson('/api/restaurant/orders'),
          fetchJson('/api/restaurant/dashboard'),
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
    loadMenu()
    loadNotifications() //nueva linea para cargar notificaciones al iniciar el dashboard
  }, [user])

  // ─── Toast helper ────────────────────────────────────────────────────────────

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Handlers de menú ───────────────────────────────────────────────────────

  /**
   * Crea un producto. Si form.file existe, primero sube la imagen.
   */
  const handleAddProduct = async (form) => {
    try {
      let imageUrl = form.img || null

      // Subir imagen si el usuario seleccionó un archivo
      if (form.file instanceof File) {
        const formData = new FormData()
        formData.append('file', form.file)
        const uploadRes = await fetchJson('/api/upload', {
          method: 'POST',
          body: formData,
        })
        imageUrl = uploadRes?.url || uploadRes?.path || imageUrl
      }

      // Si eligió crear categoría nueva, primero crearla
      let categoryId = form.category_id
      if (form.isNewCat && form.newCategoryName?.trim()) {
        const catRes = await fetchJson('/api/restaurant/categories', {
          method: 'POST',
          body: { name: form.newCategoryName.trim() },
        })
        categoryId = catRes?.data?.id || catRes?.id
        // Actualizar lista de categorías localmente
        if (catRes?.data) setCategories(prev => [...prev, catRes.data])
      }

      const body = {
        name:         form.name,
        description:  form.description || '',
        price:        Number(form.price),
        category_id:  categoryId || null,
        image_url:    imageUrl,
        is_available: true,
      }

      const res = await fetchJson('/api/restaurant/products', {
        method: 'POST',
        body,
      })

      const newProduct = mapProduct(res?.data || res)
      setMenu(prev => [newProduct, ...prev])
      showToast(`"${newProduct.name}" agregado al menú`)
    } catch (error) {
      console.error('Error al agregar producto:', error)
      showToast('Error al agregar el producto')
    }
  }

  /**
   * Edita un producto existente.
   */
  const handleEditProduct = async (id, form) => {
    try {
      let imageUrl = form.img || null

      if (form.file instanceof File) {
        const formData = new FormData()
        formData.append('file', form.file)
        const uploadRes = await fetchJson('/api/upload', {
          method: 'POST',
          body: formData,
        })
        imageUrl = uploadRes?.url || uploadRes?.path || imageUrl
      }

      const body = {
        name:        form.name,
        description: form.description || '',
        price:       Number(form.price),
        category_id: form.category_id || null,
        ...(imageUrl && { image_url: imageUrl }),
      }

      const res = await fetchJson(`/api/restaurant/products/${id}`, {
        method: 'PUT',
        body,
      })

      const updated = mapProduct(res?.data || res)
      setMenu(prev => prev.map(p => p.id === id ? updated : p))
      showToast(`"${updated.name}" actualizado`)
    } catch (error) {
      console.error('Error al editar producto:', error)
      showToast('Error al editar el producto')
    }
  }

  /**
   * Elimina un producto con actualización optimista.
   */
  const handleDeleteProduct = async (id) => {
    const previous = menu
    setMenu(prev => prev.filter(p => p.id !== id))

    try {
      await fetchJson(`/api/restaurant/products/${id}`, { method: 'DELETE' })
      showToast('Producto eliminado')
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      setMenu(previous) // revertir
      showToast('Error al eliminar el producto')
    }
  }

  /**
   * Activa / desactiva disponibilidad de un producto.
   */
  const handleToggleAvailability = async (id) => {
    setMenu(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
    try {
      await fetchJson(`/api/restaurant/products/${id}/toggle-availability`, { method: 'PATCH' })
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
      setMenu(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
    }
  }

  // ─── Handler de órdenes ──────────────────────────────────────────────────────

  const handleStatusChange = async (orderId, newStatus) => {
    const rawId = orderId.replace('#ORD', '')
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }))

    try {
      await fetchJson(`/api/restaurant/orders/${rawId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      })
      showToast(`Pedido ${orderId} → ${newStatus}`)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    }
  }

  // ─── Notificaciones ──────────────────────────────────────────────────────────

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

const handleNotifRead = async (id) => {
  try {
    await markNotificationAsRead(id)
    await loadNotifications()
  } catch (error) {
    console.error('Error al marcar notificación:', error)
  }
}

const handleNotifDelete = async (id) => {
  // Actualización optimista
  setNotifications(prev => prev.filter(n => n.id !== id))
  setUnreadCount(prev => Math.max(0, prev - 1))
  try {
    await deleteNotification(id)
  } catch (error) {
    console.error('Error al eliminar notificación:', error)
    await loadNotifications() // revertir
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
    menuLoading,
    selectedOrder,    setSelectedOrder,
    toast,
    handleStatusChange,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleAvailability,
    notifications,
    unreadCount,
    handleNotifRead,
    handleNotifDelete,
    handleNotifMarkAll,
  }
}