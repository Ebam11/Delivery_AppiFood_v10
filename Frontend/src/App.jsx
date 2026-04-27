// Archivo: src/App.jsx | Comentario: logica principal del modulo.
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { fetchJson } from './api/fetchJson'
import Header        from './components/Header'
import CartSidebar   from './components/CartSidebar'
import SupportChatbot from './components/SupportChatbot'
import Home          from './pages/Home'
import Login         from './pages/Login'
import RestaurantLogin from './pages/RestaurantLogin'
import Register      from './pages/Register'
import RegisterRestaurant from './pages/RegisterRestaurant'
import Profile       from './pages/Profile'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import Favorites     from './pages/Favorites'
import { PaymentConfirmation } from './pages/PaymentConfirmation'
import { RestaurantDetail } from './pages/RestaurantDetail'
import HelpCenter from './pages/HelpCenter'
import Support       from './pages/Support'
import ForgotPassword from './pages/ForgotPassword'
import Subscription  from './pages/Subscription'
import Restaurants   from './pages/Restaurants'
import Coupons       from './pages/Coupons'
import Addresses     from './pages/Addresses'
import AddressForm   from './pages/AddressForm'
import AdminDashboard from './pages/AdminDashboard'
import RestaurantDashboard from './pages/RestaurantDashboard'
import RestaurantManagementPage from './pages/RestaurantManagementPage'

// Layout con header para páginas públicas
function PublicLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <>
      <Header isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading} />
      {children}
      <CartSidebar isAuth={isAuth} />
      <SupportChatbot />
    </>
  )
}

// Layout SIN header para restaurantes
function RestaurantLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <>
      {children}
      <SupportChatbot />
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
  }
  
  const handleLogout = async () => { 
    console.log('🔴 Logout initiated')
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

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta principal - SIEMPRE visible, incluso durante carga */}
          <Route path="/" element={
            <PublicPage
              isAuth={isAuth}
              user={user}
              onLogout={handleLogout}
              isLoading={loading} // ← Comentario corregido, ahora es una línea normal
            >
              {loading ? (
                // Mostrar contenido de carga en la página principal
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-['Satisfy'] text-4xl text-[#FF4B3E]">AppiFood</span>
                    <div className="mt-4 w-8 h-8 border-4 border-[#FF4B3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                </div>
              ) : (
                <Home isAuth={isAuth} />
              )}
            </PublicPage>
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
              <PublicLayout
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
              >
                <AdminDashboard user={user} />
              </PublicLayout>
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
                <RestaurantDashboard user={user} />
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
            <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
              <Favorites />
            </UserPage>
          } />

          <Route path="/favorites" element={
            <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
              <Favorites />
            </UserPage>
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
                <h1 className="text-3xl font-black text-gray-800">Página no encontrada</h1>
                <Link to={getHomePathByRole(user)} className="px-6 py-3 bg-[#FF4B3E] text-white rounded-full font-bold hover:bg-[#e03a2d] transition">
                  Volver al inicio
                </Link>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}