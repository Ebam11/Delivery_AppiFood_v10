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
import ErrorBoundary from './components/ErrorBoundary'
import { useTranslate as useTranslation } from './hooks/useTranslate';
import { TranslateProvider } from './context/TranslateContext'
import { ThemeProvider } from './context/ThemeContext'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import LanguageSwitcher from './components/LanguageSwitcher'
import ThemeToggle from './components/ThemeToggle'

/**
 * Componente interno que usa los hooks de traducción y autenticación.
 * Debe estar DENTRO de TranslateProvider y ThemeProvider.
 */
function AppContent() {
  const { t } = useTranslation()

  const { 
    user, 
    loading, 
    isLoggingOut, 
    handleLogin, 
    handleLogout, 
    isAuth,
    setUser 
  } = useAppInit()

  if (isLoggingOut) {
    return <LoadingScreen message={t('app.loggingOut', { defaultValue: 'Cerrando sesión...' })} />
  }

  return (
    <ErrorBoundary name="App">
      <CartProvider>
        <BrowserRouter>
          <AppRoutes 
            user={user} 
            isAuth={isAuth} 
            loading={loading} 
            handleLogin={handleLogin} 
            handleLogout={handleLogout}
            setUser={setUser}
          />
          <PWAInstallPrompt />
          
          {/* Floating settings pill for Language & Dark Mode */}
          <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-800/80 transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-slate-900">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <TranslateProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </TranslateProvider>
  )
}