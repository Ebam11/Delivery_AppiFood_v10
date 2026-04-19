import { create } from 'zustand'
import { api } from '../api/client'

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  // Cargar favoritos del servidor
  fetchFavorites: async (token) => {
    if (!token) {
      set({ favorites: [] })
      return
    }

    set({ loading: true, error: null })
    try {
      const response = await api.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const favoriteIds = (response.data?.data || []).map(f => f.restaurant_id || f.id)
      set({ favorites: favoriteIds, loading: false })
    } catch (error) {
      console.error('Error cargando favoritos:', error)
      set({ loading: false, error: 'Error al cargar favoritos' })
    }
  },

  // Toggle favorito local
  toggleFavoriteLocal: (restaurantId) => {
    const state = get()
    const isFavorited = state.favorites.includes(restaurantId)
    const updated = isFavorited
      ? state.favorites.filter(id => id !== restaurantId)
      : [...state.favorites, restaurantId]
    set({ favorites: updated })
    return !isFavorited
  },

  // Toggle favorito en servidor
  toggleFavorite: async (restaurantId, token) => {
    if (!token) {
      console.warn('No token available')
      return false
    }

    try {
      await api.post('/favorites/toggle', { restaurant_id: restaurantId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      get().toggleFavoriteLocal(restaurantId)
      return true
    } catch (error) {
      console.error('Error toggling favorite:', error)
      set({ error: 'Error al guardar favorito' })
      return false
    }
  },

  // Verificar si es favorito
  isFavorite: (restaurantId) => {
    return get().favorites.includes(restaurantId)
  },

  // Agregar favorito sin servidor
  addLocalFavorite: (restaurantId) => {
    const state = get()
    if (!state.favorites.includes(restaurantId)) {
      set({ favorites: [...state.favorites, restaurantId] })
    }
  },

  // Remover favorito sin servidor
  removeLocalFavorite: (restaurantId) => {
    const state = get()
    set({ favorites: state.favorites.filter(id => id !== restaurantId) })
  },
}))
