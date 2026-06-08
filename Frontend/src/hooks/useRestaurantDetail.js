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
    if (typeof restaurant.isOpen === 'boolean') return restaurant.isOpen
    
    // Lógica simplificada para el demo
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
