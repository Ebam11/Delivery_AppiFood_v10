import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'

/**
 * Hook para manejar la lógica y los datos de la página de inicio.
 */
export function useHomeData() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { fetchFavorites, toggleFavorite, isFavorite } = useFavoritesStore()
  
  const [popularRestaurants, setPopularRestaurants] = useState([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [heroIdx, setHeroIdx] = useState(0)
  const [modal, setModal] = useState(null)

  // Normalizar datos de restaurantes
  const normalizeRestaurant = (restaurant, index = 0) => {
    const fallback = MOCK_RESTAURANTS[index % MOCK_RESTAURANTS.length] || {}
    return {
      ...restaurant,
      img: restaurant.banner || restaurant.logo || restaurant.image || fallback.img || '',
      rating: Number((Number(restaurant.average_rating ?? restaurant.rating ?? fallback.rating ?? 4.5)).toFixed(1)),
      time: restaurant.delivery_time_min ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max || 45} min` : (fallback.time || '20-30 min'),
      delivery: Number(restaurant.delivery_cost ?? restaurant.delivery ?? fallback.delivery ?? 3500),
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
          setPopularRestaurants(items.slice(0, 8).map((r, idx) => normalizeRestaurant(r, idx)))
        } else {
          setPopularRestaurants(MOCK_RESTAURANTS.slice(0, 8).map((r, idx) => normalizeRestaurant(r, idx)))
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setPopularRestaurants(MOCK_RESTAURANTS.slice(0, 8).map((r, idx) => normalizeRestaurant(r, idx)))
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
