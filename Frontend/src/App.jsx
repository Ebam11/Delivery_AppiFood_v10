// Archivo: src/App.jsx | Comentario: logica principal del modulo.
import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CartProvider } from './context/CartContext'
import { fetchJson } from './api/fetchJson'
import Header        from './components/Header'
import CartSidebar   from './components/CartSidebar'
import SupportChatbot from './components/SupportChatbot'
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const RestaurantLogin = lazy(() => import('./pages/RestaurantLogin'))
const Register = lazy(() => import('./pages/Register'))
const RegisterRestaurant = lazy(() => import('./pages/RegisterRestaurant'))
const Profile = lazy(() => import('./pages/Profile'))
const Orders = lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })))
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(module => ({ default: module.OrderDetail })))
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })))
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })))
const Favorites = lazy(() => import('./pages/Favorites'))
const PaymentConfirmation = lazy(() => import('./pages/PaymentConfirmation').then(module => ({ default: module.PaymentConfirmation })))
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail').then(module => ({ default: module.RestaurantDetail })))
const HelpCenter = lazy(() => import('./pages/HelpCenter'))
const Support = lazy(() => import('./pages/Support'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Subscription = lazy(() => import('./pages/Subscription'))
const Restaurants = lazy(() => import('./pages/Restaurants'))
const Coupons = lazy(() => import('./pages/Coupons'))
const Addresses = lazy(() => import('./pages/Addresses'))
const AddressForm = lazy(() => import('./pages/AddressForm'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'))
const RestaurantManagementPage = lazy(() => import('./pages/RestaurantManagementPage'))

const svgDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

const FOOD_BACKDROP_IMAGES = [
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF1E8"/><circle cx="64" cy="64" r="32" fill="#FFB36B"/><path d="M34 56c4-16 17-28 30-28s26 12 30 28H34Z" fill="#7C4A1A"/><path d="M34 72c4 16 17 28 30 28s26-12 30-28H34Z" fill="#4CAF50" opacity="0.9"/><circle cx="52" cy="62" r="4" fill="#fff"/><circle cx="76" cy="62" r="4" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF6E5"/><path d="M28 70c0-20 16-36 36-36s36 16 36 36H28Z" fill="#E25A3A"/><path d="M32 72h64c0 18-14 32-32 32S32 90 32 72Z" fill="#F7C948"/><path d="M41 56c9-10 20-15 23-15s14 5 23 15" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="66" r="3.5" fill="#fff"/><circle cx="64" cy="62" r="3.5" fill="#fff"/><circle cx="79" cy="68" r="3.5" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#F4FFF9"/><rect x="26" y="44" width="76" height="40" rx="20" fill="#2C6E49"/><rect x="34" y="50" width="60" height="28" rx="14" fill="#D9F99D"/><circle cx="48" cy="64" r="6" fill="#22C55E"/><circle cx="64" cy="58" r="6" fill="#F59E0B"/><circle cx="80" cy="66" r="6" fill="#EF4444"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF4F4"/><path d="M28 70h72l-8 28H36l-8-28Z" fill="#F97316"/><path d="M34 70V50h60v20" fill="#FDBA74"/><path d="M42 52l-6 18M54 52l-6 18M66 52l-6 18M78 52l-6 18" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#F3F8FF"/><rect x="30" y="52" width="68" height="24" rx="12" fill="#1F2937"/><rect x="34" y="56" width="60" height="16" rx="8" fill="#38BDF8"/><rect x="38" y="60" width="10" height="8" rx="4" fill="#fff"/><rect x="54" y="60" width="10" height="8" rx="4" fill="#fff"/><rect x="70" y="60" width="10" height="8" rx="4" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF7FB"/><circle cx="64" cy="64" r="34" fill="#F472B6"/><circle cx="64" cy="64" r="16" fill="#FFF"/><circle cx="64" cy="64" r="8" fill="#FDBA74"/></svg>`),
]

function LoadingScreen({ message = 'AppiFood' }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdf8]">
      <div className="text-center">
        <span className="font-['Satisfy'] text-4xl text-[#FF4B3E]">{message}</span>
        <div className="mt-4 w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-400 text-sm animate-pulse">{t('app.loading') || "Cargando..."}</p>
      </div>
    </div>
  )
}

// Layout con header para páginas públicas
function PublicLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffdf8]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src={FOOD_BACKDROP_IMAGES[0]} alt="" className="absolute left-4 top-8 h-20 w-20 rotate-[-12deg] opacity-[0.08] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[1]} alt="" className="absolute right-8 top-20 h-20 w-20 rotate-[10deg] opacity-[0.08] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[2]} alt="" className="absolute left-[12%] top-[34%] h-16 w-16 rotate-[8deg] opacity-[0.07] blur-[0.2px] sm:h-20 sm:w-20" />
        <img src={FOOD_BACKDROP_IMAGES[3]} alt="" className="absolute right-[14%] top-[42%] h-20 w-20 rotate-[-8deg] opacity-[0.07] blur-[0.2px] sm:h-24 sm:w-24" />
        <img src={FOOD_BACKDROP_IMAGES[4]} alt="" className="absolute left-[18%] bottom-[18%] h-16 w-16 rotate-[6deg] opacity-[0.06] blur-[0.2px] sm:h-20 sm:w-20" />
        <img src={FOOD_BACKDROP_IMAGES[5]} alt="" className="absolute right-[8%] bottom-[22%] h-18 w-18 rotate-[-10deg] opacity-[0.06] blur-[0.2px] sm:h-24 sm:w-24" />
      </div>
      <div className="relative z-10">
        <Header isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading} />
        {children}
        <CartSidebar isAuth={isAuth} />
        {user?.role !== 'restaurant' && user?.role !== 'admin' && <SupportChatbot />}
      </div>
    </div>
  )
}

