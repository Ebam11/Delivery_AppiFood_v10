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

// Layout con header
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

function RoleRoute({ user, allow = [], children }) {
  if (!user) return <Navigate to="/login" replace />
  const role = String(user?.role ?? user?.rol ?? 'customer').toLowerCase()
  if (!allow.includes(role)) return <Navigate to="/" replace />
  return children
}

function normalizeUserRole(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return rawUser
  const role = String(rawUser.role ?? rawUser.rol ?? 'customer').toLowerCase()
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
    <RoleRoute user={user} allow={['user', 'customer']}>
      <PublicLayout isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading}>
        {children}
      </PublicLayout>
    </RoleRoute>
  )
}

export default function App() {
  // Restaurar usuario desde localStorage al iniciar
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!token) return null
    
    if (savedUser) {
      try {
        const parsedUser = normalizeUserRole(JSON.parse(savedUser))
        console.log('📦 Restaurando usuario desde localStorage:', parsedUser)
        return parsedUser
      } catch (e) {
        console.log('⚠️ Could not parse saved user')
      }
    }
    
    return { authenticated: true }
  })
  
  const [loading, setLoading] = useState(true)

  // Verificar sesión al montar
  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('📌 App mounted, token:', token ? 'EXISTS' : 'NO TOKEN')
    
    if (!token) { 
      setLoading(false)
      return 
    }
    
    let mounted = true
    
    console.log('🔄 Fetching user profile...')
    fetchJson('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(data => {
        console.log('✅ User data received:', data)
        if (mounted) {
          let userData = null
          
          if (data?.data) {
            userData = data.data
          } else if (data?.user) {
            userData = data.user
          } else if (data?.profile) {
            userData = data.profile
          } else if (data?.id || data?.name || data?.email) {
            userData = data
          }
          
          if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
            console.log('💾 Updating user state with real data...')
            const normalizedUser = normalizeUserRole(userData)
            setUser(normalizedUser)
            localStorage.setItem('user', JSON.stringify(normalizedUser))
          } else {
            console.log('⚠️ No valid user data found, keeping cached data')
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                const parsedCached = normalizeUserRole(JSON.parse(cachedUser))
                setUser(parsedCached)
              } catch (e) {}
            }
          }
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('❌ Error fetching user:', err.message)
        if (mounted) {
          if (err?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          } else {
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                const parsedCached = normalizeUserRole(JSON.parse(cachedUser))
                setUser(parsedCached)
              } catch (e) {}
            }
          }
          setLoading(false)
        }
      })
    
    return () => { mounted = false }
  }, [])

  const handleLogin = (userData) => {
    const normalizedUser = normalizeUserRole(userData)
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
              <RestaurantDashboard user={user} onLogout={handleLogout} />
            </RoleRoute>
          } />

          <Route path="/restaurant/profile" element={
            <RoleRoute user={user} allow={['restaurant']}>
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
                <RestaurantManagementPage
                  title="Perfil del restaurante"
                  description="Completa y actualiza los datos de tu local para que la información sea visible en la app."
                  note="Aquí se centraliza la configuración del restaurante: nombre, dirección, contacto y portada."
                />
            </RoleRoute>
          } />

          <Route path="/restaurant/products" element={
            <RoleRoute user={user} allow={['restaurant']}>

                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}

                <RestaurantManagementPage
                  title="Productos"
                  description="Administra el menú de tu restaurante desde aquí."
                  note="Esta vista queda lista para conectar el catálogo de productos sin romper la navegación del panel."
                />

            </RoleRoute>
          } />

          <Route path="/restaurant/orders" element={
            <RoleRoute user={user} allow={['restaurant']}>

                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}

                <RestaurantManagementPage
                  title="Pedidos"
                  description="Revisa los pedidos activos y su estado de preparación."
                  note="La ruta ya no cae en 404 mientras se conecta el gestor de pedidos del restaurante."
                />
              
            </RoleRoute>
          } />

          <Route path="/restaurant/categories" element={
            <RoleRoute user={user} allow={['restaurant']}>
            
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
              
                <RestaurantManagementPage
                  title="Categorías"
                  description="Organiza el menú por categorías para mantener el catálogo limpio."
                  note="Esta pantalla evita enlaces rotos y deja un punto de entrada estable para la administración de categorías."
                />
          
            </RoleRoute>
          } />

          <Route path="/restaurant" element={<Navigate to="/restaurant/dashboard" replace />} />

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