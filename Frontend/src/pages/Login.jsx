/**
 * Archivo: src/pages/Login.jsx
 * Componente de inicio de sesión.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslate as useTranslation } from '../hooks/useTranslate';
import { ApiError, fetchJson } from '../api/fetchJson'
import Footer from '../components/Footer'
import './Auth.css'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [showEmailForm, setShowEmailForm] = useState(false)

  // Manejar el callback de Google (token en la URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userData = params.get('user')
    const errorParam = params.get('error')

    if (token && userData) {
      try {
        const user = JSON.parse(atob(userData))
        localStorage.setItem('token', token)
        onLogin?.(user)
        
        // Redirección basada en rol
        const role = user.role || user.rol
        if (role === 'admin') navigate('/admin')
        else if (role === 'restaurant') navigate('/restaurant/dashboard')
        else navigate('/')
      } catch (e) {
        setError('Error al procesar los datos de sesión.')
      }
    } else if (errorParam) {
      setError('Error en la autenticación con Google: ' + errorParam)
    }
  }, [navigate, onLogin])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError(null)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await fetchJson('/auth/login', {
        method: 'POST',
        body: { email: formData.email, password: formData.password }
      })

      // Guardar sesión y notificar a la app
      const token = data.data?.access_token || data.token
      const user = data.data?.user || data.user
      localStorage.setItem('token', token)
      onLogin?.(user)

      // Redirección basada en rol
      const role = user?.role || user?.rol
      if (role === 'admin') navigate('/admin')
      else if (role === 'restaurant') navigate('/restaurant/dashboard')
      else navigate('/')
      
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.error_connection'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header Centrado */}
      <header className="h-[80px] flex items-center justify-center bg-white border-b border-slate-100 z-50">
        <Link to="/" className="logo-satisfy text-4xl text-[#FF4B3E]">AppiFood</Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sección Izquierda: Imagen Decorativa */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url(/img/auth-bg.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-16">
            <h2 className="text-4xl font-black text-white leading-tight max-w-md">
              {t('login.hero_text') || "La mejor comida de tu ciudad, entregada en tu puerta."}
            </h2>
          </div>
        </div>

        {/* Sección Derecha: Formulario */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2">{t('login.heading') || "Ingresa a tu cuenta"}</h1>
                <p className="text-slate-500 font-medium">{t('login.subtitle') || "Accede para gestionar tus pedidos y favoritos."}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 animate-shake">
                  <i className="fas fa-exclamation-circle text-lg" /> {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
                    window.location.href = `${apiBase}/api/auth/google`
                  }}
                  className="w-full bg-white border-2 border-slate-100 hover:border-red-500/30 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {t('login.google_button') || "Continuar con Google"}
                </button>
                
                {!showEmailForm ? (
                  <button 
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full bg-slate-50 border-2 border-transparent hover:border-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-envelope text-slate-400" />
                    {t('login.continue_email') || "Continuar con mi correo"}
                  </button>
                ) : (
                  <div className="animate-fade-in space-y-5">
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-slate-300">Tus datos</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('login.email')}</label>
                        <input 
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                          placeholder="ejemplo@correo.com" required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('login.password')}</label>
                          <Link to="/forgot-password" title={t('login.forgot')} className="text-xs font-bold text-red-500 hover:underline">
                            {t('login.forgot_short') || "¿Olvidaste tu clave?"}
                          </Link>
                        </div>
                        <div className="relative">
                          <input 
                            type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium text-slate-700"
                            placeholder="••••••••" required
                          />
                          <button 
                            type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center px-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} className="accent-red-500 w-5 h-5 cursor-pointer" />
                          </div>
                          <span className="text-sm font-bold text-slate-600 group-hover:text-red-500 transition-colors">{t('login.remember')}</span>
                        </label>
                      </div>

                      <button 
                        type="submit" disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                      >
                        {loading ? <i className="fas fa-spinner fa-spin text-lg" /> : <i className="fas fa-sign-in-alt text-lg" />}
                        <span className="text-lg">{loading ? t('login.loading') : t('login.submit')}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <p className="text-center mt-10 text-slate-500 font-bold">
                {t('login.no_account')} <Link to="/register" className="text-red-500 hover:underline">{t('login.register_link')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}