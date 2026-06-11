/**
 * Archivo: src/api/fetchJson.js
 * Utilidad principal para realizar peticiones HTTP a la API.
 * Maneja automáticamente los encabezados JSON, el token de autenticación
 * y la normalización de URLs.
 */

import { API_URL } from './config'

/**
 * Clase personalizada para errores de la API.
 * Permite acceder al código de estado y a los datos devueltos por el servidor.
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Intenta parsear el cuerpo de la respuesta como JSON.
 * Si falla o está vacío, devuelve null o el texto plano.
 */
const parseResponseBody = async (response) => {
  const raw = await response.text()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Función principal para peticiones fetch.
 * @param {string} url - Ruta relativa o absoluta de la API.
 * @param {object} options - Opciones de fetch (method, body, headers, etc).
 */
export async function fetchJson(url, options = {}) {
  // Normalización de la URL base y la ruta
  const normalizedBase = String(API_URL || '/api').replace(/\/+$/, '')
  const normalizedPath = String(url || '').replace(/^\/+/, '')

  let resolvedUrl = ''
  if (/^https?:\/\//i.test(url)) {
    resolvedUrl = url
  } else if (String(url).startsWith('/api/')) {
    resolvedUrl = `${normalizedBase}/${String(url).replace(/^\/api\//, '')}`
  } else {
    resolvedUrl = `${normalizedBase}/${normalizedPath}`
  }

  // Configuración de encabezados predeterminados
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  }

  // Obtener token de localStorage
  const token = localStorage.getItem('token')
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Si enviamos un objeto en el body, lo convertimos a string y ponemos Content-Type
  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(resolvedUrl, { 
      ...options, 
      body,
      headers 
    })

    const data = await parseResponseBody(response)

    if (!response.ok) {
      const message = (data?.message || data?.error) || `Error en la petición: ${response.status}`
      throw new ApiError(message, response.status, data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(error.message || 'Error de conexión', 500)
  }
}