/**
 * Archivo: src/App.jsx
 * Punto de entrada principal de la aplicación Frontend.
 * Gestiona la inicialización del contexto global y las rutas.
 */
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { useAppInit } from './hooks/useAppInit'
import AppRoutes from './routes/AppRoutes'
import LoadingScreen from './components/layout/LoadingScreen'

export default function App() {
  // Hook personalizado que contiene toda la lógica de inicialización y autenticación
  const { 
    user, 
    loading, 
    isLoggingOut, 
    handleLogin, 
    handleLogout, 
    isAuth,
    setUser 
  } = useAppInit()

  // Si se está cerrando sesión, mostramos una pantalla de espera
  if (isLoggingOut) {
    return <LoadingScreen message="Cerrando sesión..." />
  }

  return (
    <CartProvider>
      <BrowserRouter>
        {/* El componente AppRoutes maneja toda la definición de rutas y protecciones */}
        <AppRoutes 
          user={user} 
          isAuth={isAuth} 
          loading={loading} 
          handleLogin={handleLogin} 
          handleLogout={handleLogout}
          setUser={setUser}
        />
      </BrowserRouter>
    </CartProvider>
  )
}