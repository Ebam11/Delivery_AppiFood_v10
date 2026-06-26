import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useRestaurantStore } from '../store/restaurantStore'
import { getRestaurantReviews } from '../api/restaurants'

export function useRestaurantDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  
  const {
    selectedRestaurant,
    isLoading,
    error,
    fetchRestaurantById,
    clearError,
  } = useRestaurantStore()

  // Intentar obtener restaurante desde el estado de navegación
  const fallbackRestaurant = useMemo(() => {
    const fromState = location.state?.restaurant
    if (fromState?.id && String(fromState.id) === String(id)) return fromState

    return null
  }, [id, location.state])

  useEffect(() => {
    if (!fallbackRestaurant) {
      fetchRestaurantById(id).catch(() => {})
    }
  }, [id, fallbackRestaurant, fetchRestaurantById])

  useEffect(() => {
    if (id) {
      setIsReviewsLoading(true)
      getRestaurantReviews(id)
        .then(res => {
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
          setReviews(list)
        })
        .catch(() => {})
        .finally(() => setIsReviewsLoading(false))
    }
  }, [id])

  const restaurant = selectedRestaurant?.data || selectedRestaurant || fallbackRestaurant

// Cálculo de estado abierto/cerrado
const isCurrentlyOpen = useMemo(() => {
  if (!restaurant) return false

  // Prioridad 1: campo calculado por el backend
  if (typeof restaurant.isOpen === 'boolean') return restaurant.isOpen

  // Prioridad 2: calcular desde horarios si están disponibles
  if (Array.isArray(restaurant.schedules) && restaurant.schedules.length > 0) {
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[now.getDay()]
    const todaySchedule = restaurant.schedules.find(s =>
      s.day?.toLowerCase() === today
    )

    if (!todaySchedule || todaySchedule.is_closed) return false

    const currentTime = now.toTimeString().slice(0, 8) // HH:MM:SS
    return currentTime >= todaySchedule.opening_time &&
          currentTime <= todaySchedule.closing_time
  }

  // Prioridad 3: último fallback si no hay horarios configurados
  return restaurant.is_active !== false
}, [restaurant])

  return {
    restaurant,
    isLoading,
    error,
    clearError,
    selectedProduct,
    setSelectedProduct,
    isCurrentlyOpen,
    reviews,
    isReviewsLoading
  }
}
