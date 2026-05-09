import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useRestaurantStore } from '../store/restaurantStore'
import { MOCK_RESTAURANTS } from '../data/mockRestaurants'

/**
 * Hook para manejar la lógica de la página de detalle del restaurante.
 */
export function useRestaurantDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  const {
    selectedRestaurant,
    isLoading,
    error,
    fetchRestaurantById,
    clearError,
  } = useRestaurantStore()

  // Intentar obtener restaurante desde el estado de navegación o mocks
  const fallbackRestaurant = useMemo(() => {
    const fromState = location.state?.restaurant
    if (fromState?.id && String(fromState.id) === String(id)) return fromState

    return MOCK_RESTAURANTS.find(r => String(r.id) === String(id)) || null
  }, [id, location.state])

  useEffect(() => {
    if (!fallbackRestaurant) {
      fetchRestaurantById(id).catch(() => {})
    }
  }, [id, fallbackRestaurant, fetchRestaurantById])

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
    isCurrentlyOpen
  }
}
