import { useState, useEffect } from 'react'
import { fetchJson } from '../api/fetchJson'
import { useAuthStore } from '../store/authStore'
import { normalizeUserRole } from '../utils/appHelpers'

/**
 * Hook personalizado para manejar la inicialización de la aplicación,
 * autenticación y sincronización del estado del usuario.
 */
export function useAppInit() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!token) return null
    
    if (savedUser) {
      try {
        const parsedUser = normalizeUserRole(JSON.parse(savedUser))
        return parsedUser
      } catch (e) {
        console.error('Error al restaurar usuario:', e)
      }
    }
    return null
  })
  
  // Si hay usuario en caché, no bloqueamos la UI con loading
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    // Solo mostramos loading si hay token pero NO hay usuario en caché
    return !!(token && !savedUser)
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Sincroniza el usuario desde el almacenamiento local
  const syncUserFromStorage = () => {
    const cachedUser = localStorage.getItem('user')
    if (!cachedUser) {
      setUser(null)
      return
    }
    try {
      setUser(normalizeUserRole(JSON.parse(cachedUser)))
    } catch {
      // Ignorar si el usuario guardado está corrupto
    }
  }

  // Combina el estado premium con los datos del usuario
  const mergePremiumState = (nextUser) => {
    const cachedUser = localStorage.getItem('user')
    let cached = null

    if (cachedUser) {
      try {
        cached = normalizeUserRole(JSON.parse(cachedUser))
      } catch {
        cached = null
      }
    }

    if (!nextUser && cached) return cached
    if (!nextUser) return nextUser

    return {
      ...cached,
      ...nextUser,
      is_premium: Boolean(cached?.is_premium || nextUser?.is_premium),
      subscription: nextUser?.subscription ?? cached?.subscription ?? null,
    }
  }

  // Verificar sesión al montar el componente (no-bloqueante si hay caché)
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) { 
      setLoading(false)
      return 
    }
    
    let mounted = true
    
    // Revalidar en segundo plano — la UI ya está visible con datos del caché
    fetchJson('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(data => {
        if (mounted) {
          let userData = data?.data || data?.user || data?.profile || (data?.id ? data : null)
          
          if (userData) {
            const normalizedUser = mergePremiumState(normalizeUserRole(userData))

            setUser(normalizedUser)
            localStorage.setItem('user', JSON.stringify(normalizedUser))
          }
          setLoading(false)
        }
      })
      .catch(err => {
        if (mounted) {
          if (err?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
          // Si falla por red/timeout, el usuario ya está visible desde caché
          setLoading(false)
        }
      })
    
    return () => { mounted = false }
  }, [])

  // Escuchar eventos globales de actualización de usuario
  useEffect(() => {
    const handleUserUpdated = () => syncUserFromStorage()
    window.addEventListener('user-updated', handleUserUpdated)
    return () => window.removeEventListener('user-updated', handleUserUpdated)
  }, [])

  // Manejador de inicio de sesión
  const handleLogin = (userData) => {
    const normalizedUser = mergePremiumState(normalizeUserRole(userData))
    setUser(normalizedUser)
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    
    const token = localStorage.getItem('token')
    if (token) {
      useAuthStore.getState().setToken(token)
    }
  }
  
  // Manejador de cierre de sesión — INSTANTÁNEO
  const handleLogout = () => { 
    setIsLoggingOut(true)

    // 1) Capturar el token ANTES de limpiar
    const token = localStorage.getItem('token')

    // 2) Limpiar INMEDIATAMENTE (sin esperar al servidor) el almacenamiento local
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('theme') // Limpiar preferencia de modo noche al cerrar sesión para evitar heredar tema visual
    // Limpiar cachés del dashboard de restaurante para consistencia de datos de sesión
    localStorage.removeItem('rd_cache_menu')
    localStorage.removeItem('rd_cache_categories')
    localStorage.removeItem('rd_cache_profile')
    localStorage.removeItem('rd_cache_orders')
    localStorage.removeItem('rd_active_tab')

    useAuthStore.getState().setToken(null)
    setUser(null)

    // 3) Redirigir al instante a la pantalla de inicio principal
    window.location.href = '/'

    // 4) Avisar al servidor en segundo plano (fire-and-forget) para invalidar el token de Sanctum
    if (token) {
      fetchJson('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { /* Ignorar errores, la sesión local ya está limpia */ })
    }
  }

  return {
    user,
    setUser,
    loading,
    isLoggingOut,
    handleLogin,
    handleLogout,
    isAuth: !!user
  }
}
