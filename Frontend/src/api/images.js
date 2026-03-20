// Archivo: src/api/images.js | Comentario: logica principal del modulo.
/**
 * Servicio para obtener imágenes de Unsplash
 * API gratuita: https://unsplash.com/api
 * 
 * Límites: 50 requests/hora (sin API key)
 * Con API key: 5000 requests/hora
 * 
 * Fallback: loremflickr.com para placeholder de calidad
 */

import { imageCache } from '../utils/imageCache'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY || ''

/**
 * URLs directas de comida de Unsplash (verificadas)
 */
const getPlaceholderImage = (query = 'food', width = 400, height = 300) => {
  const foodImages = {
    'burger': [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    ],
    'chicken': [
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    ],
    'pizza': [
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
    ],
    'pasta': [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    ],
    'sushi': [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    ],
    'salad': [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    ],
    'dessert': [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    ],
    'drink': [
      'https://images.unsplash.com/photo-1554866585-acbb25d68d6c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554866585-acbb25d68d6c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554866585-acbb25d68d6c?w=400&h=300&fit=crop',
    ],
  }

  const q = query?.toLowerCase() || 'burger'
  const images = foodImages[q] || foodImages['burger']
  
  return images[Math.floor(Math.random() * images.length)]
}

/**
 * Obtener imagen de comida por categoría
 * @param {string} query - Búsqueda (ej: 'hamburger', 'pizza', 'chicken')
 * @param {number} page - Número de página
 * @returns {Promise<Object>} { url, photographer, description }
 */
export const getRandomFoodImage = async (query = 'food', page = 1) => {
  try {
    // Verificar cache primero
    const cacheKey = `food_${query}_${page}`
    const cachedUrl = imageCache.get(cacheKey)
    if (cachedUrl) {
      return {
        url: cachedUrl,
        photographer: 'Cached',
        description: query,
        cached: true
      }
    }

    // Si no hay API key, usar fallback de loremflickr directamente
    if (!UNSPLASH_ACCESS_KEY) {
      const placeholderUrl = getPlaceholderImage(query)
      imageCache.set(cacheKey, placeholderUrl)
      return {
        url: placeholderUrl,
        photographer: 'Stock Placeholder',
        description: query,
        fromPlaceholder: true
      }
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    )

    if (!response.ok) throw new Error('Error fetching image')

    const data = await response.json()
    if (data.results.length === 0) {
      // Fallback a placeholder de calidad
      const placeholderUrl = getPlaceholderImage(query)
      imageCache.set(cacheKey, placeholderUrl)
      return {
        url: placeholderUrl,
        photographer: 'Stock Placeholder',
        description: query
      }
    }

    const image = data.results[0]
    const result = {
      url: image.urls.regular,
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
      description: image.description || image.alt_description || query,
      downloadUrl: image.links.download_location // Para estadísticas
    }

    // Guardar en cache
    imageCache.set(cacheKey, result.url, {
      photographer: result.photographer,
      description: result.description
    })

    return result
  } catch (error) {
    console.warn('Image fetch failed, using placeholder:', error)
    // Retornar placeholder de calidad si falla
    const placeholderUrl = getPlaceholderImage(query)
    return {
      url: placeholderUrl,
      photographer: 'Stock Placeholder',
      description: query,
      error: true
    }
  }
}

/**
 * Obtener múltiples imágenes
 */
export const getFoodImages = async (query = 'food', count = 4) => {
  const images = []
  for (let i = 0; i < count; i++) {
    const img = await getRandomFoodImage(query, i + 1)
    images.push(img)
    // Esperar un poquito para no saturar API
    await new Promise(r => setTimeout(r, 100))
  }
  return images
}

/**
 * Mapeo de categorías a términos de búsqueda
 */
const categoryMap = {
  burger: 'burger fast food',
  hamburguesa: 'hamburger sandwich',
  pizza: 'pizza italian food',
  chicken: 'fried chicken crispy',
  pollo: 'pollo fried chicken',
  pasta: 'pasta italian noodles',
  sushi: 'sushi japanese food',
  ensalada: 'salad healthy food',
  postre: 'dessert cake chocolate',
  bebida: 'beverage drink juice',
}

/**
 * Detectar categoría de comida del nombre del producto
 */
const detectFoodCategory = (name = '') => {
  const nameL = name.toLowerCase()
  
  if (nameL.includes('burger') || nameL.includes('whopper') || nameL.includes('hamburger')) return 'burger'
  if (nameL.includes('chicken') || nameL.includes('pollo') || nameL.includes('ruti')) return 'chicken'
  if (nameL.includes('pizza')) return 'pizza'
  if (nameL.includes('pasta') || nameL.includes('chinese')) return 'pasta'
  if (nameL.includes('sushi')) return 'sushi'
  if (nameL.includes('salad') || nameL.includes('ensalada')) return 'salad'
  if (nameL.includes('dessert') || nameL.includes('postre') || nameL.includes('chocolate')) return 'dessert'
  if (nameL.includes('drink') || nameL.includes('bebida')) return 'drink'
  
  return 'burger' // fallback
}

/**
 * Obtener imagen por término genérico (nombre de producto, restaurante, etc)
 */
export const getImageByQuery = async (query) => {
  // Detectar categoría del nombre
  const category = detectFoodCategory(query)
  
  return getRandomFoodImage(category)
}

/**
 * Obtener imagen según categoría de producto
 */
export const getImageByCategory = async (category) => {
  const query = categoryMap[category?.toLowerCase()] || categoryMap.burger
  return getRandomFoodImage(query)
}

/**
 * Mapeo de restaurantes a tipo de comida
 */
const restaurantFoodMap = {
  'burger house': 'delicious burger fast food',
  'pizza nostra': 'authentic italian pizza',
  'sushi zen': 'fresh sushi japanese',
  'el rincón paisa': 'traditional colombian food bandeja paisa',
}

/**
 * Obtener imagen de restaurante
 */
export const getRestaurantImage = async (restaurantName = 'restaurant') => {
  const foodType = restaurantFoodMap[restaurantName?.toLowerCase()] || `${restaurantName} food restaurant`
  return getRandomFoodImage(foodType)
}

export default {
  getRandomFoodImage,
  getFoodImages,
  getImageByCategory,
  getRestaurantImage,
}
