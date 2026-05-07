import { create } from 'zustand'
import { api } from '../api/client'

const LOCAL_KEY = 'local_favorites'

const normalizeFavoriteIds = (ids = []) => {
  return ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id))
}

const loadLocalFavorites = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return normalizeFavoriteIds(raw ? JSON.parse(raw) : [])
  } catch (e) {
    return []
  }
}

export const useFavoritesStore = create((set, get) => ({
  favorites: loadLocalFavorites(),
  loading: false,
  error: null,

  // Cargar favoritos del servidor
  fetchFavorites: async (token) => {
    if (!token) {
      set({ favorites: [] })
      try { localStorage.removeItem(LOCAL_KEY) } catch (e) {}
      return
    }

    set({ loading: true, error: null })
    try {
      const response = await api.get('/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const favoriteIds = normalizeFavoriteIds((response.data?.data || []).map(f => f.restaurant_id ?? f.id))
      set({ favorites: favoriteIds, loading: false })
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(favoriteIds)) } catch (e) {}
    } catch (error) {
      console.error('Error cargando favoritos:', error)
      set({ loading: false, error: 'Error al cargar favoritos' })
    }
  },

  // Toggle favorito local
  toggleFavoriteLocal: (restaurantId) => {
    const normalizedId = Number(restaurantId)
    const state = get()
    const isFavorited = state.favorites.includes(normalizedId)
    const updated = isFavorited
      ? state.favorites.filter(id => id !== normalizedId)
      : [...state.favorites, normalizedId]
    set({ favorites: updated })
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(updated)) } catch(e){}
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
    return get().favorites.includes(Number(restaurantId))
  },

  // Agregar favorito sin servidor
  addLocalFavorite: (restaurantId) => {
    const normalizedId = Number(restaurantId)
    const state = get()
    if (!state.favorites.includes(normalizedId)) {
      const updated = [...state.favorites, normalizedId]
      set({ favorites: updated })
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(updated)) } catch(e){}
    }
  },

  // Remover favorito sin servidor
  removeLocalFavorite: (restaurantId) => {
    const normalizedId = Number(restaurantId)
    const state = get()
    const updated = state.favorites.filter(id => id !== normalizedId)
    set({ favorites: updated })
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(updated)) } catch(e){}
  },
}))