// Layout SIN header para restaurantes
function RestaurantLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <>
      {children}
      {user?.role !== 'restaurant' && user?.role !== 'admin' && <SupportChatbot />}
    </>
  )
}

function RoleRoute({ user, allow = [], children }) {
  if (!user) return <Navigate to="/login" replace />
  const rawRole = String(user?.role ?? user?.rol ?? 'user').toLowerCase()
  const role = rawRole === 'customer' ? 'user' : rawRole
  if (!allow.includes(role)) return <Navigate to="/" replace />
  return children
}

function normalizeUserRole(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return rawUser
  const rawRole = String(rawUser.role ?? rawUser.rol ?? 'user').toLowerCase()
  const role = rawRole === 'customer' ? 'user' : rawRole
  return { ...rawUser, role }
}

function getHomePathByRole(rawUser) {
  const role = String(rawUser?.role ?? rawUser?.rol ?? 'user').toLowerCase()

  if (role === 'admin') return '/admin/dashboard'
  if (role === 'restaurant') return '/restaurant/dashboard'

  return '/'
}

function PublicPage({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <PublicLayout isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading}>
      {children}
    </PublicLayout>
  )
}

function UserPage({ children, user, isAuth, onLogout, isLoading }) {
  return (
    <RoleRoute user={user} allow={['user']}>
      <PublicLayout isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading}>
        {children}
      </PublicLayout>
    </RoleRoute>
  )
}

