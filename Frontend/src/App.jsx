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
import { useEffect } from 'react'
import { useTranslate as useTranslation } from './hooks/useTranslate';
import { TranslateProvider } from './context/TranslateContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import LanguageSwitcher from './components/LanguageSwitcher'
import ThemeToggle from './components/ThemeToggle'

/**
 * Componente interno que usa los hooks de traducción y autenticación.
 * Debe estar DENTRO de TranslateProvider y ThemeProvider.
 */
import { useState } from 'react'
import { useCart } from './context/useCart'

function AppContent() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const { isOpen: isCartOpen } = useCart()
  const [isNearFooter, setIsNearFooter] = useState(false)

  const { 
    user, 
    loading, 
    isLoggingOut, 
    handleLogin, 
    handleLogout, 
    isAuth,
    setUser 
  } = useAppInit()

  // Controlar las clases del DOM centralizadamente
  useEffect(() => {
    const root = window.document.documentElement;
    if (!isAuth || !isDark) {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [isAuth, isDark]);

  // Detectar scroll cerca del footer
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 180 // Distancia al final de la página antes de ocultar
      const totalHeight = document.documentElement.scrollHeight
      const currentScroll = window.innerHeight + window.scrollY
      
      if (totalHeight - currentScroll < threshold) {
        setIsNearFooter(true)
      } else {
        setIsNearFooter(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoggingOut) {
    return <LoadingScreen message={t('app.loggingOut', { defaultValue: 'Cerrando sesión...' })} />
  }

  // Ocultar botones flotantes si el carrito está abierto o estamos cerca del footer
  const shouldHideFloating = isCartOpen || isNearFooter

  return (
    <ErrorBoundary name="App">
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
        
        {/* Floating pill: Language switcher — sits at bottom-right stacked below chatbot, hides on scroll/cart */}
        <div 
          className={`fixed bottom-4 right-5 sm:right-8 z-[9999] flex items-center gap-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-1 py-1 rounded-full shadow-lg border border-gray-100 dark:border-slate-800/80 transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-slate-900 ${shouldHideFloating ? 'opacity-0 pointer-events-none scale-90 translate-y-4' : 'opacity-100'}`}
        >
          <LanguageSwitcher />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <TranslateProvider>
      <ThemeProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ThemeProvider>
    </TranslateProvider>
  )
}