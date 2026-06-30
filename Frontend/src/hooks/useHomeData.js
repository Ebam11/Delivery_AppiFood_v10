import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'

/**
 * Hook para manejar la lógica y los datos de la página de inicio.
 */
export function useHomeData() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const favorites = useFavoritesStore(s => s.favorites)
  const fetchFavorites = useFavoritesStore(s => s.fetchFavorites)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const isFavorite = (id) => favorites.includes(Number(id))

  
  const [popularRestaurants, setPopularRestaurants] = useState([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [modal, setModal] = useState(null)

  // Normalizar datos de restaurantes
  const normalizeRestaurant = (restaurant) => {
    return {
      ...restaurant,
      img: restaurant.banner || restaurant.logo || restaurant.image || '',
      rating: Number((Number(restaurant.average_rating ?? restaurant.rating ?? 0)).toFixed(1)),
      time: restaurant.delivery_time_min ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max || 45} min` : '20-30 min',
      delivery: Number(restaurant.delivery_cost ?? restaurant.delivery ?? 0),
      products: Array.isArray(restaurant.products) ? restaurant.products : [],
    }
  }

  // Cargar restaurantes
  useEffect(() => {
    const loadData = async () => {
      setLoadingRestaurants(true)
      try {
        const data = await fetchJson('/restaurants')
        const items = Array.isArray(data) ? data : data.data || []
        
        if (items.length > 0) {
          setPopularRestaurants(items.slice(0, 8).map((r) => normalizeRestaurant(r)))
        } else {
          setPopularRestaurants([])
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setPopularRestaurants([])
      } finally {
        setLoadingRestaurants(false)
      }
    }
    loadData()
  }, [])

  // Cargar productos destacados
  useEffect(() => {
    if (popularRestaurants.length === 0) return
    
    const products = []
    popularRestaurants.forEach(res => {
      if (res.products && res.products.length > 0) {
        res.products.slice(0, 2).forEach(p => {
          products.push({
            ...p,
            img: p.image || p.img || '',
            restaurantId: res.id,
            restaurantName: res.name,
            oldPrice: p.price * 1.25,
            pct: 20
          })
        })
      }
    })
    setFeaturedProducts(products.slice(0, 12))
    setLoadingProducts(false)
  }, [popularRestaurants])

  // Cargar favoritos si hay token
  useEffect(() => {
    if (token) fetchFavorites(token)
  }, [token, fetchFavorites])

  // Manejadores
  const handleRestaurantSelect = (res) => navigate(`/restaurants/${res.id}`)
  
  const handleFavoriteToggle = async (id) => {
    if (!token) return navigate('/login')
    await toggleFavorite(id, token)
  }

  const handleHeroChange = (idx) => setHeroIdx(idx)

  return {
    popularRestaurants,
    loadingRestaurants,
    featuredProducts,
    loadingProducts,
    heroIdx,
    setHeroIdx: handleHeroChange,
    modal,
    setModal,
    handleRestaurantSelect,
    handleFavoriteToggle,
    isFavorite,
    token
  }
}
