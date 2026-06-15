import { useState, useEffect } from 'react'
import { fetchJson } from '../api/fetchJson'


/**
 * Hook personalizado para manejar la lógica del Panel del Restaurante.
 */
export function useRestaurantDashboard(user) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
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
    const [ordersRes, productsRes, categoriesRes] = await Promise.all([
      fetchJson('/api/restaurant/orders'),
      fetchJson('/api/restaurant/products?paginate=false'),
      fetchJson('/api/restaurant/categories')
    ])

    if (ordersRes?.data) {
      const mapped = ordersRes.data.map(mapOrder)
      setOrders(mapped)
    }

    if (productsRes) {
      const items = Array.isArray(productsRes) ? productsRes : productsRes.data || []
      setMenu(items.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        img: p.image || '',
        category: p.category?.name || 'Otro',
        category_id: p.category_id,
        stock: p.stock,
        prep_time_minutes: p.prep_time_minutes,
        active: p.is_available ?? true,
        rating: p.rating ?? 0,
        orders: p.sales_count ?? 0,
      })))
    }

    if (categoriesRes) {
      console.log('categoriesRes:', JSON.stringify(categoriesRes))
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

const handleAddProduct = async (formData) => {
    try {
      let body
      let options = { method: 'POST' }

      if (formData.file) {
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
        options.body = body
      } else {
        options.body = {
          name: formData.name,
          price: formData.price,
          description: formData.description || null,
          category_id: formData.category_id,
          stock: formData.stock !== '' ? formData.stock : null,
          prep_time_minutes: formData.prep_time_minutes !== '' ? formData.prep_time_minutes : null,
        }
      }

      const res = await fetchJson('/api/restaurant/products', options)

      if (res?.data) {
        const p = res.data
        setMenu(prev => [...prev, {
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          img: p.image || '',
          category: p.category?.name || 'Otro',
          category_id: p.category_id,
          stock: p.stock,
          prep_time_minutes: p.prep_time_minutes,
          active: p.is_available ?? true,
          rating: 0,
          orders: 0,
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
      console.error('Error al eliminar producto', error)
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
    categories,
    handleStatusChange,
    handleAddProduct,
    handleDeleteProduct
  }
}
