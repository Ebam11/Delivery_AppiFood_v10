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
  const favorites = useFavoritesStore(s => s.favorites)
  const fetchFavorites = useFavoritesStore(s => s.fetchFavorites)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const isFavorite = (id) => favorites.includes(Number(id))

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

  // Coordenadas del usuario obtenidas de localStorage ('selected_delivery_coords')
  const [userCoords, setUserCoords] = useState(() => {
    try {
      const stored = localStorage.getItem('selected_delivery_coords')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.lat && parsed?.lng) {
          return { lat: Number(parsed.lat), lng: Number(parsed.lng), label: parsed.label }
        }
      }
    } catch (e) {
      console.error('Error parsing selected_delivery_coords:', e)
    }
    // Ubicación por defecto de Popayán
    return { lat: 2.4448, lng: -76.6147 }
  })

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const stored = localStorage.getItem('selected_delivery_coords')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.lat && parsed?.lng) {
            setUserCoords({ lat: Number(parsed.lat), lng: Number(parsed.lng), label: parsed.label })
          }
        }
      } catch (e) {
        console.error('Error parsing selected_delivery_coords:', e)
      }
    }
    
    // Escuchar el evento personalizado de Header.jsx cuando se guarda la ubicación
    window.addEventListener('delivery-address-updated', handleLocationChange)
    // Sincronizar también si cambia de página
    handleLocationChange()
    
    return () => window.removeEventListener('delivery-address-updated', handleLocationChange)
  }, [location])

  // Fórmula de Haversine para calcular distancia en kilómetros
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Filtrado y Ordenación por Cercanía (Distancia)
  const filteredRestaurants = useMemo(() => {
    let result = restaurants.map(r => {
      // Calcular distancia para cada restaurante
      const rLat = r.latitude ?? r.lat
      const rLng = r.longitude ?? r.lng
      const distance = calculateDistance(userCoords.lat, userCoords.lng, rLat, rLng)
      return {
        ...r,
        distance // Distancia en km
      }
    }).filter(r => {
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
      
      // Filtro de presupuesto manual
      if (budgetInput && !isNaN(Number(budgetInput))) {
        const budget = Number(budgetInput)
        const minOrder = Number(r.minimum_order ?? 0)
        if (minOrder > budget) return false
      }

      return true
    })

    // Clasificar y ordenar por cercanía (los más cercanos primero). 
    // Los abiertos tienen prioridad de visibilidad pero ordenados por distancia dentro de su estado.
    return result.sort((a, b) => {
      if (a.isOpen !== b.isOpen) {
        return Number(b.isOpen) - Number(a.isOpen)
      }
      // Si ambos están abiertos o cerrados, ordenar por distancia (menor a mayor)
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return 0
    })
  }, [restaurants, filter, selectedCategory, searchQuery, favorites, deliveryFilter, timeFilter, ratingFilter, budgetInput, userCoords])

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
    setBudgetInput,
    userLocationLabel: userCoords?.label || 'Popayán, Cauca'
  }
}
