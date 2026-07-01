// Archivo: src/hooks/useImages.js | Comentario: logica sincrona y optimizada, sin CDN externo.
import { useMemo } from 'react'
import {
  getOptimizedImageUrl,
  detectFoodCategory,
  getPlaceholderImage,
} from '../api/images'

// Cache simple en memoria para evitar recalcular imágenes en cada render
const imageCache = new Map()

// Mapa de imágenes específicas por restaurante (sincronizado con api/images.js)
const RESTAURANT_IMAGE_MAP = {
  'burger house':        'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
  'pollo dorado':        'https://images.unsplash.com/photo-1619881590738-a111d176d906',
  'mariscos del puerto': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47',
  'pizza nostra':        'https://images.unsplash.com/photo-1513104890138-7c749659a591',
  'sushi zen':           'https://images.unsplash.com/photo-1611143669185-af224c5e3252',
  'el rincón paisa':     'https://images.unsplash.com/photo-1547592180-85f173990554',
  'la bandeja':          'https://images.unsplash.com/photo-1532980400857-e8d9d275d858',
  'verde fresco':        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
  'barra fresca':        'https://images.unsplash.com/photo-1544145945-f90425340c7e',
  'tamales del alba':    'https://images.unsplash.com/photo-1547592180-85f173990554',
  'café madrugón':       'https://images.unsplash.com/photo-1533920379810-6bedac961555',
  'sopas del claustro':  'https://images.unsplash.com/photo-1504544750208-dc0358e31b6e',
}

/**
 * Hook SÍNCRONO para cargar imagen de producto por nombre.
 * No hace fetch - usa banco de imágenes estático + caché en memoria.
 * Retorna loading: false siempre para eliminar el flash/parpadeo.
 *
 * @param {string} query - Nombre del producto
 * @param {string|null} fallbackUrl - URL guardada en la BD (si existe)
 * @returns {{ image: string, loading: boolean, error: null }}
 */
export const useProductImage = (query, fallbackUrl = null) => {
  const image = useMemo(() => {
    // Si el producto tiene imagen guardada en la BD, usarla directamente
    if (fallbackUrl) {
      return getOptimizedImageUrl(fallbackUrl, 500)
    }
    if (!query) return null

    // Buscar en caché
    const cacheKey = `product_${query}`
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)
    }

    // Detectar categoría por nombre y obtener imagen estática
    const category = detectFoodCategory(query)
    const url = getPlaceholderImage(category, 500)
    imageCache.set(cacheKey, url)
    return url
  }, [query, fallbackUrl])

  return { image, loading: false, error: null }
}

/**
 * Hook SÍNCRONO para cargar imagen de restaurante.
 * Primero busca imagen específica del restaurante, luego detecta por categoría.
 *
 * @param {string} restaurantName - Nombre del restaurante
 * @param {string|null} fallbackUrl - URL guardada en la BD (si existe)
 * @returns {{ image: string, loading: boolean, error: null }}
 */
export const useRestaurantImage = (restaurantName, fallbackUrl = null) => {
  const image = useMemo(() => {
    // Si el restaurante tiene imagen guardada en la BD, usarla directamente
    if (fallbackUrl) {
      return getOptimizedImageUrl(fallbackUrl, 800)
    }
    if (!restaurantName) return null

    // Buscar en caché
    const cacheKey = `restaurant_${restaurantName}`
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)
    }

    const nameL = restaurantName.toLowerCase()

    // Buscar imagen específica del restaurante o fallback por categoría
    let url = null
    if (RESTAURANT_IMAGE_MAP[nameL]) {
      url = getOptimizedImageUrl(RESTAURANT_IMAGE_MAP[nameL], 800)
    } else {
      const category = detectFoodCategory(restaurantName)
      url = getPlaceholderImage(category, 800)
    }

    imageCache.set(cacheKey, url)
    return url
  }, [restaurantName, fallbackUrl])

  return { image, loading: false, error: null }
}

export default { useProductImage, useRestaurantImage }
