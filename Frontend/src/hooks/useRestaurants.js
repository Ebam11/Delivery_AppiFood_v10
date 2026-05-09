import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'
import { isRestaurantOpenNow } from '../components/ScheduleDisplay'

/**
 * Hook para manejar la lógica de la página de exploración de restaurantes.
 */
export function useRestaurants() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuthStore()
  const { favorites, fetchFavorites, isFavorite, toggleFavorite } = useFavoritesStore()
  
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

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
        const source = items.length > 0 ? items : MOCK_RESTAURANTS
        setRestaurants(source.map(normalizeRestaurant).sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || b.rating - a.rating))
      } catch (err) {
        setRestaurants(MOCK_RESTAURANTS.map(normalizeRestaurant))
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
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      if (filter === 'promo' && r.delivery > 4000) return false
      if (filter === 'rating' && r.rating < 4.5) return false
      if (filter === 'favorites' && !favorites.includes(r.id)) return false
      
      if (selectedCategory) {
        const sel = selectedCategory.toLowerCase()
        if (!r.categories.some(c => c.toLowerCase().includes(sel))) return false
      }
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false
      }
      
      return true
    })
  }, [restaurants, filter, selectedCategory, searchQuery, favorites])

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
    navigate
  }
}
