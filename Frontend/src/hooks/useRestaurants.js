import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { isRestaurantOpenNow } from '../components/ScheduleDisplay'

/**
 * Hook para manejar la lógica de la página de exploración de restaurantes.
 */
export function useRestaurants() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuthStore()
  const { favorites, fetchFavorites, isFavorite, toggleFavorite } = useFavoritesStore()
  const [budgetInput, setBudgetInput] = useState('')
  
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('all') // 'all', 'free', 'cheap'
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'fast' (<= 30 min), 'under45' (<= 45 min)
  const [ratingFilter, setRatingFilter] = useState('all') // 'all', '4plus', '45plus'

  // Normalización
  const normalizeRestaurant = (r) => {
    const sched = r.schedule || r.schedules || []
    const isOpen = r.isOpen ?? (sched.length > 0 ? isRestaurantOpenNow(sched) : (r.is_active !== false))
    
    return {
      ...r,
      image: r.banner || r.logo || r.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900',
      rating: Number(r.average_rating ?? r.rating ?? 0),
      delivery: Number(r.delivery_cost ?? r.delivery ?? 0),
      time: r.delivery_time_min ? `${r.delivery_time_min}-${r.delivery_time_max || r.delivery_time_min + 10} min` : (r.time || '20-30 min'),
      isOpen,
      categories: Array.isArray(r.categories) ? r.categories.map(c => typeof c === 'string' ? c : c.name) : [r.category].filter(Boolean)
    }
  }

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchJson('/restaurants?paginate=false')
        const items = Array.isArray(data) ? data : data.data || []
        setRestaurants(items.map(normalizeRestaurant).sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || b.rating - a.rating))
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Sincronizar búsqueda desde URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('q') || '')
  }, [location.search])

  // Filtrado
// Filtrado
const filteredRestaurants = useMemo(() => {
  return restaurants.filter(r => {
    // Filtros rápidos superiores
    if (filter === 'promo' && r.delivery > 0) return false
    if (filter === 'rating' && r.rating < 4.5) return false
    if (filter === 'favorites' && !favorites.includes(r.id)) return false

    // Filtro de Categoría
    if (selectedCategory) {
      const sel = selectedCategory.toLowerCase()
      if (!r.categories.some(c => c.toLowerCase().includes(sel))) return false
    }

    // Búsqueda de Texto
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false
    }

    // Filtro Avanzado de Costo de Envío
    if (deliveryFilter === 'free' && r.delivery > 0) return false
    if (deliveryFilter === 'cheap' && r.delivery > 3000) return false

    // Filtro Avanzado de Tiempo de Entrega
    if (timeFilter === 'fast') {
      const maxTime = r.delivery_time_max || (r.delivery_time_min ? r.delivery_time_min + 10 : 30)
      if (maxTime > 30) return false
    }
    if (timeFilter === 'under45') {
      const maxTime = r.delivery_time_max || (r.delivery_time_min ? r.delivery_time_min + 10 : 45)
      if (maxTime > 45) return false
    }

    // Filtro Avanzado de Calificación
    if (ratingFilter === '4plus' && r.rating < 4.0) return false
    if (ratingFilter === '45plus' && r.rating < 4.5) return false

    // Filtro de presupuesto por minimum_order
    if (budgetInput && !isNaN(Number(budgetInput))) {
      const budget = Number(budgetInput)
      const minOrder = Number(r.minimum_order ?? 0)
      if (minOrder > budget) return false
    }

    return true
  })
}, [restaurants, filter, selectedCategory, searchQuery, favorites, deliveryFilter, timeFilter, ratingFilter, budgetInput])


  const handleFavoriteToggle = async (id) => {
    if (!token) return navigate('/login')
    await toggleFavorite(id, token)
  }

  return {
    restaurants: filteredRestaurants,
    allRestaurants: restaurants,
    loading,
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    handleFavoriteToggle,
    isFavorite,
    navigate,
    deliveryFilter,
    setDeliveryFilter,
    timeFilter,
    setTimeFilter,
    ratingFilter,
    setRatingFilter,
    budgetInput,
    setBudgetInput
  }
}
