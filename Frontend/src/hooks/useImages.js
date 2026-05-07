// Archivo: src/hooks/useImages.js | Comentario: logica principal del modulo.
import { useState, useEffect } from 'react'
import { getImageByQuery, getRestaurantImage } from '../api/images'

/**
 * Hook para cargar imagen por nombre/término de búsqueda
 * @param {string} query - Nombre del producto o término de búsqueda
 * @param {string} fallbackUrl - URL de fallback si falla
 * @returns {Object} { image, loading, error }
 */
export const useProductImage = (query, fallbackUrl = null) => {
  const [image, setImage] = useState(fallbackUrl || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (fallbackUrl) {
      setImage(fallbackUrl)
      setLoading(false)
      return
    }

    if (!query) {
      setLoading(false)
      return
    }

    const loadImage = async () => {
      try {
        const img = await getImageByQuery(query)
        setImage(img.url)
        setError(null)
      } catch (err) {
        console.error('Error loading product image:', err)
        setError(err.message)
        setImage(fallbackUrl)
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [query, fallbackUrl])

  return { image, loading, error }
}

/**
 * Hook para cargar imagen de restaurante
 */
export const useRestaurantImage = (restaurantName, fallbackUrl = null) => {
  const [image, setImage] = useState(fallbackUrl || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (fallbackUrl) {
      setImage(fallbackUrl)
      setLoading(false)
      return
    }

    if (!restaurantName) {
      setLoading(false)
      return
    }

    const loadImage = async () => {
      try {
        const img = await getRestaurantImage(restaurantName)
        setImage(img.url)
        setError(null)
      } catch (err) {
        console.error('Error loading restaurant image:', err)
        setError(err.message)
        setImage(fallbackUrl)
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [restaurantName, fallbackUrl])

  return { image, loading, error }
}

export default { useProductImage, useRestaurantImage }
