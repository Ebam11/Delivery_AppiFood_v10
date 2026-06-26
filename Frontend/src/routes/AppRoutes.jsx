import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // <- CORREGIDO
import PublicLayout from '../components/layout/PublicLayout'
import RestaurantLayout from '../components/layout/RestaurantLayout'
import LoadingScreen from '../components/layout/LoadingScreen'
import { getHomePathByRole } from '../utils/appHelpers'

// Carga perezosa de páginas para optimizar el bundle
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const RestaurantLogin = lazy(() => import('../pages/RestaurantLogin'))
const Register = lazy(() => import('../pages/Register'))
const RegisterRestaurant = lazy(() => import('../pages/RegisterRestaurant'))
const Profile = lazy(() => import('../pages/Profile'))
const Orders = lazy(() => import('../pages/Orders').then(m => ({ default: m.Orders })))
const OrderDetail = lazy(() => import('../pages/OrderDetail').then(m => ({ default: m.OrderDetail })))
const Cart = lazy(() => import('../pages/Cart').then(m => ({ default: m.Cart })))
const Checkout = lazy(() => import('../pages/Checkout').then(m => ({ default: m.Checkout })))
const Favorites = lazy(() => import('../pages/Favorites'))
const PaymentConfirmation = lazy(() => import('../pages/PaymentConfirmation').then(m => ({ default: m.PaymentConfirmation })))
const RestaurantDetail = lazy(() => import('../pages/RestaurantDetail').then(m => ({ default: m.RestaurantDetail })))
const HelpCenter = lazy(() => import('../pages/HelpCenter'))
const Support = lazy(() => import('../pages/Support'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const Subscription = lazy(() => import('../pages/Subscription'))
const Restaurants = lazy(() => import('../pages/Restaurants'))
const Coupons = lazy(() => import('../pages/Coupons'))
const Addresses = lazy(() => import('../pages/Addresses'))
const AddressForm = lazy(() => import('../pages/AddressForm'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const RestaurantDashboard = lazy(() => import('../pages/RestaurantDashboard'))
const RestaurantManagementPage = lazy(() => import('../pages/RestaurantManagementPage'))
const DriverDashboard = lazy(() => import('../pages/DriverDashboard'))
const Gamification = lazy(() => import('../pages/Gamification'))
const Offers = lazy(() => import('../pages/Offers'))

/**
 * Componente para proteger rutas según el rol del usuario.
 */
function RoleRoute({ user, allow = [], children }) {
  if (!user) return <Navigate to="/login" replace />
  const role = String(user?.role ?? user?.rol ?? 'user').toLowerCase()
  const normalizedRole = role === 'customer' ? 'user' : role
  
  if (!allow.includes(normalizedRole)) return <Navigate to="/" replace />
  return children
}

/**
 * Wrappers para tipos de páginas comunes.
 */
const PublicPage = ({ children, isAuth, user, onLogout, isLoading }) => (
  <PublicLayout isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading}>
    {children}
  </PublicLayout>
)

const UserPage = ({ children, user, isAuth, onLogout, isLoading }) => (
  <RoleRoute user={user} allow={['user']}>
    <PublicPage isAuth={isAuth} user={user} onLogout={onLogout} isLoading={isLoading}>
      {children}
    </PublicPage>
  </RoleRoute>
)

/**
 * Definición central de rutas de la aplicación.
 */
export default function AppRoutes({ user, isAuth, loading, handleLogin, handleLogout, setUser }) {
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={
          loading ? (
            <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={true}>
              <LoadingScreen />
            </PublicPage>
          ) : isAuth && user && user.role !== 'user' ? (
            <Navigate to={getHomePathByRole(user)} replace />
          ) : (
            <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={false}>
              <Home isAuth={isAuth} />
            </PublicPage>
          )
        } />

        {/* Exploración */}
        <Route path="/restaurants" element={
          <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
            {loading ? <LoadingScreen /> : <Restaurants />}
          </PublicPage>
        } />
        
        <Route path="/restaurants/:id" element={
          <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
            <RestaurantDetail />
          </PublicPage>
        } />

        {/* Soporte y Ayuda */}
        <Route path="/subscription" element={
          <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
            {loading ? <LoadingScreen /> : <Subscription isAuth={isAuth} user={user} />}
          </PublicPage>
        } />
        
        <Route path="/support" element={<PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}><Support /></PublicPage>} />
        <Route path="/coupons" element={<PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}><Coupons /></PublicPage>} />
        <Route path="/offers" element={<PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}><Offers /></PublicPage>} />
        <Route path="/help-center" element={<PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}><HelpCenter /></PublicPage>} />

        {/* Autenticación */}
        <Route path="/login" element={isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <Register onLogin={handleLogin} />} />
        <Route path="/register-restaurant" element={isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <RegisterRestaurant onLogin={handleLogin} />} />
        <Route path="/restaurant/login" element={isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <RestaurantLogin onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={isAuth ? <Navigate to={getHomePathByRole(user)} replace /> : <ForgotPassword />} />

        {/* Panel Administrativo */}
        <Route path="/admin" element={
          <RoleRoute user={user} allow={['admin']}>
            <RestaurantLayout user={user}><AdminDashboard user={user} onLogout={handleLogout} /></RestaurantLayout>
          </RoleRoute>
        } />

        {/* Panel de Restaurante */}
        <Route path="/restaurant/dashboard" element={
          <RoleRoute user={user} allow={['restaurant']}>
            <RestaurantLayout user={user}><RestaurantDashboard user={user} onLogout={handleLogout} /></RestaurantLayout>
          </RoleRoute>
        } />

        {/* Panel de Repartidor */}
        <Route path="/driver/dashboard" element={
          <RoleRoute user={user} allow={['driver']}>
            <DriverDashboard user={user} onLogout={handleLogout} />
          </RoleRoute>
        } />

        <Route path="/restaurant/profile" element={
          <RoleRoute user={user} allow={['restaurant']}>
            <RestaurantLayout user={user}>
              <RestaurantManagementPage 
                title="Perfil del restaurante" 
                user={user} 
                onLogout={handleLogout} 
              />
            </RestaurantLayout>
          </RoleRoute>
        } />

        {/* Rutas de Usuario (Cliente) */}
        <Route path="/user/profile" element={
          <UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}>
            {loading ? <LoadingScreen /> : <Profile user={user} onLogout={handleLogout} onUpdateProfile={u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} />}
          </UserPage>
        } />

        <Route path="/user/orders" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Orders /></UserPage>} />
        <Route path="/user/orders/:id" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><OrderDetail /></UserPage>} />
        <Route path="/user/favorites" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Favorites /></UserPage>} />

        <Route path="/user/cart" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Cart /></UserPage>} />
        <Route path="/user/checkout" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Checkout /></UserPage>} />
        <Route path="/user/addresses" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Addresses /></UserPage>} />
        <Route path="/user/gamification" element={<UserPage user={user} isAuth={isAuth} onLogout={handleLogout} isLoading={loading}><Gamification /></UserPage>} />
        <Route path="/payment/confirmation/:orderId" element={
          <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
            <PaymentConfirmation />
          </PublicPage>
        } />

        {/* 404 - Not Found */}
        <Route path="*" element={
          <PublicPage isAuth={isAuth} user={user} onLogout={handleLogout} isLoading={loading}>
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <span className="text-8xl">🍔</span>
              <h1 className="text-3xl font-black text-gray-800">{t('app.pageNotFound') || "Página no encontrada"}</h1>
              <Link to={getHomePathByRole(user)} className="px-6 py-3 bg-[#FF4B3E] text-white rounded-full font-bold hover:bg-[#e03a2d] transition">
                {t('app.backToHome') || "Volver al inicio"}
              </Link>
            </div>
          </PublicPage>
        } />
      </Routes>
    </Suspense>
  )
}