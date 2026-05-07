// Archivo: src/api/fetchJson.js | Comentario: logica principal del modulo.
import { API_URL } from './config'

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const parseResponseBody = async (response) => {
  const raw = await response.text()

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

export async function fetchJson(url, options = {}) {
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

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(resolvedUrl, { ...options, headers })
  const data = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, data)
  }

  return data
}