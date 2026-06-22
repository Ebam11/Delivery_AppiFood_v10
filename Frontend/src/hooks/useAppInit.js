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
  
  const [loading, setLoading] = useState(true)
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

  // Verificar sesión al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) { 
      setLoading(false)
      return 
    }
    
    let mounted = true
    
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
          } else {
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                setUser(normalizeUserRole(JSON.parse(cachedUser)))
              } catch (e) {
                console.error('Error al restaurar del caché:', e)
              }
            }
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
          } else {
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                setUser(normalizeUserRole(JSON.parse(cachedUser)))
              } catch (e) {
                console.error('Error al restaurar del caché (fallback):', e)
              }
            }
          }
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
  
  // Manejador de cierre de sesión
  const handleLogout = async () => { 
    setIsLoggingOut(true)
    const token = localStorage.getItem('token')

    if (token) {
      try {
        await fetchJson('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.error('Error en el logout:', error)
      }
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
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
