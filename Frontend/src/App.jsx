// Archivo: src/App.jsx | Comentario: logica principal del modulo.
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { fetchJson } from './api/fetchJson'
import Header        from './components/Header'
import CartSidebar   from './components/CartSidebar'
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import RegisterRestaurant from './pages/RegisterRestaurant'
import Profile       from './pages/Profile'
import Subscription  from './pages/Subscription'
import Restaurants   from './pages/Restaurants'
import AdminDashboard from './pages/AdminDashboard'
import RestaurantDashboard from './pages/RestaurantDashboard'

// Layout con header
function PublicLayout({ children, isAuth, user, onLogout, isLoading }) {
  return (
    <>
      <Header isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading} />
      {children}
      <CartSidebar isAuth={isAuth} />
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
          const cachedUser = localStorage.getItem('user')
          if (cachedUser) {
            try {
              const parsedCached = normalizeUserRole(JSON.parse(cachedUser))
              setUser(parsedCached)
            } catch (e) {}
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
  
  const handleLogout = () => { 
    console.log('🔴 Logout initiated')
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
            <PublicLayout 
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
            </PublicLayout>
          } />

          <Route path="/restaurants" element={
            <PublicLayout 
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
            </PublicLayout>
          } />

          <Route path="/subscription" element={
            <PublicLayout 
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
            </PublicLayout>
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
              <PublicLayout
                isAuth={isAuth}
                user={user}
                onLogout={handleLogout}
                isLoading={loading}
              >
                <RestaurantDashboard user={user} />
              </PublicLayout>
            </RoleRoute>
          } />

          <Route path="/restaurant" element={<Navigate to="/restaurant/dashboard" replace />} />

          {/* Rutas protegidas de usuario */}
          <Route path="/user/profile" element={
            !isAuth ? <Navigate to="/login" replace /> :
            <PublicLayout 
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
                <Profile user={user} onLogout={handleLogout} onUpdateProfile={u => {
                  setUser(u)
                  localStorage.setItem('user', JSON.stringify(u))
                }} />
              )}
            </PublicLayout>
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