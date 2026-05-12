/**
 * Archivo: src/pages/Login.jsx
 * Componente de inicio de sesión.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

    // Guardar token Y usuario juntos para que useAppInit
    // pueda restaurar el rol aunque /api/me falle al recargar
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Notificar a la app con el objeto usuario completo
    onLogin?.(data.user)

    // Redirección basada en rol
    const role = data.user?.role || data.user?.rol
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
          <div className="text-center mb-10">
            <Link to="/" className="logo-satisfy text-4xl mb-4 inline-block">AppiFood</Link>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{t('login.heading') || "¡Hola de nuevo!"}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">{t('login.subtitle') || "Accede a tu cuenta para pedir."}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border border-red-100 animate-fade-in">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('login.email')}</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
                placeholder="ejemplo@correo.com" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('login.password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/30 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-medium"
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

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} className="accent-red-500 w-4 h-4" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-red-500 transition-colors">{t('login.remember')}</span>
              </label>
              <Link to="/forgot-password" title={t('login.forgot')} className="text-sm font-bold text-red-500 hover:underline">
                {t('login.forgot_short') || "¿Olvidaste tu clave?"}
              </Link>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-sign-in-alt" />}
              {loading ? t('login.loading') : t('login.submit')}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 font-medium">
            {t('login.no_account')} <Link to="/register" className="text-red-500 font-black hover:underline">{t('login.register_link')}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}