export default function App() {
  const { t } = useTranslation()
  // Restaurar usuario desde localStorage al iniciar - MEJORADO
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    // Si no hay token, no hay autenticación
    if (!token) return null
    
    // Si hay token y usuario guardado, restaurarlo
    if (savedUser) {
      try {
        const parsedUser = normalizeUserRole(JSON.parse(savedUser))
        console.log('📦 [INIT] Restaurando usuario desde localStorage:', parsedUser)
        return parsedUser
      } catch (e) {
        console.error('⚠️ [INIT] Error al parsear usuario guardado:', e)
      }
    }
    
    // Si hay token pero no usuario guardado, retornar null para que se cargue desde /api/me
    console.log('📦 [INIT] Token existe pero usuario no guardado, se cargará desde /api/me')
    return null
  })
  
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const syncUserFromStorage = () => {
    const cachedUser = localStorage.getItem('user')
    if (!cachedUser) {
      setUser(null)
      return
    }

    try {
      setUser(normalizeUserRole(JSON.parse(cachedUser)))
    } catch {
      // Ignorar si el usuario guardado está corrupto.
    }
  }

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

    if (!nextUser && cached) {
      return cached
    }

    if (!nextUser) {
      return nextUser
    }

    return {
      ...cached,
      ...nextUser,
      is_premium: Boolean(cached?.is_premium || nextUser?.is_premium),
      subscription: nextUser?.subscription ?? cached?.subscription ?? null,
    }
  }

  // Verificar sesión al montar - MEJORADO
  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('📌 [MOUNT] App montado, verificando autenticación...')
    console.log('📌 [MOUNT] Token en localStorage:', token ? '✅ SÍ' : '❌ NO')
    
    if (!token) { 
      console.log('📌 [MOUNT] No hay token, completando carga')
      setLoading(false)
      return 
    }
    
    let mounted = true
    
    console.log('🔄 [MOUNT] Obteniendo datos del usuario desde /api/me...')
    fetchJson('/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(data => {
        console.log('✅ [MOUNT] Respuesta de /api/me recibida:', data)
        if (mounted) {
          let userData = null
          
          // Extraer datos del usuario de varias posibles estructuras de respuesta
          if (data?.data && typeof data.data === 'object') {
            userData = data.data
          } else if (data?.user && typeof data.user === 'object') {
            userData = data.user
          } else if (data?.profile && typeof data.profile === 'object') {
            userData = data.profile
          } else if (data?.id || data?.name || data?.email) {
            userData = data
          }
          
          if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
            console.log('💾 [MOUNT] Actualizando estado del usuario con datos reales:', userData)
            const normalizedUser = mergePremiumState(normalizeUserRole(userData))
            setUser(normalizedUser)
            localStorage.setItem('user', JSON.stringify(normalizedUser))
            console.log('✅ [MOUNT] Usuario guardado en localStorage y estado actualizado')
          } else {
            console.log('⚠️ [MOUNT] No hay datos válidos de usuario, usando datos guardados')
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                const parsedCached = normalizeUserRole(JSON.parse(cachedUser))
                setUser(parsedCached)
                console.log('✅ [MOUNT] Usuario restaurado del caché')
              } catch (e) {
                console.error('❌ [MOUNT] Error al restaurar usuario del caché:', e)
              }
            }
          }
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('❌ [MOUNT] Error al obtener usuario:', err?.message)
        if (mounted) {
          // Si el error es 401, limpiar autenticación
          if (err?.status === 401) {
            console.log('⚠️ [MOUNT] Token inválido (401), limpiando autenticación')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          } else {
            // Para otros errores, intentar usar datos guardados
            console.log('⚠️ [MOUNT] Error en /api/me, intentando restaurar desde caché')
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                const parsedCached = normalizeUserRole(JSON.parse(cachedUser))
                setUser(parsedCached)
                console.log('✅ [MOUNT] Usuario restaurado del caché (fallback)')
              } catch (e) {
                console.error('❌ [MOUNT] Error al restaurar del caché:', e)
              }
            }
          }
          setLoading(false)
        }
      })
    
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const handleUserUpdated = () => syncUserFromStorage()
    window.addEventListener('user-updated', handleUserUpdated)
    return () => window.removeEventListener('user-updated', handleUserUpdated)
  }, [])

  const handleLogin = (userData) => {
    const normalizedUser = mergePremiumState(normalizeUserRole(userData))
    console.log('✅ Login successful, setting user:', normalizedUser)
    setUser(normalizedUser)
    localStorage.setItem('user', JSON.stringify(normalizedUser))
    
    // Sincronizar token con el store global
    const token = localStorage.getItem('token')
    if (token) {
      useAuthStore.getState().setToken(token)
    }
  }
  
  const handleLogout = async () => { 
    console.log('🔴 Logout initiated')
    setIsLoggingOut(true)
    const token = localStorage.getItem('token')

    if (token) {
      try {
        await fetchJson('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.error('⚠️ Logout request failed:', error)
      }
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const isAuth = !!user

  if (isLoggingOut) return <LoadingScreen message={t('app.loggingOut') || "Cerrando sesión..."} />

  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Ruta principal - SIEMPRE visible, incluso durante carga */}
            <Route path="/" element={
              loading ? (
                <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={true}>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-['Satisfy'] text-4xl text-[#FF4B3E]">AppiFood</span>
                      <div className="mt-4 w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  </div>
                </PublicPage>
              ) : isAuth && user && user.role !== 'user' ? (
                <Navigate to={getHomePathByRole(user)} replace />
              ) : (
                <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={false}>
                  <Home isAuth={isAuth} />
                </PublicPage>
              )
            } />

            <Route path="/restaurants" element={
              <PublicPage
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
              >
                {loading ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Restaurants />
                )}
              </PublicPage>
            } />

            <Route path="/restaurants/:id" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <RestaurantDetail />
              </PublicPage>
            } />

            <Route path="/restaurant/:id" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <RestaurantDetail />
              </PublicPage>
            } />

            <Route path="/subscription" element={
              <PublicPage
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
              >
                {loading ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Subscription isAuth={isAuth} user={user} />
                )}
              </PublicPage>
            } />

            <Route path="/support" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <Support />
              </PublicPage>
            } />

            <Route path="/coupons" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <Coupons />
              </PublicPage>
            } />

            <Route path="/help-center" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <HelpCenter />
              </PublicPage>
            } />

            <Route path="/user/help-center" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <HelpCenter />
              </UserPage>
            } />

            <Route path="/user/support" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Support />
              </UserPage>
            } />

            <Route path="/forgot-password" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <ForgotPassword />
              </PublicPage>
            } />

            <Route path="/reset-password" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <ForgotPassword />
              </PublicPage>
            } />

            {/* Auth — redirigir si ya está logueado */}
            <Route path="/login" element={
              isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <Register onLogin={handleLogin} />
            } />
            <Route path="/register-restaurant" element={
              isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <RegisterRestaurant onLogin={handleLogin} />
            } />
            <Route path="/restaurant/login" element={
              isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <RestaurantLogin onLogin={handleLogin} />
            } />

            <Route path="/admin" element={
              <RoleRoute user={user} allow={['admin']}>
                <RestaurantLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <AdminDashboard user={user} onLogout={handleLogout} />
                </RestaurantLayout>
              </RoleRoute>
            } />

            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

            <Route path="/restaurant/dashboard" element={
              <RoleRoute user={user} allow={['restaurant']}>
                <RestaurantLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <RestaurantDashboard user={user} onLogout={handleLogout} />
                </RestaurantLayout>
              </RoleRoute>
            } />

            <Route path="/restaurant/profile" element={
              <RoleRoute user={user} allow={['restaurant']}>
                <RestaurantLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <RestaurantManagementPage
                    title="Perfil del restaurante"
                    description="Completa y actualiza los datos de tu local para que la información sea visible en la app."
                    note="Aquí se centraliza la configuración del restaurante: nombre, dirección, contacto y portada."
                    user={user}
                    onLogout={handleLogout}
                  />
                </RestaurantLayout>
              </RoleRoute>
            } />

            <Route path="/restaurant/products" element={
              <RoleRoute user={user} allow={['restaurant']}>
                <RestaurantLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <RestaurantManagementPage
                    title="Productos"
                    description="Administra el menú de tu restaurante desde aquí."
                    note="Esta vista queda lista para conectar el catálogo de productos sin romper la navegación del panel."
                    user={user}
                    onLogout={handleLogout}
                  />
                </RestaurantLayout>
              </RoleRoute>
            } />

            <Route path="/restaurant/orders" element={
              <RoleRoute user={user} allow={['restaurant']}>
                <PublicLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <RestaurantManagementPage
                    title="Pedidos"
                    description="Revisa los pedidos activos y su estado de preparación."
                    note="La ruta ya no cae en 404 mientras se conecta el gestor de pedidos del restaurante."
                  />
                </PublicLayout>
              </RoleRoute>
            } />

            <Route path="/restaurant/categories" element={
              <RoleRoute user={user} allow={['restaurant']}>
                <PublicLayout
                  isAuth={isAuth}
                  user={user}
                  onLogout={handleLogout}
                  isLoading={loading}
                >
                  <RestaurantManagementPage
                    title="Categorías"
                    description="Organiza el menú por categorías para mantener el catálogo limpio."
                    note="Esta pantalla evita enlaces rotos y deja un punto de entrada estable para la administración de categorías."
                  />
                </PublicLayout>
              </RoleRoute>
            } />

            <Route path="/restaurant" element={<Navigate to="/restaurant/dashboard" replace />} />

            <Route path="/cart" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Cart />
              </UserPage>
            } />

            <Route path="/user/cart" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Cart />
              </UserPage>
            } />

            <Route path="/checkout" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Checkout />
              </UserPage>
            } />

            <Route path="/user/checkout" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Checkout />
              </UserPage>
            } />

            <Route path="/payment/confirmation/:orderId" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <PaymentConfirmation />
              </UserPage>
            } />

            {/* Rutas protegidas de usuario */}
            <Route path="/user/orders" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Orders />
              </UserPage>
            } />

            <Route path="/orders" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Orders />
              </UserPage>
            } />

            <Route path="/orders/:id" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <OrderDetail />
              </UserPage>
            } />

            <Route path="/user/orders/:id" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <OrderDetail />
              </UserPage>
            } />

            <Route path="/user/favorites" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <Favorites />
              </PublicPage>
            } />

            <Route path="/favorites" element={
              <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
                <Favorites />
              </PublicPage>
            } />

            <Route path="/user/profile" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                {loading ? (
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Profile user={user} onLogout={handleLogout} onUpdateProfile={u => {
                    setUser(u)
                    localStorage.setItem('user', JSON.stringify(u))
                  }} />
                )}
              </UserPage>
            } />

            <Route path="/user/addresses" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <Addresses />
              </UserPage>
            } />

            <Route path="/user/addresses/create" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <AddressForm />
              </UserPage>
            } />

            <Route path="/user/addresses/:id/edit" element={
              <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
                <AddressForm />
              </UserPage>
            } />

            {/* 404 */}
            <Route path="*" element={
              <PublicLayout 
                isAuth={isAuth} 
                user={user} 
                onLogout={handleLogout}
                isLoading={loading}
              >
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                  <span className="text-8xl">🍔</span>
                  <h1 className="text-3xl font-black text-gray-800">{t('app.pageNotFound') || "Página no encontrada"}</h1>
                  <Link to={getHomePathByRole(user)} className="px-6 py-3 bg-[#FF4B3E] text-white rounded-full font-bold hover:bg-[#e03a2d] transition">
                    {t('app.backToHome') || "Volver al inicio"}
                  </Link>
                </div>
              </PublicLayout>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  )
}