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
      console.warn('No se pudo cargar favoritos del servidor, usando caché local:', error?.message)
      // Usar caché local sin mostrar error al usuario
      const cached = loadLocalFavorites()
      set({ favorites: cached, loading: false, error: null })
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

  // Toggle favorito - actualización optimista (UI primero, API en segundo plano)
  toggleFavorite: async (restaurantId, token) => {
    const normalizedId = Number(restaurantId)
    if (!normalizedId) return false

    // 1. Actualizar UI inmediatamente (optimistic update)
    const wasAdded = get().toggleFavoriteLocal(normalizedId)

    // 2. Si no hay token, solo guardamos local
    if (!token) return wasAdded

    // 3. Sincronizar con servidor en segundo plano
    try {
      await api.post('/favorites/toggle', { restaurant_id: normalizedId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return wasAdded
    } catch (error) {
      // Si la API falla, revertir el cambio local
      console.warn('Error sincronizando favorito con servidor:', error?.message)
      get().toggleFavoriteLocal(normalizedId) // revertir
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
